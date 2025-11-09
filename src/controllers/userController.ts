import { Response } from 'express';
import { User } from '../models';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { RegisterUserInput, LoginUserInput, UpdateUserInput } from '../utils/validation';

export const registerUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, username, password, bio, image_url } = req.body as RegisterUserInput;

    const existingUser = await User.findOne({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const existingUsername = await User.findOne({
      where: {
        username,
      },
    });

    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const user = await User.create({
      email,
      username,
      password,
      bio,
      image_url,
    });

    const token = generateToken(user.id);

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        bio: user.bio,
        image_url: user.image_url,
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Server error during registration' });
  }
};

export const loginUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body as LoginUserInput;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        bio: user.bio,
        image_url: user.image_url,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = generateToken(req.user.id);

    return res.status(200).json({
      user: {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        bio: req.user.bio,
        image_url: req.user.image_url,
        token,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const updates = req.body as UpdateUserInput;

    if (updates.email && updates.email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email: updates.email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    if (updates.username && updates.username !== req.user.username) {
      const existingUsername = await User.findOne({ where: { username: updates.username } });
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    await req.user.update(updates);

    const token = generateToken(req.user.id);

    return res.status(200).json({
      user: {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        bio: req.user.bio,
        image_url: req.user.image_url,
        token,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Server error during update' });
  }
};
