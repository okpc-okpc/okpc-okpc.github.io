var currentPlace = {};
var wRequestUrl = "";
var responds = {};
var geoRespond;
var temperature = 0;
var appId = "5fb8da6c7819d24192882b5b6934556d";
var metrical = true;
var wUnits = {
	metrical: ["°C", " m/s"],
	imperial: ["°F", " mph"]
};
var wDirection = "";
// var icons = {
// 	"clear-day":,
// 	"clear-night":,
// 	"rain":,
// 	"snow":,
// 	"sleet":,
// 	"wind":,
// 	"fog":,
// 	"cloudy":,
// 	"partly-cloudy-day":,
// 	"partly-cloudy-night":
// }


var getCoordinates = (function () {

	function showError(error) {
		switch (error.code) {
		case error.PERMISSION_DENIED:
			throw "User denied the request for Geolocation.";
		case error.POSITION_UNAVAILABLE:
			throw "Location information is unavailable.";
		case error.TIMEOUT:
			throw "The request to get user location timed out.";
		case error.UNKNOWN_ERROR:
			throw "An unknown error occurred.";
		}
	}

	var geoposition,
		options = {
			maximumAge: 1000,
			timeout: 15000,
			enableHighAccuracy: false
		};

	function _onSuccess(callback, position) {
		console.log('LAT: ' + position.coords.latitude + ' - LON: ' +  position.coords.longitude);
		currentPlace = position.coords;
		reverseGeo();
		callback();
	}

	function _onError(callback, error) {
		callback();
		showError(error);
	}

	function _getLocation(callback) {
		navigator.geolocation.getCurrentPosition(
			_onSuccess.bind(this, callback),
			_onError.bind(this, callback),
			options
		);
	}

	return {
		location: _getLocation
	};

}());

/*function getCoordinates() {
var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};
function success(pos) {
  currentPlace = pos.coords;

  console.log('Your current position is:');
  console.log('Latitude : ' + currentPlace.latitude);
  console.log('Longitude: ' + currentPlace.longitude);
  console.log('More or less ' + currentPlace.accuracy + ' meters.');
};

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
};
navigator.geolocation.getCurrentPosition(success, error, options)
};
*/



function reverseGeo() {

	var geoRequestUrl = "https://api.opencagedata.com/geocode/v1/json?q=" + currentPlace.latitude + "+" + currentPlace.longitude + "&language=en&no_annotations=1&key=1331493ff40e8a6dc97e7346b63be27e";

	console.log(geoRequestUrl);



	$.ajax({
		url: geoRequestUrl,
		type: "GET",
		dataType: "jsonp",
		success: function (geo) {
			geoRespond = geo;
			console.log(geoRespond);
		},
		error: function (xhr, status, errorThrown) {
			console.log("reverseGeo: " + status);
		},
		complete: [function (xhr, status) {
			console.log("reverseGeo: " + status);
		},
			function () {getWeather() }
			]
	})
}





function getWeather() {

	wRequestUrl = "https://api.forecast.io/forecast/" + appId + "/" + currentPlace.latitude + "," + currentPlace.longitude;
	console.log(wRequestUrl);

	$.ajax({
		url: wRequestUrl,
		type: "GET",
		dataType: "jsonp",
		success: [function (json) {
				responds = json;
				console.log("Inside getWeather: ");
				console.log(responds);
			},
			function() {showWeather()}
		],
		error: function (xhr, status, errorThrown) {
			console.log("getWeather: " + status);
		},
		complete: function (xhr, status) {
			console.log("getWeather: " + status);
			//showWeather()
		}
	})
}

