var currentPlace = {};
var wRequestUrl = "";
var responds = {};
var temperature = 0;
var appId = "5fb8da6c7819d24192882b5b6934556d";
var metrical = true;
var wUnits = {
	metrical: [" °C", " m/s"],
	imperial: [" °F", " mph"]
}
var wDirection = "";

var getCoordinates = (function() {
	
	var geoposition;
	var options = {
		maximumAge: 1000,
		timeout: 15000,
		enableHighAccuracy: false
	};

	function _onSuccess (callback, position) {
		console.log('LAT: ' + position.coords.latitude + ' - LON: ' +  position.coords.longitude);
		currentPlace = position.coords;
		callback();
	}

	function _onError (callback, error) {
		console.log(error);
		callback();
	}

	function _getLocation (callback) {
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


function getWeather() {
	
	wRequestUrl = "https://api.forecast.io/forecast/" + appId + "/" + currentPlace.latitude + "," + currentPlace.longitude;
	
	$.ajax({
		url: wRequestUrl,
		type: "GET",
		dataType: "jsonp",
		success: function(json) {
			responds = json;
			console.log(responds);
		},
		error: function(xhr, status, errorThrown) {
			console.log("something have got wrong...");
			currentQuote = "Unfortunately I can't connect to the source:( Try later...";
			
		},
		complete: function(xhr, status) {
			console.log("done!");
		}
	})
};

function showWeather() {
	console.log(responds);
	convert();
	if (metrical) {
		$("ul")
			.html("<li>Location: " + currentPlace.latitude + "," + currentPlace.longitude + "</li><li>Temperature: " + responds.currently.temperature + wUnits.metrical[0] + "</li><li>Conditions: " + responds.currently.summary + "</li><li>Wind speed: " + responds.currently.windSpeed + wUnits.metrical[1] + " (" + wDirection + ")");
	}
};


function convert() {
	if (metrical) {
		responds.currently.temperature = Math.round((responds.currently.temperature - 32) / 1.8);
		responds.currently.windSpeed = (responds.currently.windSpeed * 0.44704).toPrecision(2);
	}
	
	var direction = responds.currently.windBearing
	switch (true) {
		case (direction >= 326.25 && direction < 11.25):
			wDirection = "N";
			break;
		case (direction >=11.25 && direction < 56.25):
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
	}
};


$(document).ready(function() {
	getCoordinates.location(function () {
		console.log('finished, loading app.');
		getWeather();
		$(document).ajaxComplete(function(event, xhr, settings) {
			showWeather();
		});
	});
	

/*


https://developers.google.com/maps/documentation/geocoding/intro#reverse-example	https://maps.googleapis.com/maps/api/geocode/json?latlng=47.958162099999996,37.7931768&key=AIzaSyAwdgGurtsTzr0te968d4nK2quXtTiBFSM

https://console.developers.google.com/home/dashboard?project=weather-app-1227

https://developer.forecast.io/docs/v2#forecast_call

*/

});