import { PassportStatic } from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './index';
import { prisma } from '../db/prisma';

export function configurePassport(passport: PassportStatic) {
  // ── JWT Strategy ──────────────────────────────────────────
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.jwt.secret,
      },
      async (payload, done) => {
        try {
          const user = await prisma.user.findUnique({ where: { id: payload.userId } });
          if (!user) return done(null, false);
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  // ── Google OAuth Strategy ─────────────────────────────────
  if (config.google.clientId) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.google.clientId,
          clientSecret: config.google.clientSecret,
          callbackURL: config.google.callbackUrl,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error('No email from Google'), false);

            let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

            if (!user) {
              user = await prisma.user.findUnique({ where: { email } });
              if (user) {
                user = await prisma.user.update({
                  where: { id: user.id },
                  data: { googleId: profile.id, isEmailVerified: true },
                });
              } else {
                user = await prisma.user.create({
                  data: {
                    email,
                    name: profile.displayName || email.split('@')[0],
                    googleId: profile.id,
                    avatar: profile.photos?.[0]?.value,
                    isEmailVerified: true,
                  },
                });
              }
            }
            return done(null, user);
          } catch (err) {
            return done(err as Error, false);
          }
        }
      )
    );
  }
}
