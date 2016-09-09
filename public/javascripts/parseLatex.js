"use strict";

var main_dir = require("app-root-path");
var q = require("q");
const execFile = require('child_process').execFile;

/* Takes a string in LaTeX syntax. */
/* Calls an executable that converts LaTeX into Sagemath */
function execute(latex) {
    var deferred = q.defer();
    const child = execFile(main_dir + '/parsemath-exe', [latex], function(error, stdout, stderr) {
        if (error) {
            console.log(err);
        }
        deferred.resolve(stdout);
    });

    return deferred.promise;
}

module.exports.execute = execute;