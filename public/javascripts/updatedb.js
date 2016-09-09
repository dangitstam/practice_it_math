var glob = require("glob");
var fs = require("fs");
var main_dir = require("app-root-path");
var mysql = require("mysql");
var junk = require("junk");

var connection = mysql.createConnection({
	host     : '104.236.130.204',
	user     : 'root',
	password : 'rubycloudserpent',
	database : 'math',
	connectTimeout: 20000,
	multipleStatements: true
});

connection.connect();

var courseSQL = [];
var descriptions = [];
var midterms = [];
var finals = [];
var classShort = fs.readdirSync(main_dir + "/public/problems/");
classShort.splice(0, 1);

var files = glob.sync(main_dir + "/public/problems/*");
files.filter(junk.not);

// To be updated by hand.
var math_backgrounds = [	
	"$$\\frac{dy}{dx}$$",
	"$$\\int_a^b f(x) \\,dx$$",
	"$$\\sum_{k=0}^{\\infty} \\frac{x^k}{k!}$$",
	"$$\\frac{\\partial^2 y}{\\partial x^2}$$",
	"$$x^2\\frac{d^2 y}{d^2 x}$$",
	"$$\\begin{bmatrix}1 & 0 & 0 \\\\0 & 1 & 0 \\\\0 & 0 & 1\\end{bmatrix}$$"
];

// Compiles course titles, descriptions, and latex background text 
// from a flat file system.
/* Uses directory of all classes to provide directories for 
   all exams within those clases */
for (var i = 0; i < files.length; i++) {
	var currFile = files[i];
	courseSQL.push(fs.readFileSync(currFile + "/course.txt", "utf-8"));
	descriptions.push(fs.readFileSync(currFile + "/description.txt", "utf-8"));
	midterms.push(fs.readdirSync(currFile + "/midterms"));
	finals.push(fs.readdirSync(currFile + "/finals"));

	processExams(currFile);
}
examInfo();

console.log("Database update complete.");

function examInfo() {

	// Uploads file system of course information to a MySQL database.
	var values = [];
	for (var i = 0; i < courseSQL.length; i++) {
		values.push([courseSQL[i], descriptions[i], math_backgrounds[i]]);
	}

	var sql = "REPLACE INTO courses (`title`, `description`, `background`) VALUES ?";
	var query = connection.query(sql, [values], function (err, result) {
		if (err) {
			console.log(err);
		}
	});
}

function processExams(path) {
	var split = path.split("/");
	var course = split[split.length - 1];
	var midterm_dir = path + "/midterms/";
	var finals_dir = path + "/finals/";
	sendExams(midterm_dir, course, "midterm");
	sendExams(finals_dir, course, "final");
}

function sendExams(dir, course, type) {
	var quarters = fs.readdirSync(dir);
	quarters = quarters.filter(junk.not);
	for (var i = 0; i < quarters.length; i++) {
		var currQuarter = quarters[i];

		/* Arrays of file names of all problems and solutions
		   for this exam */
		var problems = glob.sync(dir + "/" + currQuarter + "/problem[0-9a-b]*.txt");
		var solutions = glob.sync(dir + "/" + currQuarter + "/answer[0-9a-b]*.txt");
		var providedToSage = glob.sync(dir + "/" + currQuarter + "/providedToSage[0-9a-b]*.txt");
		var provided_separate = glob.sync(dir + "/" + currQuarter + "/provided_separate[0-9a-b]*.txt");

		var insert_prob = "REPLACE INTO problems (`number`, `subject`, `test_name`," +
		                  " `test_type`, `problem`, `solution`, `providedToSage`," +
		                  " `provided_separate`) VALUES ?";

		var prob_values = [];

		for (var j = 0; j < problems.length; j++) {
			var currProb = fs.readFileSync(problems[j], "utf-8");
			var currSol = "";
			var currProvSage = "";
			var currProvSep = "";

			if (solutions.length > j) {
			  currSol = fs.readFileSync(solutions[j], "utf-8");
			}
			if (providedToSage.length > j) {
				currProvSage = fs.readFileSync(providedToSage[j], "utf-8");
			}
			if (provided_separate.length > j) {
				currProvSep = fs.readFileSync(provided_separate[j], "utf-8");
			}

			prob_values.push([j, course, currQuarter, type, currProb, currSol, currProvSage, currProvSep]);
		}

		/* Nested array for bulk insert */
		var send = connection.query(insert_prob, [prob_values], function (err, result) {
			if (err) {
				console.log(err);
				console.log(err.code);
			}
		});
	}
}