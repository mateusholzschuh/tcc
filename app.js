const createError = require('http-errors')
const express = require('express')
const session = require('express-session')
const mongoSession = require('connect-mongodb-session')(session)
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const flash = require('connect-flash')
const cors = require('cors')

const config = require('./config')

// middlewares
const rateLimit = require('express-rate-limit')
const isAuth = require('./middlewares/is-auth')

// importing routers
var publicRouter = require('./routes/public.routes')
var indexRouter = require('./routes/index')
var authRouter = require('./routes/auth.routes')
var usersRouter = require('./routes/user.routes')
var institutionsRouter = require('./routes/institution.routes')
var eventsRouter = require('./routes/event.routes')

var ajaxRouter = require('./routes/ajax-internal.routes')
var apiRouter = require('./routes/api')
var saciAPI = require('./routes/saci.api')

const app = express()

const store = new mongoSession({
  uri: config.MONGODB_URI,
  collection: 'sessions'
})

// Catch errors
store.on('error', function(error) {
  console.log(error)
})

app.disable('x-powered-by')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// app.set('env', 'prod')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(session({
  secret: 'session-secret-35431651354',
  store: store,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 2 * 60 * 60 * 1000 // 2h
  },
}))
app.use(flash())
app.use(express.static(path.join(__dirname, 'public')))

app.use('*', (req, res, next) => {
  res.locals.fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
  next()
})

/*******************
 * Rotas API
 ******************/

// rate-limit protection
const apiLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 min
  max: 100, // limit each IP to 100 requests per windowMs
  message: { errors:['Muitas requisições deste endereço'] }
})

app.use('/api', apiLimiter)

app.use('/api', apiRouter)

// SACI API *
const open = false
const SACI_TOKEN = process.env.SACI_TOKEN || 'saci'

app.use('/api/saci', cors(), (req, res, next) => {
  if (open) {
    return next()
  }

  if(req.headers.authorization == 'Bearer '.concat(SACI_TOKEN)) 
    next()
  else
    return res.json({ errors: ['Opa! Esta rota não é permitida'] }, 401)
  
}, 

saciAPI,

(req, res) => {
  return res.json({ errors: ['Opa! Rota inválida'] }, 404)
})

// catch errors
app.use('/api*', (req, res) => {
  return res.status(400).json({ errors: ['Opa! Rota inválida'] })
})

/*******************
 * Rotas WEB
 ******************/

// rate-limit protection
const webLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Muitas requisições deste endereço'
})

app.use('/', webLimiter)

// setting routes
app.use('/', publicRouter)
app.use('/', authRouter)
app.use('/', isAuth, (req, res, next) => {res.locals.error = req.flash('error') || '', next()},  indexRouter)
app.use('/ajax', ajaxRouter)
app.use('/users', usersRouter)
app.use('/institutions', institutionsRouter)
app.use('/events', eventsRouter)

// ! debug removido produção
// app.use('/limpa', (req, res) => {
//   require('./models/event.model').updateMany({}, { enrolleds: [] }).exec()
//   require('./models/enrollment.model').remove({}).exec()
// })
// app.use('/events/:id/lectures', lecturesRouter)
// app.use('/events/:id/enrolleds', enrolledsRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app