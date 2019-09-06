var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', /*require('../middlewares/is-auth'),*/ function(req, res, next) {
  res.render('index/index', {
    title: 'Inicial',
    user: req.user
  });
});


module.exports = router;
