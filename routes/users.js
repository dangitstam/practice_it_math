var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/users', function(req, res, next) {
  res.send('respond with a resource');
});


/* localhost:8000/users/detail */
router.get('/users/detail', function(req, res, next) {
  res.send('detail');
});


module.exports = router;
