(function() {

	"use strict";
	
	window.onload = setup;

	var scrolling;
	var currShowing;
	var head;
	var courseMode;
	var contentDivs;
	var currDiv;
	var lastScrollVal;
	var circle;
	var courseDivs;
	var menuItems;

	function setup() {
		lastScrollVal = 0;
		currDiv = 0;
		currShowing = "";
		courseMode = false;
		scrolling = false;
		// courseTitleDiv = document.getElementById("courseWrappingTitle");
		// contentDivs = document.querySelectorAll("#content > div");
		courseDivs = document.querySelectorAll("div.course");
		circle = document.getElementById("circleDiv");
		head = document.getElementById("head");
		menuItems = document.getElementById("menu").querySelectorAll("li");
		var inputWraps = document.querySelectorAll(".inputWrap");

		for (var i = 0; i < inputWraps.length; i++) {
			inputWraps[i].onmouseover = function () {
				var arrow = this.querySelector("p");
				arrow.style.right = "10%";
			}
			inputWraps[i].onmouseout = function () {
				var arrow = this.querySelector("p");
				arrow.style.right = "4%";
			}
		}

		for (var i = 0; i < menuItems.length; i++) {
			menuItems[i].onclick = displayCourse;
		}

		setTimeout(function() { menuItems[0].onclick() }, 1200);
	}


	function hideCourses(start) {
		for (var i = start; i < courseDivs.length; i++) {
			courseDivs[i].style.display = "none";
			menuItems[i].querySelector("div").className = "hyphen";
		}
	}

	function displayCourse() {
		hideCourses(0);
		var selected = this.className;
		document.getElementById("courses").querySelector("div." + selected).style.display = "";
		var hyphen = this.querySelector("div");
		hyphen.className = "selectedHyphen";
	}


})();