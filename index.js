const config = require('./config');
const express = require('express'),
  http = require('http'),
  layouts = require('express-ejs-layouts'),
  app = express(),
  mongoose = require('mongoose'),
  methodOverride = require('method-override'),
  passport = require('passport'),
  cookieParser = require('cookie-parser')(config.secret),
  expressSession = require('express-session'),
  connectFlash = require('connect-flash');

const server = http.createServer(app);
const io = require('socket.io')(server);
const User = require('./models/user');

const roomManager = require('./lib/roommanager')(io);

var MongoDBStore = require('connect-mongodb-session')(expressSession);
var store = new MongoDBStore({
  uri: config.dburi,
  collection: 'sessions'
});

mongoose.connect(
  config.dburi,
  { useNewUrlParser: true }
);
mongoose.set('useCreateIndex', true);

app.set('port', process.env.PORT || config.port || 3000);
app.set('view engine', 'ejs');

// app.use(
//   methodOverride('_method', {
//     methods: ['POST', 'GET']
//   })
// );

app.use(layouts);
app.use(express.static('static'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser);
const session = expressSession({
  secret: config.secret,
  cookie: {
    maxAge: 4000000
  },
  resave: false,
  saveUninitialized: false,
  store: store
});
app.use(session);
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

io.use((socket, next) => {
  session(socket.request, {}, next);
});
// io.use(passportSocketIo.authorize({
//   cookieParser: cookieParser,
//   key: 'connect.sid',
//   secret: ,
//   store: store,
//   passport: passport,
//   fail: function (data, message, error, accept) {
//     if(error) throw new Error(message);
//     return accept();
//   }
// }));

const homeRouter = require('./routes/home'),
  roomsRouter = require('./routes/rooms')(io),
  usersRouter = require('./routes/users'),
  dataRouter = require('./routes/data');

app.use('/', homeRouter);
app.use('/r', roomsRouter);
app.use('/u', usersRouter);
app.use('/d', dataRouter);

app.get('/createRoom', (req, res) => {
  if (!req.isAuthenticated()) {
    res.send('must be signed in to make room');
  } else {
    res.render('createRoom');
  }
})

app.post('/createRoom', roomManager.createRoomHandler);

server.listen(app.get('port'), () => {
  console.log(`Server running at http://localhost:${app.get('port')}`);
});