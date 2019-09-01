var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var rateLimit = require('express-rate-limit');

// importing routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user.routes');
var institutionsRouter = require('./routes/institution.routes');
var eventsRouter = require('./routes/event.routes');
var lecturesRouter = require('./routes/lecture.routes');
var enrolledsRouter = require('./routes/enrolleds.routes');

var apiRouter = require('./routes/api.routes');
var saciAPI = require('./routes/saci.api');

var app = express();

app.disable('x-powered-by');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('*', (req, res, next) => {
  res.locals.fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  next()
});

const webLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Muitas requisições deste endereço'
});

app.use('/', webLimiter)

// setting routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/institutions', institutionsRouter);

app.use('/events', eventsRouter);
app.use('/events/:id/lectures', lecturesRouter);
app.use('/events/:id/enrolleds', enrolledsRouter);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // limit each IP to 100 requests per windowMs
  message: {error:true, errors:['Muitas requisições deste endereço']}
});

app.use('/api', apiLimiter);

app.use('/api/v1', apiRouter, (req, res) => {
  res.json({error: true, errors: [req.message || 'What the fuck has happened?']})
});

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
