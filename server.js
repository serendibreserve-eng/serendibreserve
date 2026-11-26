import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleChatRequest } from './server/geminiChat.mjs';
import {
  getAuctionUploadsDir,
  handleDemoAuctionManifest,
  handleEmailDispatch,
  handleServerTime,
  handleUploadGemImage,
} from './server/auctionApi.mjs';

const app = express();
app.use(express.json({ limit: '6mb' }));
app.use('/uploads/auctions', express.static(getAuctionUploadsDir()));

app.post('/api/chat', handleChatRequest);
app.get('/api/time', handleServerTime);
app.get('/api/auctions/demo-manifest', handleDemoAuctionManifest);
app.post('/api/uploads/gem-image', handleUploadGemImage);
app.post('/api/notify/email', handleEmailDispatch);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, 'dist');

// Serve static React/Vite production files
app.use(express.static(distPath));

// Support React Router routes and page refreshes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serendib Reserve running on port ${PORT}`);
});
