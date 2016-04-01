var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session);
  if (req.session.passport) {

  res.render('index', { title: 'Express', user: req.session.passport.user});
} else {
  res.render('index', { title: 'Express', user: ''});

}
});

module.exports = router;
