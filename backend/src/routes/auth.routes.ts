import { Router } from 'express';
import { body } from 'express-validator';
import * as ctrl from '../controllers/auth.controller';
import { authLimiter } from '../middleware/rateLimit';
import { authenticate } from '../middleware/auth';
import passport from 'passport';

const router = Router();

// ── Local auth ────────────────────────────────────────────
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().isLength({ min: 2, max: 50 }),
  ],
  ctrl.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  ctrl.login
);

router.post('/refresh', ctrl.refreshToken);
router.post('/logout', authenticate, ctrl.logout);
router.get('/me', authenticate, ctrl.me);
router.post('/forgot-password', authLimiter, ctrl.forgotPassword);
router.post('/reset-password', authLimiter, ctrl.resetPassword);
router.get('/verify-email/:token', ctrl.verifyEmail);

// ── Google OAuth ──────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/login?error=google' }),
  ctrl.googleCallback
);

export default router;
