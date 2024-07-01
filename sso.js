import express, { json } from "express";
import 'dotenv/config';
import session from 'express-session';
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
const app = express();
const port = 3030;

// Passport session setup
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

// Configure Google OAuth2 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      // Use profile information (e.g., profile.id, profile.displayName, etc.) to create or update user
      return done(null, profile);
    }
  )
);

// Middleware setup
app.use(json());
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(
      `<h1>Welcome ${req.user.displayName}</h1><a href="/logout">Logout</a>`
    );
    return;
  }
  res.send('<a href="/auth/google">Login with Google</a>');
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {console.log(err)}
  });
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
