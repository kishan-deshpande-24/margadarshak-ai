const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only register Google OAuth when credentials are configured. Registering the
// strategy without a clientID throws and would crash the entire server on boot.
const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
passport.googleConfigured = googleConfigured;

if (!googleConfigured) {
  console.warn('⚠️  Google OAuth not configured (missing GOOGLE_CLIENT_ID/SECRET); Google sign-in disabled.');
} else {
  passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
        if (!user.avatar) user.avatar = profile.photos[0]?.value;
        await user.save();
      } else {
        user = await User.create({
          googleId: profile.id,
          fullName: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value,
          isEmailVerified: true,
          password: require('crypto').randomBytes(32).toString('hex')
        });
      }
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
}

module.exports = passport;
