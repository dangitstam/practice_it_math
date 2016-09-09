"use strict";

var request = require("request");
var q = require("q");
var mysql = require("mysql");

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'rubycloudserpent',
  database : 'math',
  connectTimeout: 20000,
  multipleStatements: true
});

connection.connect();

function finalizedRequest(currTest, number, answer) {

    var ans = retrieveProvided(currTest, number)
    .then(function(rows) {
        ans += mathRequest(answer) + ")";
    })
    .then(function(finalAns) {
        return finalAns;
    })
}   

/* Retrieves provided answer to current problem */

function retrieveProvided(currTest, number) {

    var deferred = q.defer();
    var subject = currTest[0];
    var test_name = currTest[1];
    var test_type = currTest[2];

    var sql = "SELECT providedToSage, provided_separate FROM problems WHERE number = '" + 
              number + "' AND subject = '" + 
              subject + "' AND test_type = '" + 
              test_type + "' AND test_name = '" + 
              test_name + "';";

    var query = connection.query(sql, function(err, rows, result) {
        if (err) {
          console.log(err);
        }
        deferred.resolve(rows);
    });

    return deferred.promise; 
}


function mathRequest(answer) {
    var deferred = q.defer();
    request({
        method: "POST",
        url: "http://aleph.sagemath.org/service",
        form: { code: answer }
        }, 
        function (err, res, body) {
            if (err) {
                console.log(err);
            }
            // parse, grab output, escape backslashes
            var formattedAnswer = JSON.parse(body).stdout;
            console.log(answer);
            console.log(JSON.parse(body).stdout);
            deferred.resolve(formattedAnswer);
        });

    return deferred.promise;
}

module.exports.mathRequest = mathRequest;
module.exports.retrieveProvided = retrieveProvided;