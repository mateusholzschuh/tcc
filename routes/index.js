var express = require('express')
var router = express.Router()

// controller
const controller = require('../controllers/home.controller')

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
router.get('/', controller.getHome/*(req, res) => {
  return res.render('index/index', {
    title: 'Inicial',
  })
}*/)

module.exports = router