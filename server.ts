import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { handleChatRequest } from './server/geminiChat.mjs';
import {
  getAuctionUploadsDir,
  handleDemoAuctionManifest,
  handleEmailDispatch,
  handleServerTime,
  handleUploadGemImage,
} from './server/auctionApi.mjs';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '6mb' }));

// Serve uploaded auction gemstone media
app.use('/uploads/auctions', express.static(getAuctionUploadsDir()));

// Server-side Gemini AI concierge endpoint
app.post('/api/chat', handleChatRequest);

// Server-side authoritative clock, demo asset manifest, image upload & email dispatch
app.get('/api/time', handleServerTime);
app.get('/api/auctions/demo-manifest', handleDemoAuctionManifest);
app.post('/api/uploads/gem-image', handleUploadGemImage);
app.post('/api/notify/email', handleEmailDispatch);

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serendib Reserve dev server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
