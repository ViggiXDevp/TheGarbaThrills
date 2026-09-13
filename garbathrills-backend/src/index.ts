import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import swipeRoutes from './routes/swipe';
import matchesRoutes from './routes/matches';
import chatRoutes from './routes/chat';
import blockRoutes from './routes/block';
import reportRoutes from './routes/report';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// API responses should never be cached by the browser — every request must
// hit the server fresh. Without this, browsers can silently reuse stale
// responses (served as 304 Not Modified) for GET requests, which is
// especially dangerous for things like chat/profile data that change often.
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/block', blockRoutes);
app.use('/api/report', reportRoutes);

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
