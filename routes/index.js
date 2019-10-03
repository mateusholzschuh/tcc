var express = require('express')
var router = express.Router()

// css menu
router.all('/*', (req, res, next) => {
  res.locals.mainMenu = 'dashboard'
  
  if (req.user) {
      res.locals.user = {
        name: req.user.name,
        email: req.user.email,
      }
  }
  
  next()
})

/* GET home page. */
router.get('/', (req, res) => {
  return res.render('index/index', {
    title: 'Inicial',
  })
})

module.exports = router