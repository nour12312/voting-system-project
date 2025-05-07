const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ 'oauth.google': profile.id });
      
      if (!user) {
        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // Link Google account to existing user
          user.oauth.google = profile.id;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            email: profile.emails[0].value,
            name: profile.displayName,
            'oauth.google': profile.id,
            password: await bcrypt.hash(Math.random().toString(36), 10)
          });
        }
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ 'oauth.github': profile.id });
      
      if (!user) {
        // Check if user exists with the same email
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await User.findOne({ email });
          
          if (user) {
            // Link GitHub account to existing user
            user.oauth.github = profile.id;
            await user.save();
          }
        }
        
        if (!user) {
          // Create new user
          user = await User.create({
            email: email || `${profile.username}@github.com`,
            name: profile.displayName || profile.username,
            'oauth.github': profile.id,
            password: await bcrypt.hash(Math.random().toString(36), 10)
          });
        }
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
}

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport; 