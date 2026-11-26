import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const UPLOAD_DIR = path.join(ROOT_DIR, 'public', 'uploads', 'auctions');
const CONFIG_PATH = path.join(ROOT_DIR, 'firebase-applet-config.json');

let cachedProjectId = '';
function getFirebaseProjectId() {
  if (cachedProjectId) return cachedProjectId;
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    cachedProjectId = String(parsed.projectId || '');
  } catch {
    cachedProjectId = '';
  }
  return cachedProjectId;
}

let cachedCerts = null;
let cachedCertsExpiresAt = 0;

async function fetchGooglePublicCerts() {
  const now = Date.now();
  if (cachedCerts && now < cachedCertsExpiresAt) {
    return cachedCerts;
  }
  const resp = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );
  if (!resp.ok) {
    throw new Error('Unable to fetch Firebase public signing certificates.');
  }
  const certs = await resp.json();
  const cacheControl = resp.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const ttlSec = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
  cachedCerts = certs;
  cachedCertsExpiresAt = now + Math.max(60, ttlSec) * 1000;
  return certs;
}

function decodeBase64Url(segment) {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
  const mod = padded.length % 4;
  const fixed = mod === 0 ? padded : padded + '='.repeat(4 - mod);
  return Buffer.from(fixed, 'base64');
}

export async function verifyFirebaseBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing authorization bearer token.');
  }
  const token = authHeader.slice(7).trim();
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid Firebase ID token structure.');
  }

  const [headerB64, payloadB64, sigB64] = parts;
  const header = JSON.parse(decodeBase64Url(headerB64).toString('utf8'));
  const payload = JSON.parse(decodeBase64Url(payloadB64).toString('utf8'));

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unsupported token signature algorithm.');
  }

  const projectId = getFirebaseProjectId();
  if (!projectId) {
    throw new Error('Firebase project configuration is missing on server.');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.aud !== projectId) {
    throw new Error('Token audience mismatch.');
  }
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error('Token issuer mismatch.');
  }
  if (typeof payload.exp !== 'number' || payload.exp <= nowSec) {
    throw new Error('Firebase ID token has expired.');
  }
  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new Error('Token missing subject.');
  }

  const certs = await fetchGooglePublicCerts();
  const certPem = certs[header.kid];
  if (!certPem) {
    throw new Error('Matching Firebase signing certificate not found.');
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${headerB64}.${payloadB64}`);
  verifier.end();

  const signature = decodeBase64Url(sigB64);
  if (!verifier.verify(certPem, signature)) {
    throw new Error('Invalid Firebase ID token signature.');
  }

  return {
    uid: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : '',
    emailVerified: payload.email_verified === true,
  };
}

export function handleServerTime(_req, res) {
  const now = Date.now();
  res.json({
    serverTimeMs: now,
    iso: new Date(now).toISOString(),
  });
}

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function handleUploadGemImage(req, res) {
  try {
    const caller = await verifyFirebaseBearerToken(req.headers.authorization);
    if (!caller.emailVerified) {
      return res.status(403).json({ error: 'Verified email required to upload media.' });
    }
    if (caller.email.toLowerCase() !== 'serendibreserve@gmail.com') {
      return res.status(403).json({ error: 'Only authorized administrators may upload auction lot media.' });
    }

    const { dataUrl } = req.body || {};
    if (typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Missing image data payload.' });
    }

    const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) {
      return res.status(400).json({ error: 'Unsupported image format. Use JPEG, PNG, or WebP.' });
    }

    const mime = match[1];
    const ext = MIME_EXT[mime];
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length === 0 || buffer.length > 4 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image file size must be between 1 byte and 4 MB.' });
    }

    // Magic-byte sanity check
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isWebp =
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP';

    if ((ext === 'jpg' && !isJpeg) || (ext === 'png' && !isPng) || (ext === 'webp' && !isWebp)) {
      return res.status(400).json({ error: 'Image bytes do not match declared file format.' });
    }

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const filename = `lot_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const targetPath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(targetPath, buffer);

    return res.json({ url: `/uploads/auctions/${filename}` });
  } catch (error) {
    return res.status(401).json({
      error: error instanceof Error ? error.message : 'Unauthorized upload attempt.',
    });
  }
}

export async function handleEmailDispatch(req, res) {
  try {
    const caller = await verifyFirebaseBearerToken(req.headers.authorization);
    if (!caller.emailVerified) {
      return res.status(403).json({ error: 'Verified account required.' });
    }

    const { to, subject, text } = req.body || {};
    if (typeof to !== 'string' || typeof subject !== 'string' || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid email notification payload.' });
    }

    // Security check: non-admin callers can only trigger transactional email to their own verified email
    if (
      caller.email.toLowerCase() !== 'serendibreserve@gmail.com' &&
      to.trim().toLowerCase() !== caller.email.toLowerCase()
    ) {
      return res.status(403).json({ error: 'Forbidden recipient target.' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.SMTP_FROM || 'Serendib Reserve <no-reply@serendibreserve.com>';

    if (!resendApiKey) {
      return res.json({
        sent: false,
        configured: false,
        message: 'In-app notification recorded; external email provider is not configured in environment variables.',
      });
    }

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to.trim()],
        subject: subject.slice(0, 180),
        text: text.slice(0, 4000),
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return res.status(502).json({ sent: false, configured: true, error: detail });
    }

    return res.json({ sent: true, configured: true });
  } catch (error) {
    return res.status(401).json({
      error: error instanceof Error ? error.message : 'Unauthorized notification call.',
    });
  }
}

export function getAuctionUploadsDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  return UPLOAD_DIR;
}

const DEMO_ASSET_FILES = [
  'demo-royal-blue-sapphire-front.webp',
  'demo-royal-blue-sapphire-side.webp',
  'demo-royal-blue-sapphire-macro.webp',
  'demo-padparadscha-sapphire-front.webp',
  'demo-padparadscha-sapphire-macro.webp',
  'demo-pigeon-blood-ruby-front.webp',
  'demo-colombian-emerald-front.webp',
  'demo-yellow-ceylon-sapphire-front.webp',
  'demo-natural-amethyst-front.webp',
  'demo-cats-eye-chrysoberyl-front.webp',
  'demo-completed-blue-sapphire-front.webp',
  'demo-completed-red-spinel-front.webp',
];

export function handleDemoAuctionManifest(_req, res) {
  const assets = DEMO_ASSET_FILES.map((filename) => {
    const absPath = path.join(UPLOAD_DIR, filename);
    let exists = false;
    let sizeBytes = 0;
    try {
      const stat = fs.statSync(absPath);
      exists = stat.isFile() && stat.size > 0;
      sizeBytes = stat.size;
    } catch {
      exists = false;
    }
    return {
      filename,
      url: `/uploads/auctions/${filename}`,
      exists,
      sizeBytes,
    };
  });

  const allAssetsReady = assets.every((a) => a.exists);
  res.json({
    serverTimeMs: Date.now(),
    lotCount: 9,
    liveCount: 1,
    upcomingCount: 6,
    completedCount: 2,
    lot01DemoBidCount: 7,
    imageCount: assets.length,
    allAssetsReady,
    assets,
  });
}