function showWeather() {
	console.log("Inside showWeather: ");
	console.log(responds);
	convert();
	if (metrical) {
		$(".currentTemp").append("<span class='currTemp'>" + responds.currently.temperature + wUnits.metrical[0] + "</span>")
		.append("<p>feels like " + responds.currently.apparentTemperature + wUnits.metrical[0] + "</p>");
		$(".location").append(
			"<p>" + (geoRespond.results[0].components.city
			|| (geoRespond.results[0].components.town + "<br>" + geoRespond.results[0].components.state))
			 + "<br>" + geoRespond.results[0].components.country + "</p>");
		$(".currentIcon").append(responds.currently.summary);
		$(".metaInfo").append(
			"<p>Humidity: " + responds.currently.humidity
			+ "%<br>Cloudiness: " + responds.currently.cloudCover
			+ "%<br>Wind: " + responds.currently.windSpeed + wUnits.metrical[1]
			+ " (" + wDirection + ")"
			+ "</p>");
		$(".dayBrief").append(responds.hourly.summary);
		$(".weekBrief").append(responds.daily.summary);




	// 	$("ul")
	// 		.html("<li>Location: " + (geoRespond.results[0].components.city || (geoRespond.results[0].components.town + ", " + geoRespond.results[0].components.state)) + ", " + geoRespond.results[0].components.country
	// 			+ " (LAT: " + currentPlace.latitude + " - LON: " + currentPlace.longitude + ")"
	// 			+ "</li><li>Temperature: " + responds.currently.temperature + wUnits.metrical[0]
	// 			+ "; feels like " + responds.currently.apparentTemperature + wUnits.metrical[0]
	// 			+ "</li><li>Conditions: " + responds.currently.summary
	// 			+ "</li><li>Cloudiness: " + responds.currently.cloudCover + "%"
	// 			+ "</li><li>Humidity: " + responds.currently.humidity + "%"
	// 			+ "</li><li>Wind speed: " + responds.currently.windSpeed + wUnits.metrical[1] + " (direction - " + wDirection + ")")
	// 		.after("<p><strong>Next 24 hours brief forecast: </strong>" + responds.hourly.summary + "</p>");
	 }
}


function convert() {
	if (metrical) {
		responds.currently.temperature = Math.round((responds.currently.temperature - 32) / 1.8);
		responds.currently.apparentTemperature = Math.round((responds.currently.apparentTemperature - 32) / 1.8);
		responds.currently.cloudCover = Math.round(responds.currently.cloudCover * 100);
		responds.currently.humidity = Math.round(responds.currently.humidity * 100);
		responds.currently.windSpeed = (responds.currently.windSpeed * 0.44704).toPrecision(2);
	}

	var direction = responds.currently.windBearing;
	switch (true) {
	case direction < 11.25:
		wDirection = "N";
		break;
	case (direction >= 11.25 && direction < 56.25):
		wDirection = "NE";
		break;
	case (direction >= 56.25 && direction < 101.25):
		wDirection = "E";
		break;
	case (direction >= 101.25 && direction < 146.25):
		wDirection = "SE";
		break;
	case (direction >= 146.25 && direction < 191.25):
		wDirection = "S";
		break;
	case (direction >= 191.25 && direction < 236.25):
		wDirection = "SW";
		break;
	case (direction >= 236.25 && direction < 281.25):
		wDirection = "W";
		break;
	case (direction >= 281.25 && direction < 326.25):
		wDirection = "NW";
		break;
	case direction >= 326.25:
		wDirection = "N";
		break;
	}
}


$(document).ready(function () {
	getCoordinates.location(function () {
		console.log('Main, after getCoordinates');
		//reverseGeo();
		//getWeather()



		/*$(document).ajaxComplete(function() {
			showWeather();
		});*/

		$('.accordion').accordion({
			"transitionSpeed": 600,
			transitionEasing: "cubic-bezier(0.64, 0.01, 0.15, 0.98)"
		});
	});



/*
Reverse geocoding:
https://api.opencagedata.com/geocode/v1/json?q=47.959123999999996+37.7931349&language=en&no_annotations=1&key=1331493ff40e8a6dc97e7346b63be27e

1 - https://developers.google.com/maps/documentation/geocoding/intro#reverse-example
2- https://maps.googleapis.com/maps/api/geocode/json?latlng=47.958162099999996,37.7931768&key=AIzaSyAwdgGurtsTzr0te968d4nK2quXtTiBFSM
3 - https://console.developers.google.com/home/dashboard?project=weather-app-1227

Weather report:
https://developer.forecast.io/docs/v2#forecast_call


autocomplete:
http://geobytes.com/free-ajax-cities-jsonp-api/
https://developers.google.com/maps/documentation/javascript/places-autocomplete

https://developers.teleport.org/api/getting_started/#search_name
https://github.com/teleport/autocomplete

http://jqueryui.com/autocomplete/#remote-jsonp

accordion: http://vctrfrnndz.github.io/jquery-accordion/


*/

});