"use strict";

var request = require('request');
var url = require('url');

// have a glob here to grab the answer

function sageRequest(res, input) {
  console.log("request sent");
  var answer = null;
  var calc = "print latex(" + input + ")";
  request({
  	url: "http://aleph.sagemath.org/service",
  	method: "POST",
    form: { "code": calc }
    }, function (error, response, body) {
  	     if (!error && response.statusCode === 200) {
  	       var calculation = JSON.parse(body);
  	       answer = "$$" + calculation.stdout + "$$";
           console.log(answer);
  	     } else {
  	       console.log(body);
  	       console.log(error);
  	       console.log(response.statusCode);
  	       console.log(response.statusText);
  	     }
  });
}

 // can't do this...
 // res.writeHead(200, { "Content-type": "text/plain" });
 // res.send(answer);
 // res.end();

// php style inject and make this clientside instead
// have input and others
// i.e answer1, answer2, answer3, etc.
// isset on the jade layout for each, and update after post
exports.sageRequest = sageRequest;
