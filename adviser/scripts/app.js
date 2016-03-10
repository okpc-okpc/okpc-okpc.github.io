var currentQuote;
var count;
var show;
var delay = 10000; 						//delay between slides (in miliseconds)
var state = false;


/*------variables for visibility check--------
----------------------------------------------*/
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") {
	hidden = "hidden";
	visibilityChange = "visibilitychange";
} else if (typeof document.mozHidden !== "undefined") {
	hidden = "mozHidden";
	visibilityChange = "mozvisibilitychange";
} else if (typeof document.msHidden !== "undefined") {
	hidden = "msHidden";
	visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
	hidden = "webkitHidden";
	visibilityChange = "webkitvisibilitychange";
}

/*---------stop/play slideshow if tab is inactive------------
-------------------------------------------------------------*/
function handleVisibilityChange() {
	if (document[hidden]) {
		clearInterval(show);
		console.log('I was inactive');
	} else {
		if (state) {
			show = window.setInterval(getAdvice, delay);
		}
	}
}

function updateRangeInputValue(val) {
      $("#rangeValue").text(val + " seconds");
	  delay = val*1000;
}

/*---------get and post new advice---------
-------------------------------------------*/
function getAdvice() {
	$.ajax({
		url: "https://crossorigin.me/http://api.adviceslip.com/advice",
		type: "GET",
		dataType: "json",
		success: function(json) {
			if (json.slip.advice.length <= 115) {
				currentQuote = json.slip.advice;
				console.log("I have an advice");
				$("#quote").text(currentQuote);
			} else {
				console.log("I've got too long advice");
				currentQuote = "Practice makes perfect";
			}
		},
		error: function(xhr, status, errorThrown) {
			console.log("something have got wrong...");
			currentQuote = "Unfortunately I can't connect to the source:( Try later...";
			$("#quote").text(currentQuote);
		},
		complete: function(xhr, status) {
			console.log("done!");
		}
	});
};

/*-------------slideshow-------------------
-------------------------------------------*/

/*------start--------------*/
function slideshowStart() {
	console.log("let's play");					//onclick <button#slideshowStart>
	show = window.setInterval(getAdvice, delay);
	state = true;
	$("#slideshowStop").removeAttr("disabled");
	$("#delayBetweenSlides").attr("disabled", "disabled");
	$("#slideshowStart").attr("disabled", "disabled");
}

/*------stop---------------*/
function slideshowStop() {						//onclick <button#slideshowStop>
	clearInterval(show);
	state = false;
	$("#slideshowStop").attr("disabled", "disabled");
	$("#delayBetweenSlides").removeAttr("disabled");
	$("#slideshowStart").removeAttr("disabled");
}

function sendMeToTwitter() {

}

/*-------------MAIN FUNCTION------------------
----------------------------------------------*/
$(document).ready(function() {
	getAdvice();								//get and post initial advice

	$("#twi").click(function() {				//twit current advice
		$('.twitter-share-button').attr(
			"href",
			"https://twitter.com/intent/tweet?text=" + currentQuote + " - by The Advice Machine");
	});

												// Handle page visibility change
  document.addEventListener(visibilityChange, handleVisibilityChange, false);

  $("#settings").click(function(){				//toggle slideshow visibility settings block
	$("#slideshowControllers").toggle(200);
  })
});