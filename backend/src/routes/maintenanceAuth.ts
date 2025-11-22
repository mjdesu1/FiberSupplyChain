import express from 'express';
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Simple maintenance login (bypasses reCAPTCHA and other checks)
router.post('/maintenance-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 1. Find the officer by email
    const { data: officer, error } = await supabase
      .from('organization')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error || !officer) {
      console.error('Officer not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 2. Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, officer.password_hash);
    if (!isPasswordValid) {
      console.error('Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3. Check if user is super admin
    if (!officer.is_super_admin) {
      console.error('Not a super admin:', email);
      return res.status(403).json({ error: 'Only Super Admins can login during maintenance' });
    }

    // 4. Create tokens
    const accessToken = jwt.sign(
      { 
        id: officer.officer_id, 
        email: officer.email, 
        userType: 'officer',
        isSuperAdmin: true 
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: officer.officer_id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
      { expiresIn: '7d' }
    );

    // 5. Update last login
    await supabase
      .from('organization')
      .update({ last_login: new Date() })
      .eq('officer_id', officer.officer_id);

    // 6. Return success response
    res.json({
      message: 'Login successful',
      data: {
        user: {
          officerId: officer.officer_id,
          email: officer.email,
          fullName: officer.full_name,
          isSuperAdmin: true,
          isActive: officer.is_active,
          lastLogin: officer.last_login
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Maintenance login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
