var main_dir = require("app-root-path");
var injectCourses = require(main_dir + '/public/javascripts/injectCourses');
var calculate = require(main_dir + '/public/javascripts/calculate');
var injectProblems = require(main_dir + '/public/javascripts/injectProblems');

/* Uncomment to update database */
// var updatedb = require(main_dir + '/public/javascripts/updatedb');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  injectCourses.loadPage(res);
});

router.post('/problems', function(req, res, next) {
  var exam_split = req.body.exam.split(" ");
  var subject = exam_split[0];
  var test_name = exam_split[1];
  var test_type = exam_split[2];
  console.log(injectProblems.mapClass[subject]);
  var subject_C = injectProblems.mapClass[subject];
  var test_name_C = injectProblems.capitalize(test_name);
  var test_type_C = injectProblems.capitalize(test_type);
  console.log(subject_C + " " + test_name_C + " " + test_type_C)
  injectProblems.retrieveExam(subject, test_name, test_type).then(function(rows) {
    res.render("problems", { rows: rows, subject: subject_C, test_name: test_name_C, test_type: test_type_C });  
  });
});

// router.get('/index', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get('/test', function(req, res, next) {
  res.render('testNumbers', {});
});

router.post('/test', function(req, res, next) {
  console.log(req.body);
  res.render('testNumbers', {});
});

/* GET users listing. */
// router.get('/users', function(req, res, next) {
//   res.send('respond with a resource');
// });

module.exports = router;