import express, { Request, Response } from 'express';
import { queryOne } from '../db.js';
import { comparePassword, generateToken, authenticateAdmin, AuthRequest } from '../auth.js';

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await queryOne<{
      id: string;
      email: string;
      passwordHash: string;
      name: string;
      role: string;
    }>('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    const token = generateToken(tokenPayload);

    // Set cookie for browser session support
    res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 3600}`);

    res.json({
      success: true,
      token,
      user: tokenPayload
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', authenticateAdmin, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router;
