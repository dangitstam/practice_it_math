/*
	Tam Dang
	8/25/16

	Client-side JS for Practice-It: Math.
	Handles insertion of LaTeX into webpage for user-built answers,
	page behavior, and requests to the server.
*/

(function() {

	"use strict";
	
	window.onload = setup;
	var reveal;
	var problemsHeight;
	var numOfProbs;
	var menuItems;

	// Boolean flag for raw editing
	var currEditing;

	// Boolean flag for beginning editing
	// var started;

	function setup() {
		hide(".answer", 0);
		hide("div.gui", 0);
		currEditing = false;
		// started = false;
		window.scrollTo(0, document.querySelector(".problemContain0").offsetTop);

		// Same number of answer builds, sumits, reveal guis, and reveal buttons
		// (One for each problem)
		var buildAnswers = document.querySelectorAll("div.buildAnswer");
		var submitButtons = document.querySelectorAll(".submit");
		var clearButtons = document.querySelectorAll(".clear");
		var closeButtons = document.querySelectorAll(".close");
		var reveal_gui = document.querySelectorAll(".check_answer");
		var reveal = document.querySelectorAll(".reveal");

		var home = document.getElementById("home");
		var pie = document.getElementById("pi");

		pie.onclick = function() {
			window.location = "http://localhost:8000";
		};
		
		menuItems = document.querySelectorAll("#selectproblem > li");

		// GUI buttons
		var defInt = document.querySelectorAll(".integ");
		var indefInt = document.querySelectorAll(".integIndef");
		var expos = document.querySelectorAll(".square");
		var frac = document.querySelectorAll(".frac");
		var roots = document.querySelectorAll(".inv_exp");
		var pi_buttons = document.querySelectorAll(".pi");
		var square_roots = document.querySelectorAll(".sqrt");
		var logs = document.querySelectorAll(".log");

		for (var i = 0; i < reveal.length; i++) {
			reveal[i].onclick = displayAnswer;
			submitButtons[i].onclick = sageRequest;
			buildAnswers[i].onclick = addParagraphToBuild;
			clearButtons[i].onclick = function() {
				                          // started = false;
				                          currEditing = false;
				                          this.innerHTML = "Clear";
									      var buildAnswer = this.parentNode.parentNode.querySelector(".buildAnswer");
									      buildAnswer.parentNode.className = "answerContainer";
									      buildAnswer.innerHTML = "";
									      var editableP = paragraphWrap("");
									      editableP.contentEditable = true;
									      editableP.classList.add("raw", "edit");
									      buildAnswer.appendChild(editableP);
									  };
			reveal_gui[i].onclick = displayGUI;
			menuItems[i].onclick = scrollToProblem;

		    defInt[i].onclick = sageDefiniteIntegral;
		    indefInt[i].onclick = sageIndefiniteIntegral;
			expos[i].onclick = exponent;
			frac[i].onclick = fraction;
			roots[i].onclick = inv_exp_root;
			pi_buttons[i].onclick = pi_insert;
			square_roots[i].onclick = square_root;
			logs[i].onclick = logarithm;
		}
		problemsHeight = document.getElementById("problems").getBoundingClientRect().height;
		numOfProbs = menuItems.length;
		setTimeout(function() { menuItems[0].onclick(); }, 1200);
	}

/***************************** Page Aesthetics / Non-math functionality   *************************/

	function hide(selector, start) {
		var problems = document.querySelectorAll(selector);
		for (var i = start; i < problems.length; i++) {
			problems[i].style.display = "none";
		}
	}

	/* Hides either the GUI or provided solution */
	function backToProblem() {
		var parent = this.parentNode;
		var selected = parent.className;
		var currAns = parseInt(selected.charAt(selected.length - 1));
		if (this.className == "reveal") {
			this.innerHTML = "Reveal Solution";
			parent.querySelector(".answer").style.display = "none";
			this.onclick = displayAnswer;
			window.scrollTo(0, parent.offsetTop);
		} else {
			this.innerHTML = "Attempt An Answer";
			this.onclick = displayGUI;
			var guiDiv = document.querySelectorAll("div.gui")[currAns];
			guiDiv.style.display = "none";
			// started = false;
		}
	}

	function displayAnswer() {
		this.innerHTML = "Hide";
		this.onclick = backToProblem;
		var parent = this.parentNode;
		var selected = parent.className;
		var selected_num = selected.substr(4, selected.length - 1);
		var currAns = parseInt(selected_num);
		var answerDiv = parent.querySelector(".answer");
		answerDiv.style.display = "";
	}

	function displayGUI() {
		this.innerHTML = "Hide";
		this.onclick = backToProblem;
		var selected = this.parentNode.className;
		// problemContains# -> substring from 14 to get currently selected
		var selected_num = selected.substr(14, selected.length - 1);
		var curr = parseInt(selected_num.trim());
		var guiDiv = document.querySelectorAll("div.gui")[curr];
		guiDiv.style.display = "";
	}

	function scrollToProblem() {
		var selected = this.className.substr(4, this.className.length - 1);
		var selectedNum = parseInt(selected);
		var selectedProblem = document.querySelector(".problemContain" + selected);
		var scrollNum = parseInt(selectedProblem.offsetTop) - 1;
		var menuLength = menuItems.length;
		for (var i = 0; i < menuLength; i++) {
			var currBar = menuItems[i].querySelector("div");
			currBar.className = "hyphen";
		}
		this.querySelector("div").className = "selectedHyphen";
		window.scrollTo(0, scrollNum);
	}


/********************************** Answer-Building Gui Functions ********************************/

	/*
		Triggered onclick, if a current complex block is not being
	    edited, inserts another editable paragraph for the user.
	*/
	function addParagraphToBuild() {
		if (!currEditing) {
			// if (!started) {
			// 	this.innerHTML = "";
	  //           started = true;
  	// 		}
	  		this.appendChild(editablePara(""));
	  		currEditing = true;
	  	}
	}


	/*
		Combines all current math in answer div, replaces input tags
		with input, returns result as a string.
	*/
	function combineCurrentContent(answerDiv) {

		var answerDivChildren = answerDiv.querySelectorAll("p.raw, script");
		var content = "";

		// Combine all math in answer div thus far.
		for (var i = 0; i < answerDivChildren.length; i++) {
			var curr = answerDivChildren[i];
			if (curr !== null && curr.innerHTML !== null) {
				content += curr.innerHTML + " ";
			}
		}

		// MathJax FormInputs include duplicates / undefined inputs
		var inputs = answerDiv.querySelectorAll("input");
		var inputsFilterUndefined = [];
		for (var i = 0; i < inputs.length; i++) {
			var curr = inputs[i];
			var parentTag = curr.parentNode.tagName;
			if (parentTag == 'SPAN') {
				inputsFilterUndefined.push(curr);
			}
		}

		// Integral lower and upper limits are out of order
		var finalInputs = [];
		for (var i = 0; i < inputsFilterUndefined.length; i++) {
			var curr = inputsFilterUndefined[i];
			if (curr.name == "highlim") {
				var lowlim = inputsFilterUndefined[i + 1];
				finalInputs.push(lowlim);
				finalInputs.push(curr);
				i++;
			} else {
				finalInputs.push(curr);
			}
		}

		// Replace \FormInput...{..} with actual input
		for (var i = 0; i < finalInputs.length; i++) {
			var curr = finalInputs[i];
			if (curr !== null && curr.value !== null) {
				content = content.replace(/(\\FormInput)([^\}\{])*\{[^\{\}\^]*\}/, curr.value);
			}

			// remove newlines
			content = content.replace(/\n/, "");
		}

		return content.trim();
	}

	/** Complicated blocks (integrals, exponentials, etc) must be wrapped in braces **/


		// Creates a hidden paragraph containing "type"
		// For helping keep blocks of math separate for easy parsing
		function hiddenBrace(type) {
			var hidden = document.createElement("p");
			hidden.innerHTML = type;
			hidden.style.display = "none";
			hidden.classList.add("raw");
			return hidden;
		}


	/*
	   Editable paragraph for user input
	   On enter, finalizes math inputted so far and moves cursor along for futher input
	*/
	function editablePara(presetContent) {
		var p_edit = document.createElement("p");
		p_edit.contentEditable = true;
		p_edit.innerHTML = presetContent;
		p_edit.classList.add("raw"); // raw flags content to be part of ultimate latex input
		p_edit.classList.add("edit"); // edit flag allows for insertion during current block

		// Solidify current block and prep for additional input on enter.
		p_edit.addEventListener("keyup", function(event) {
			if (event.keyCode == 13) {
				event.preventDefault(); // prevent carriage return
				var buildAnswer = this.parentNode;
				var combinedContent = combineCurrentContent(buildAnswer);
				buildAnswer.innerHTML = "$(" + combinedContent + ")$";
				MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
				currEditing = false;
			}
		});

		return p_edit;
	}


	/*
		Appends math to answer div, immediately after
		latest active element if possible.
	*/
	function refreshMath(contentArr, ansContain) {
		var buildAnswer = ansContain.querySelector(".buildAnswer");
		// if (!started) {
		// 	buildAnswer.innerHTML = "";
		// 	started = true;
		// }

		// scope for last raw + edit (editable paragraph to user) for correct insertion
		var raws = buildAnswer.querySelectorAll("p.edit");
		var latestRaw = raws[raws.length - 1];

		if (typeof latestRaw !== "undefined" && typeof latestRaw.nextSibling !== "undefined") {
			var nextToRaw = latestRaw.nextSibling;
			for (var i = 0; i < contentArr.length; i++) {
				buildAnswer.insertBefore(contentArr[i], nextToRaw);
			}
		} else { // First time inputting
			for (var i = 0; i < contentArr.length; i++) {
				buildAnswer.appendChild(contentArr[i]);
			}
		}		
	
		currEditing = true;
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	}


	/******* 

		GUI-Button-Specific 

		All LaTeX inserting functions solidify math that comes before insertion point.

    ********/


	function paragraphWrap(content) {
		var para = document.createElement("p");
		para.innerHTML = content;
		return para;
	}


	/*
	   Inserts an integral sign, two inputs for upper/lower limits,
	   editable paragraph.
	*/
	function sageDefiniteIntegral() {
		var integral = paragraphWrap("$\\int_{\\FormInput[10][][]{lowlim}}^" + 
			                                "{\\FormInput[10][][]{highlim}}$");
		var differential = paragraphWrap("$d\\FormInput{dx}$");
		var answerContainer = this.parentNode.parentNode.parentNode.querySelector(".answerContainer");
		var appendTemplate = [hiddenBrace("{"), integral, editablePara("(integrand)"), 
		                      differential, hiddenBrace("}")];
		refreshMath(appendTemplate, answerContainer);
	}

	/*
		Inserts integral sign, editable paragraph
	*/
	function sageIndefiniteIntegral() {
		var integral = paragraphWrap("$\\int $");
		var differential = paragraphWrap("$d\\FormInput{dx}$");
		var answerContainer = this.parentNode.parentNode.parentNode.querySelector(".answerContainer");
		var appendTemplate = [hiddenBrace("{"), integral, hiddenBrace("("), editablePara("(integrand)"), 
		                      hiddenBrace(")"), differential, hiddenBrace("}")];
		refreshMath(appendTemplate, answerContainer);
	}


	// Inserts base^exponent inputs
	function exponent() {
		var expo = paragraphWrap("$\\FormInput[5][][]{base}^{\\FormInput[10][][]{exp}}$");
		var answerContainer = this.parentNode.parentNode.parentNode.querySelector(".answerContainer");
		// editable paragraph to allow continuation
		var appendTemplate = [hiddenBrace("("), hiddenBrace("{"), expo, hiddenBrace("}"), 
		                      hiddenBrace(")"), editablePara("(continue)")];
		refreshMath(appendTemplate, answerContainer);
	}


	// Inserts numerator / denominator inputs
	function fraction() {
		var rational = paragraphWrap("$\\frac{\\FormInput[15][][]{numerator}}" + 
			                         "{\\FormInput[15][][]{denominator}}$");

							   /* div.inputs -> div.buttons -> div.gui */
		var answerContainer = this.parentNode.parentNode.parentNode.querySelector(".answerContainer");
		var appendTemplate = [hiddenBrace("{"), rational, editablePara("(continue)"), hiddenBrace("}")];
		refreshMath(appendTemplate, answerContainer);
	}


	// Inserts inverse root inputs
	function inv_exp_root() {
		var latex_root = paragraphWrap("$\\sqrt[{\\FormInput[3][][]{exp}}]" + 
			                           "{(\\FormInput[10][][]{under_root})}$"); 
		var answerContainer = this.parentNode.parentNode.parentNode.querySelector(".answerContainer");
		var appendTemplate = [hiddenBrace("("), hiddenBrace("{"), latex_root, hiddenBrace("}"), 
		                      hiddenBrace(")"), editablePara("(continue)")];
		refreshMath(appendTemplate, answerContainer);
	}


	function pi_insert() {
		var latex_root = paragraphWrap("${\\pi}$"); 
		var answerContainer = this.parentNode.parentNode.parentNode.querySelector(".answerContainer");
		var appendTemplate = [hiddenBrace("("), latex_root, hiddenBrace(")"), editablePara("(continue)")];
		refreshMath(appendTemplate, answerContainer);
	}

	function square_root() {
		var latex_root = paragraphWrap("$\\sqrt {(\\FormInput[10][][]{under_root})}$"); 
		var answerContainer = this.parentNode.parentNode.parentNode.querySelector(".answerContainer");
		var appendTemplate = [hiddenBrace("("), hiddenBrace("{"), latex_root, hiddenBrace("}"), 
		                      hiddenBrace(")"), editablePara("(continue)")];
		refreshMath(appendTemplate, answerContainer);
	}


	function logarithm() {
		var log = paragraphWrap("$\\log_{\\FormInput[5][][]{base}}$");
		var answerContainer = this.parentNode.parentNode.parentNode.querySelector(".answerContainer");
		var appendTemplate = [hiddenBrace("{"), log, editablePara("continue"), hiddenBrace("}")];
		refreshMath(appendTemplate, answerContainer);
	}


/********************************** Requests to SageCell Web Service ********************************/

	function ajaxSage(input, buildAnswerDiv, index) {
		var server = "/submit";
		var data = { data : input, index: index };
		var ajax = new XMLHttpRequest();
		ajax.open("POST", server, true);
		ajax.setRequestHeader("Content-type", "application/JSON");
		ajax.onload = function() { 
			              displayAns(this.responseText, buildAnswerDiv); 
			          };
		ajax.send(JSON.stringify(data));
	}

	function replaceAll(string, search, replace) {
		return string.split(search).join(replace);
	}

	function sageRequest() {
		var answerDiv = this.parentNode.parentNode.querySelector("div.answerContainer");
		var selected = this.className.substr(6, this.className.length - 1);
		var combinedContent = combineCurrentContent(answerDiv);
		combinedContent = combinedContent.replace(/\s/g, "");
		var buildAnswer = answerDiv.querySelector(".buildAnswer");
		var gif = document.createElement("img");
		gif.src = "http://localhost:8000/images/gears.gif";
		gif.alt = "gears";
		buildAnswer.appendChild(gif);
		// prevent superfluous wrapping
		if (combinedContent.charAt(combinedContent.length - 1) != ')') {
			buildAnswer.innerHTML = "$(" + combinedContent + ")$";
		} else {
			buildAnswer.innerHTML = "$" + combinedContent + "$";
		}
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
		currEditing = false;
		console.log(combinedContent);
		ajaxSage(combinedContent, buildAnswer, selected);
	}

	function displayAns(response, buildAns) {
		var json = JSON.parse(response);
		// buildAns.removeChild[buildAns.lastChild];
		// buildAns.appendChild(document.createElement("hr"));
		buildAns.innerHTML = "";

		var correctNess;
		if (json["correct"]) {
			correctNess = paragraphWrap("CORRECT!");
			correctNess.classList.add("correctNess");
			buildAns.parentNode.classList.add("correct");
		} else {
			correctNess = paragraphWrap("INCORRECT.");
			correctNess.classList.add("correctNess");
			buildAns.parentNode.classList.add("incorrect");
		}
		buildAns.appendChild(correctNess);

		var user_soln = paragraphWrap("Your Solution:    $" + json["user_answer"] + "$");
		user_soln.classList.add("soln");
		buildAns.appendChild(user_soln);

		var providedSolution = paragraphWrap("Provided Solution:    $" + json["provided_separate"] + "$");
		providedSolution.classList.add("soln");

		if (!json["correct"]) {
			providedSolution.style.visibility = "hidden";

			var showProvided = document.createElement("button");
			showProvided.classList.add("showProvided");
			showProvided.innerHTML = "See Provided Answer";
			var tryAgain = document.createElement("button");
			tryAgain.classList.add("showProvided");
			tryAgain.innerHTML = "Try Again";

			showProvided.onclick = function() {
				providedSolution.style.visibility = "";
				this.style.visibility = "hidden";
			}

			tryAgain.onclick = function() {
				buildAns.parentNode.className = "answerContainer";
				// started = false;
				currEditing = false;
				buildAns.innerHTML = "";
				buildAns.addParagraphToBuild();
			}

			buildAns.appendChild(providedSolution);
			buildAns.appendChild(showProvided);
			buildAns.appendChild(tryAgain);
		} else {
			buildAns.appendChild(providedSolution);
		}
	
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	}


})();