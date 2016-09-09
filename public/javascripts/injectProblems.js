
var q = require("q");
var fs = require("fs");
var main_dir = require("app-root-path");
var mysql = require("mysql");
var glob = require("glob");
var junk = require("junk");
var jpeg = require("jpeg-js");

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

function retrieveImages(subject, test_name, test_type) {

	var imageDir = main_dir + "/public/problems/" +
                   subject + "/" +
                   test_type + "s/" +
                   test_name + "/problemImages/";

    try {
	    if (fs.statSync(imageDir).isDirectory()) {
			var images = glob.sync(imageDir + "*");
			images = images.filter(junk.not);

			var imagesNames = fs.readdirSync(imageDir);
			imagesNames = imagesNames.filter(junk.not);

			var imagesObj = {};

			for (var i = 0; i < images.length; i++) {
				var currImage = images[i];
				var readImage = fs.readFileSync(currImage);
				var index = currImage.substring(0, currImage.length - 4);
				imagesObj[imagesNames[i]] = readImage.toString('base64'); 
			}

			return imagesObj;
		}
    } catch(e) {
    	if (e.code == 'ENOENT') {
    		return "";
    	} else {
    		throw e;
    	}
    }



}

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
		// console.log(rows);
		deferred.resolve(rows);
	});

	return deferred.promise;
}

module.exports.retrieveImages = retrieveImages;
module.exports.retrieveExam = retrieveExam;
module.exports.mapClass = mapClass;
module.exports.capitalize = capitalize;