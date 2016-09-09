"use strict";

var glob = require("glob");
var fs = require("fs");
var main_dir = require("app-root-path");
var mysql = require("mysql");
var junk = require("junk");
var q = require("q");

// Abstract this into a file later.
var connection = mysql.createConnection({
	host     : '104.236.130.204',
	user     : 'root',
	password : 'rubycloudserpent',
	database : 'math',
	connectTimeout: 20000,
	multipleStatements: true
});

connection.connect();

var classShort = fs.readdirSync(main_dir + "/public/problems/");
classShort = classShort.filter(junk.not);

/* Loads homepage */
function loadPage(res) {
	loadCourseInfo()
		.then(function(course_materials) { 
			/* Adds midterms to course_materials */
			return loadExams("midterm", course_materials)
		.then(function(course_materials) { 
			/* Adds finals to course materials */
			return loadExams("final", course_materials)
		.then(function(course_materials) {
				/* Render HTML */
				res.render("layout", course_materials);
			})
		})
	});
}

/* Collects course info from database, defers with results */
function loadCourseInfo() {
	var deferred = q.defer();
	var courses = [];
	var descriptions = [];
	var math_backgrounds = [];
	var sql = "SELECT title, description, background FROM courses";
	var query = connection.query(sql, function (err, rows, result) {
		if (err) {
			console.log(err);
		}
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			courses.push(row.title.split("\n"));
			descriptions.push(row.description);
			math_backgrounds.push(row.background);
		}
		var course_materials = {
	    	courses: courses, 
	    	classShort: classShort,
	    	descriptions: descriptions, 
	    	math_backgrounds: math_backgrounds 
	  	}
	  	deferred.resolve(course_materials);
	});
	return deferred.promise;
}

/* Generalized for collected both midterm and final info */
function loadExams(type, course_materials) {
	console.log("loadExams fired.");
	var deferred = q.defer();
	/* { subject: [ test_name(s) ] } */
	var exams = {};
	for (var i = 0; i < classShort.length; i++) {
		exams[classShort[i]] = [];
	}
	/* Collects all exams unique by subject and name */
	var sql = "SELECT `subject`, `test_name` FROM problems WHERE `test_type` = '" + type + "' GROUP BY `subject`, `test_name`;";
	var query = connection.query(sql, function (err, rows, result) {
		if (err) {
			console.log(err);
		}
		/* Organise unique exams by course */
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			exams[row.subject].push(row.test_name);
		}
		course_materials[type + "s"] = exams;
		deferred.resolve(course_materials);
	});
	return deferred.promise;
}

module.exports.loadPage = loadPage;