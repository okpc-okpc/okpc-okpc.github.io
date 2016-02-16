var currentPlace = {
	latitude: "",
	longitude: ""
};
var wRequestUrl = "";
var summary = {};
var temperature = 0;

var getLocation = function() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			currentPlace.latitude = position.coords.latitude;
			currentPlace.longitude = position.coords.longitude;
		});
	};
};

var getWeather = function() {
	wRequestUrl = "http://api.openweathermap.org/data/2.5/weather?lat=" + currentPlace.latitude + "&lon=" + currentPlace.longitude + "&APPID=853eae33b0ae1d813406b9bbeb216f1d";
	$.ajax({
		url: wRequestUrl,
		type: "GET",
		dataType: "json",
		success: function(json) {
				summary = json;
		},
		error: function(xhr, status, errorThrown) {
			console.log("something have got wrong...");
			currentQuote = "Unfortunately I can't connect to the source:( Try later...";
			
		},
		complete: function(xhr, status) {
			console.log("done!");
		}
	});
};

var showWeather = function() {
	temperature = parseFloat((summary.main.temp - 273.15).toPrecision(3));
	$("ul")
		.html("<li>Location: " + summary.name + ", " + summary.sys.country + "</li><li>Temperature: " + temperature + "C°</li><li>Conditions: " + summary.weather[0].description + "</li>");
}


$(document).ready(function() {
	$("#locationButton").on("click", function() {
		getLocation();
	});
	
	$("#getWeatherButton").on("click", function() {
		getWeather();
	});
	
	$("#showWeatherButton").on("click", function() {
		showWeather();
	});
	

	/*
if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(function(position) {
		currentPlace.latitude = position.coords.latitude;
		currentPlace.longitude = position.coords.longitude;
		console.log(currentPlace);
		wRequestUrl = "http://api.openweathermap.org/data/2.5/weather?lat=" + currentPlace.latitude + "&lon=" + currentPlace.longitude + "&APPID=853eae33b0ae1d813406b9bbeb216f1d";
		console.log(wRequestUrl);
	$.ajax({
		url: wRequestUrl,
		type: "GET",
		dataType: "json",
		success: function(json) {
				summary = json;
		},
		error: function(xhr, status, errorThrown) {
			console.log("something have got wrong...");
			currentQuote = "Unfortunately I can't connect to the source:( Try later...";
			
		},
		complete: function(xhr, status) {
			console.log("done!");
		}
	});
	
	console.log(summary);
	
	});

	
	
};
*/

});