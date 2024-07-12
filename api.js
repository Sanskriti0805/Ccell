const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const app = express();
const port = 3000;

// Replace with your Google OAuth credentials
const GOOGLE_CLIENT_ID = '930981639502-3oc5kdmjlq7agvishsfgjou4udcs5cdv.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const CALLBACK_URL = 'http://localhost:3000/auth/google/callback';

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: CALLBACK_URL
},
(accessToken, refreshToken, profile, cb) => {
  if (profile.emails[0].value.endsWith('.lnmiit.ac.in')) {
    return cb(null, profile);
  } else {
    return cb(new Error('Invalid user'));
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Hello, ${req.user.displayName}`);
  } else {
    res.send('Hello, World!');
  }
});

// rn existing code to retrieve image URL from the database
const db = {
  getImageUrl(id) {
    return 'https://placeholder-image.com/640x480'; // Placeholder for now
  }
};

app.get('/image/:id', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.params;
    const imageUrl = db.getImageUrl(id);

    if (imageUrl) {
      res.json({ image: imageUrl });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Error fetching image data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
