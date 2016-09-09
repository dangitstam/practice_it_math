"use strict";

var main_dir = require("app-root-path");
var injectCourses = require(main_dir + '/public/javascripts/injectCourses');
var calculate = require(main_dir + '/public/javascripts/calculate');
var injectProblems = require(main_dir + '/public/javascripts/injectProblems');
var parseLatex = require(main_dir + '/public/javascripts/parseLatex');
var sage = require(main_dir + '/public/javascripts/sage');

var currTest = [];

/* Recreate tables & uncomment to update database */
var updatedb = require(main_dir + '/public/javascripts/updatedb');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    injectCourses.loadPage(res);
});

router.post('/problems', function(req, res, next) {
    console.log(req.body);
    var exam_split = req.body.exam.split(" ");
    var subject = exam_split[0];
    var test_name = exam_split[1];
    var test_type = exam_split[2];
    console.log(injectProblems.mapClass[subject]);
    var subject_C = injectProblems.mapClass[subject];
    var test_name_C = injectProblems.capitalize(test_name);
    var test_type_C = injectProblems.capitalize(test_type);
    console.log(subject_C + " " + test_name_C + " " + test_type_C);

    var images = injectProblems.retrieveImages(subject, test_name, test_type);

    injectProblems.retrieveExam(subject, test_name, test_type).then(function(rows) {
        currTest = [subject, test_name, test_type];
        console.log(currTest);
        res.render("problems", { rows: rows, subject: subject_C, test_name: test_name_C, test_type: test_type_C, images: images });    
    });
});


// Handles answer submissions
router.post('/submit', function(req, res, next) {
    console.log(req.body.data);
    console.log(req.body.index);
    console.log(currTest);

    var answerPreamble = "";
    var answerSeparate = "";

    sage.retrieveProvided(currTest, req.body.index)
      .then(function(rows) {
          console.log(rows);
          answerPreamble = rows[0]["providedToSage"]; // Includes "print latex(bool ..(provided answer) .."
          answerSeparate = rows[0]["provided_separate"];
          parseLatex.execute(req.body.data) // parses user LaTeX into Sage
              .then(function(answer) {
                  console.log(answer);
                  console.log(answerPreamble + answer + "))");
                  return sage.mathRequest(answerPreamble + answer + "))") // closes sagemath functions shown above
                  .then(function(answer) {
                      res.setHeader('Content-type', 'application/JSON');
                      var response = { provided_separate: answerSeparate, user_answer: req.body.data };
                      if (String(answer).trim() == "True") {
                          response["correct"] = true;
                      } else {
                          response["correct"] = false;
                      }
                      res.send(JSON.stringify(response));
                      console.log("reached");
                      console.log(answer);
                  })
             });
      });
});


module.exports = router;