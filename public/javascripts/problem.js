(function() {

	window.onload = setup;
	var reveal;
	var problemsHeight;
	var numOfProbs;

	function setup() {
		hide(".answer", 0);
		window.scrollTo(0, document.querySelector(".problemContain0").offsetTop);
		var home = document.getElementById("home");
		home.onclick = function() {
			window.location = "http://students.washington.edu/dangt7/practiceitdesign/math.php";
		}

		reveal = document.querySelectorAll(".reveal");
		for (var i = 0; i < reveal.length; i++) {
			reveal[i].onclick = displayAnswer;
		}

		var menuItems = document.querySelectorAll("#selectproblem > li");
		for (var i = 0; i < menuItems.length; i++) {
			menuItems[i].onclick = scrollToProblem;
		}

		problemsHeight = document.getElementById("problems").getBoundingClientRect().height;
		numOfProbs = menuItems.length;

		var sageButtons = document.getElementsByClassName("check_answer");
		for (var i = 0; i < sageButtons.length; i++) { 
		    sageButtons[i].onclick = sageRequest;
		}
	}

	function sageAjax(input) {
		var server = "http://aleph.sagemath.org/service";
		var formData = new FormData();
		formData.append("code", input);
		var ajax = new XMLHttpRequest();
		ajax.onload = function() { displayAns(this.responseText) };
		ajax.open("POST", server, true);
		ajax.send(formData);
	}

	function sageRequest() {
		var selected = this.className.charAt(this.className.length - 1);
		var sage_input = document.getElementById("sage" + selected).value;
		sageAjax("print latex(" + sage_input + ")");
	}

	// grab answer from server somehow....
	function displayAns(stuff) {
		alert(stuff);
	}

	function hide(selector, start) {
		var problems = document.querySelectorAll(selector);
		for (var i = start; i < problems.length; i++) {
			problems[i].style.display = "none";
		}
	}

	function backToProblem() {
		this.innerHTML = "Reveal Solution";
		var parent = this.parentNode;
		var selected = parent.className;
		var currAns = parseInt(selected.charAt(selected.length - 1));
		reveal[currAns].style.display = "";
		document.getElementById(currAns).style.display = "none";
		this.onclick = displayAnswer;
		window.scrollTo(0, parent.offsetTop);
	}

	function displayAnswer() {
		this.innerHTML = "Hide";
		this.onclick = backToProblem;
		var selected = this.parentNode.className;
		var currAns = parseInt(selected.charAt(selected.length - 1));
		var answerDiv = document.getElementById(currAns);
		answerDiv.style.display = "";
	}

	function scrollToProblem() {
		var selected = this.className.charAt(this.className.length - 1);
		var selectedNum = parseInt(selected);
		var selectedProblem = document.querySelector(".problemContain" + selected);
		var scrollNum = parseInt(selectedProblem.offsetTop) - 1;
		window.scrollTo(0, scrollNum);
	}

})();