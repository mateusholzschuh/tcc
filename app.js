var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var mongoSession = require('connect-mongodb-session')(session);
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('connect-flash');

var config = require('./config');

// middlewares
var rateLimit = require('express-rate-limit');
var isAuth = require('./middlewares/is-auth');

// importing routers
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth.routes');
var usersRouter = require('./routes/user.routes');
var institutionsRouter = require('./routes/institution.routes');
var eventsRouter = require('./routes/event.routes');
// var lecturesRouter = require('./routes/lecture.routes');
// var enrolledsRouter = require('./routes/enrolleds.routes');

var apiRouter = require('./routes/api.routes');
var saciAPI = require('./routes/saci.api');

var app = express();

var store = new mongoSession({
  uri: config.MONGODB_URI,
  collection: 'sessions'
});

// Catch errors
store.on('error', function(error) {
  console.log(error);
});

app.disable('x-powered-by');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'session-secret-35431651354',
  store: store,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 60 * 60 * 1000
  },
}));  
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use('*', (req, res, next) => {
  res.locals.fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  next()
});

/*******************
 * Rotas API
 ******************/

// rate-limit protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // limit each IP to 100 requests per windowMs
  message: {error:true, errors:['Muitas requisições deste endereço']}
});

app.use('/api', apiLimiter);

// routes
app.use('/api/v1', apiRouter, (req, res) => {
  res.json({error: true, errors: [req.message || 'What the fuck has happened?']})
});

// SACI API *
const open = false;
const SACI_TOKEN = process.env.SACI_TOKEN || 'saci';

app.use('/api/saci', (req, res, next) => {
  if (open) {
    next()
    return
  }

  if(req.headers.authorization == 'Bearer '.concat(SACI_TOKEN)) 
    next()
  else
    res.json({ error: true, errors: ['Opa! Esta rota não é permitida'], status: 401 });
  
}, 

saciAPI,

(req, res) => {
  res.json({error: true, errors: ['Opa! Rota inválida'], status: 404})
});

app.use('/api/?*', (req, res) => {
  res.json({error: true, errors: ['Opa! Rota inválida'], status: 404})
});

/*******************
 * Rotas WEB
 ******************/

// rate-limit protection
const webLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Muitas requisições deste endereço'
});

app.use('/', webLimiter)

// setting routes
app.use('/', authRouter)
app.use('/', isAuth, indexRouter);
app.use('/users', usersRouter);
app.use('/institutions', institutionsRouter);

app.use('/events', eventsRouter);
app.use('/limpa', (req, res) => {
  require('./models/event.model').updateMany({}, { enrolleds: [] }).exec()
  require('./models/enrollment.model').remove({}).exec()
})
// app.use('/events/:id/lectures', lecturesRouter);
// app.use('/events/:id/enrolleds', enrolledsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
