// server.mjs
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 5000;

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY || '205cc10fe94a4be996faa568deeef3c5';

app.use(cors());
app.use(express.json());

app.get('/api/token', async (req, res) => {
  try {
    const response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Failed to fetch token:', err);
    res.status(500).json({ error: 'Failed to fetch token' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
