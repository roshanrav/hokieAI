import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connect from './database/conn.js';
import router from './router/route.js';
import passport from 'passport';
import session from 'express-session';
import { OIDCStrategy } from 'passport-azure-ad';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';

import crypto from 'crypto';
import config from './config.js';
import fetch from 'node-fetch';


const app = express();

/** middlewares */
app.use(express.json({ limit: '10mb' })); // Increase the payload size limit
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by'); // less hackers know about our stack


const port = 8080;

const sessionSecret = crypto.randomBytes(32).toString('hex');

// Session setup
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new OAuth2Strategy({
    authorizationURL: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`, // Use 'common' for multi-tenant support
  tokenURL: `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    callbackURL: `http://localhost:${port}/auth/callback`,
    scope: ['openid', 'profile', 'offline_access', 'Calendars.Read', 'Calendars.ReadWrite']
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, { profile, accessToken, refreshToken });
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

/** HTTP GET Request */
app.get('/', (req, res) => {
    res.status(201).json("Home GET Request");
});

app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send('Not authenticated');
  const userId = req.user.profile.oid; // This may differ based on your setup
  console.log(userId)
  User.findById(userId, (err, user) => {
      if (err || !user) {
          return res.status(404).send('User not found');
      }
      res.json(user);
  });
});
/** api routes */
app.get('/auth', passport.authenticate('oauth2'));


app.get('/auth/callback', passport.authenticate('oauth2', {
    failureRedirect: '/'
  }), (req, res) => {
    res.redirect('http://localhost:3001/profile');// Redirect to profile page on frontend after successful login
  });
  
  
  // Route to fetch calendar events
  app.get('/api/calendar', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send('Not authenticated');
  
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${req.user.accessToken}`
      }
    };
  
    fetch('https://graph.microsoft.com/v1.0/me/events', options)
      .then(response => response.json())
      .then(data => res.json(data))
      .catch(error => res.status(500).json({ error }));
  });
  
app.use('/api', router);

/** start server only when we have valid connection */
connect().then(() => {
    console.log("enter panniyachu")
    try {
        app.listen(port, () => {
            console.log(`Server connected to http://localhost:${port}`);
        })
    } catch (error) {
        console.log('Cannot connect to the server')
    }
}).catch(error => {
    console.log("Invalid database connection da!");
    console.log(error);
})


