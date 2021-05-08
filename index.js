const express = require('express'),
  layouts = require('express-ejs-layouts'),
  app = express(),
  mongoose = require('mongoose'),
  methodOverride = require('method-override'),
  passport = require('passport'),
  cookieParser = require('cookie-parser'),
  expressSession = require('express-session'),
  connectFlash = require('connect-flash'),
  User = require('./models/user'),
  homeRouter = require('./routes/home');

mongoose.connect(
  'mongodb://localhost:27017/puzzl',
  { useNewUrlParser: true }
);
mongoose.set('useCreateIndex', true);

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');

app.use(
  methodOverride('_method', {
    methods: ['POST', 'GET']
  })
);

app.use(layouts);
app.use(express.static('static'));
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(express.json());

app.use(cookieParser('abcdefg123'));
app.use(
  expressSession({
    secret: 'abcdefg123',
    cookie: {
      maxAge: 4000000
    },
    resave: false,
    saveUninitialized: false
  })
);
app.use(connectFlash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.user = req.user;
  res.locals.flash = req.flash();
  next();
});

app.use('/', homeRouter);

app.listen(app.get('port'), () => {
  console.log(`Server running at http://localhost:${app.get('port')}`);
});