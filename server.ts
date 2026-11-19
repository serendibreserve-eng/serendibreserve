import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { handleChatRequest } from './server/geminiChat.mjs';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

// Server-side Gemini AI concierge endpoint
app.post('/api/chat', handleChatRequest);

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
