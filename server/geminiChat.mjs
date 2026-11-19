import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export const GEMINI_CHAT_MODEL = 'gemini-4-hydrogen';

export const SERENDIB_SYSTEM_INSTRUCTION = `You are the private Gemmology & Client Concierge for Serendib Reserve (Pvt) Ltd, a Sri Lankan fine gemstone house ("Most Quality Gems of Sri Lanka").

VERIFIED COMPANY FACTS (use strictly; NEVER invent prices, founding years, staff names, awards, or lab numbers):
- Company: Serendib Reserve (Pvt) Ltd (serendibreserve.com)
- Headquarters: 121 Hunupitiya Lake Rd, Colombo 00200, Sri Lanka
- Phone & WhatsApp: +94 71 14 54 935
- Email: info@serendibreserve.com
- Name heritage: "Serendib" is the ancient Arabic name for Sri Lanka (root of "serendipity"); "Reserve" signifies held-back, finest-grade stones; "Serendibite" is a rare mineral first discovered in Sri Lanka in 1902.
- Sri Lankan gem regions featured: Ratnapura (City of Gems, alluvial illama), Elahera (Amban Ganga sapphires & spinels), Okkampitiya (residual sapphire & garnet beds), Matale & Balangoda (Highland Complex lotus padparadscha & corundum), Kalutara – Beruwala Belt (historic trading & Meetiyagoda Moonstone).
- Key specialties: Ceylon Blue Sapphire (Royal & Cornflower), Padparadscha Sapphire, Star Sapphire, Yellow/Pink/White/Colour-Change Sapphires, Ceylon Ruby, Ceylon Alexandrite, Cat's Eye Chrysoberyl, Spinel, Garnets, Aquamarine & Fine Beryl, Ceylon Tourmaline, White & Imperial-Tone Topaz, Ceylon Zircon, Amethyst & Citrine, Ceylon Blue Moonstone, Serendibite, Peridot, Sphene, Kyanite, Apatite & Iolite.
- Standards: Natural & untreated options with full thermal/treatment disclosure, ethical licensed Sri Lankan sourcing, independent lab certification upon request, and insured worldwide consignments from Colombo.

BEHAVIOR:
- Answer clearly, warmly, and concisely in a refined, knowledgeable voice (typically 2–4 concise sentences or brief bullet points unless a deeper technical explanation is requested).
- Answer ANY question about Serendib Reserve, Ceylon gemstones, gemmology (Mohs hardness, refractive index, pleochroism, asterism, chatoyancy, adularescence, lapidary cuts, treatments, care), or sourcing inquiries.
- If asked for live stone prices, availability, or bespoke quotes, explain transparently that pricing is quoted individually based on carat, hue, clarity, and origin, and invite the visitor to reach our Colombo specialists via the Inquiries page, WhatsApp (+94 71 14 54 935), or info@serendibreserve.com.
- Keep answers clean and well-structured.`;

/**
 * Validates and normalizes incoming chat messages & bounded conversation history.
 */
export function parseChatPayload(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Request body must be a JSON object.' };
  }

  const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';
  if (!rawMessage) {
    return { ok: false, error: 'Please enter a question before sending.' };
  }
  if (rawMessage.length > 2000) {
    return { ok: false, error: 'Message exceeds the 2,000 character limit.' };
  }

  const rawHistory = Array.isArray(body.history) ? body.history : [];
  const history = [];
  for (const item of rawHistory.slice(-14)) {
    if (!item || typeof item !== 'object') continue;
    const role = item.role === 'model' ? 'model' : item.role === 'user' ? 'user' : null;
    const text = typeof item.text === 'string' ? item.text.trim() : '';
    if (role && text) {
      history.push({ role, parts: [{ text: text.slice(0, 2000) }] });
    }
  }

  return { ok: true, message: rawMessage, history };
}

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('Gemini API key is not configured on the server.');
    err.status = 503;
    throw err;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Extracts a clean, human-readable error message from @google/genai Error payloads
 * without hiding or masking the real upstream status.
 */
export function formatGeminiError(err) {
  const raw = err instanceof Error && err.message ? err.message : String(err || '');
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error?.message) {
      const inner = parsed.error.message;
      try {
        const nested = JSON.parse(inner);
        if (nested?.error?.message) return nested.error.message;
      } catch {
        return inner;
      }
    }
    if (typeof parsed?.message === 'string') return parsed.message;
  } catch {
    // Plain non-JSON error message
  }
  return raw || 'Unable to reach Gemini right now. Please try again shortly.';
}

/**
 * Queries Gemini multi-turn chat on the server side with exponential backoff retry on transient 5xx/429.
 */
export async function generateGeminiReply({ message, history }) {
  const ai = getClient();

  const chat = ai.chats.create({
    model: GEMINI_CHAT_MODEL,
    history,
    config: {
      systemInstruction: SERENDIB_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });

  let lastError;
  const delays = [500, 1200];
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const response = await chat.sendMessage({ message });
      const text = (response.text || '').trim();
      if (!text) {
        throw new Error('Received an empty response from Gemini.');
      }
      return { reply: text, model: GEMINI_CHAT_MODEL };
    } catch (err) {
      lastError = err;
      const status = err?.status || err?.code;
      if (status && status < 500 && status !== 429) {
        break;
      }
      if (attempt < delays.length) {
        await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
      }
    }
  }
  throw lastError;
}

/**
 * Shared Express route handler for POST /api/chat (supports ?stream=1 SSE streaming or JSON).
 */
export async function handleChatRequest(req, res) {
  const parsed = parseChatPayload(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const wantsStream = req.query?.stream === '1' || req.headers.accept?.includes('text/event-stream');

  if (wantsStream) {
    try {
      const ai = getClient();
      const chat = ai.chats.create({
        model: GEMINI_CHAT_MODEL,
        history: parsed.history,
        config: {
          systemInstruction: SERENDIB_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      let streamResponse;
      let lastErr;
      const delays = [500, 1200];
      for (let attempt = 0; attempt <= delays.length; attempt++) {
        try {
          streamResponse = await chat.sendMessageStream({ message: parsed.message });
          break;
        } catch (err) {
          lastErr = err;
          const status = err?.status || err?.code;
          if (status && status < 500 && status !== 429) {
            break;
          }
          if (attempt < delays.length) {
            await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
          }
        }
      }
      if (!streamResponse) {
        throw lastErr;
      }

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      let fullText = '';
      for await (const chunk of streamResponse) {
        const delta = chunk?.text || '';
        if (delta) {
          fullText += delta;
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
      }
      if (!fullText.trim()) {
        res.write(`data: ${JSON.stringify({ error: 'Received an empty response from Gemini.' })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ done: true, model: GEMINI_CHAT_MODEL })}\n\n`);
      }
      res.end();
      return;
    } catch (err) {
      const message = formatGeminiError(err);
      if (!res.headersSent) {
        const status = typeof err?.status === 'number' && err.status >= 400 ? err.status : 500;
        res.status(status).json({ error: message });
      } else {
        res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
        res.end();
      }
      return;
    }
  }

  try {
    const result = await generateGeminiReply(parsed);
    res.json(result);
  } catch (err) {
    const status = typeof err?.status === 'number' && err.status >= 400 ? err.status : 500;
    res.status(status).json({ error: formatGeminiError(err) });
  }
}
