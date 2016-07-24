
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

var mapClass = { 
	"calc1" : "Calculus I",
	"calc2" : "Calculus II",
	"calc3" : "Calculus III",
	"calc4" : "Calculus IV",
	"diffeq" : "Differential Equations",
	"linalg" : "Linear Algebra"
};

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.substring(1);
}

function retrieveExam(subject, test_name, test_type) {

	var deferred = q.defer();
	var problems = [];
	var solutions = [];

	var sql = "SELECT problem, solution FROM problems WHERE subject = '" + 
			   subject + "' AND test_name = '" + 
			   test_name + "' AND test_type = '" + 
			   test_type + "';";

	var query = connection.query(sql, function(err, rows, result) {
		if (err) {
			console.log(err);
		}
		deferred.resolve(rows);
	});

	return deferred.promise;
}

module.exports.retrieveExam = retrieveExam;
module.exports.mapClass = mapClass;
module.exports.capitalize = capitalize;