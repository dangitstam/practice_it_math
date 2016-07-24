(function() {

	"use strict";
	
	window.onload = setup;

	var classes;
	var classTitles;
	var scrolling = null;
	var mathBackDiv;
	var currShowing;

	function setup() {
		currShowing = "";
		mathBackDiv = document.getElementById("mathBackground");
		classes = document.querySelectorAll("#courses > div");
		classTitles = document.querySelectorAll("#courses > div > div");
		var courseswrapper = document.getElementById("courseswrapper");
		document.body.onscroll = changeMath;
	}

	function startScroll() {
		var value;
		if (this.id == "scrollUp") {
			value = 20;
		} else {
			value = -20;
		}
		if (!scrolling) {
			scrolling = setInterval(scrollMenu, 10, value);
		}
	}

	function stopScroll() {
		if (scrolling) {
			clearInterval(scrolling);
			scrolling = null;
		}
	}

	function scrollMenu(value) {
		var menu = document.getElementById("menu");
		menu.scrollTop += value;
	}

    function changeMath() {
		for (var i = 0; i < classTitles.length; i++) {
			var currClass = classTitles[i];
			var currClassName = currClass.className;
			var currClassPos = currClass.getBoundingClientRect().top;
			if ((currClassPos + 40) > 0 && currClassPos < window.innerHeight / 2 && (currClassName != currShowing)) {
				mathBackDiv.classList.add("fadeOut");
				setTimeout(displaySelected, 300, currClassName);
				currShowing = currClassName;
			}
		}
	}

	function hideBackgrounds(start) {
		var backgrounds = document.querySelectorAll("#mathBackground > div");
		for (var i = start; i < backgrounds.length; i++) {
			backgrounds[i].style.display = "none";
		}
	}

	function displaySelected(selected) {
		hideBackgrounds(0);
		var reveal = document.querySelector("#mathBackground div." + selected);
		reveal.style.display = "";
		mathBackDiv.classList.remove("fadeOut");
	}

})();