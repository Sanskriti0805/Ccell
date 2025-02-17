const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');

const app = express();
const port = 3000;

// Your Google OAuth credentials
const GOOGLE_CLIENT_ID = '930981639502-3oc5kdmjlq7agvishsfgjou4udcs5cdv.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

// Dummy database access function for retrieving image URL by ID
const db = {
  getImageUrl: (id) => {
    return 'https://placeholder-image.com/640x480'; // Placeholder for now
  }
};
const validApiKeys = [
  process.env.API_KEY // Use the API key from the .env file
];

function checkApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (validApiKeys.includes(apiKey)) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Invalid API Key' });
  }
}


// Configure session middleware
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://ccell-6bbfwlqdr-sanskritis-projects-1c538732.vercel.app'
},
function (accessToken, refreshToken, profile, done) {
  const email = profile.emails[0].value;
  if (email.endsWith('@lnmiit.ac.in')) {
    return done(null, profile);
  } else {
    return done(new Error('Invalid user'));
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Protect this route with Google OAuth 2.0 authentication
app.get('/image/:id', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  const imageUrl = db.getImageUrl(id);
  if (imageUrl) {
    res.json({ image: imageUrl });
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
