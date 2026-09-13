import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { User } from '../models/User';
import { sendPasswordResetEmail } from '../utils/email';
import { AuthRequest } from '../middleware/auth';

const isProd = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const signToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign({ userId }, secret, { expiresIn });
};

const serializeUser = (user: InstanceType<typeof User>) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  gender: user.gender,
  lookingFor: user.lookingFor,
  age: user.age,
  bio: user.bio,
  interests: user.interests,
  photos: user.photos,
  profileComplete: user.profileComplete,
});

// ---------- Validation Schemas ----------

const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  gender: z.enum(['male', 'female', 'other']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ---------- Controllers ----------

export const signup = async (req: Request, res: Response): Promise<void> => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    return;
  }

  const { name, email, password, gender } = parsed.data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409).json({ message: 'An account with this email already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, passwordHash, gender });

  const token = signToken(user._id.toString());
  res.cookie('token', token, cookieOptions);

  res.status(201).json({
    user: serializeUser(user),
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const token = signToken(user._id.toString());
  res.cookie('token', token, cookieOptions);

  res.status(200).json({
    user: serializeUser(user),
  });
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token', { ...cookieOptions, maxAge: undefined });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.status(200).json({
    user: serializeUser(user),
  });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    return;
  }

  const { email } = parsed.data;
  const user = await User.findOne({ email });

  // Always respond the same way, whether or not the user exists, to avoid leaking which emails are registered
  if (!user) {
    res.status(200).json({
      message: 'If an account with that email exists, a reset link has been sent.',
    });
    return;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetLink);
  } catch (error) {
    console.error('Failed to send reset email:', error);
    res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
    return;
  }

  res.status(200).json({
    message: 'If an account with that email exists, a reset link has been sent.',
  });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    return;
  }

  const { token, password } = parsed.data;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    res.status(400).json({ message: 'Reset link is invalid or has expired' });
    return;
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
};
