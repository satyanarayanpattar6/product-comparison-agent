import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import agentRouter from './routes/agent.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use(agentRouter); // Registers your /api/compare route

app.get('/health', (req, res) => res.status(200).send('OK'));

app.listen(5000, '0.0.0.0', () => console.log('Backend on port 5000'));