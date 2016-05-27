(function() {
var currentPlace = {},
	wRequestUrl = "",
	responds = {},
	geoRespond = {},
	searchResult = {},
	appId = "5fb8da6c7819d24192882b5b6934556d",
	isCelsius,
	windUnit,
	fetcher,
	fetcherMaker,
	storageFlag;


function getCoordinates() {
	var options = {
		maximumAge: 1000,
		timeout: 15000,
		enableHighAccuracy: false
	};
	var deferred = $.Deferred()

	function success(position) {
		currentPlace = position.coords;
		deferred.resolve();
	};

	function error(err) {
		console.warn('ERROR(' + err.code + '): ' + err.message);
		deferred.reject();
	};

	navigator.geolocation.getCurrentPosition(success, error, options);

	return deferred.promise();
}

/*
	==================================================================================================================
	==================================================================================================================
	==================================================================================================================
*/

function reverseGeo() {
	var lat = searchResult.latitude || currentPlace.latitude;
	var lon = searchResult.longitude || currentPlace.longitude;
	var geoRequestUrl = "https://api.teleport.org/api/locations/"
		+ lat + ","	+ lon
		+ "/?embed=location%3Anearest-cities%2Flocation%3Anearest-city";

	return $.ajax({
		url: geoRequestUrl,
		type: "GET",
		dataType: "json",
		success: function (geo) {
			geoRespond = geo;
		// },
		// error: function (xhr, status, errorThrown) {
		}
	})
}

/*
	==================================================================================================================
	==================================================================================================================
	==================================================================================================================
*/

function getWeather() {
	clearData();
	var lat = searchResult.latitude || currentPlace.latitude;
	var lon = searchResult.longitude || currentPlace.longitude
	wRequestUrl = "https://api.forecast.io/forecast/" + appId + "/" + lat + "," + lon;

	return $.ajax({
		url: wRequestUrl,
		type: "GET",
		dataType: "jsonp",
		success: function (json) {
				responds = json;
		// },
		// error: function (xhr, status, errorThrown) {
		}
	})
}

/*
	==================================================================================================================
	==================================================================================================================
	==================================================================================================================
*/

fetcherMaker = function (weatherdata) {

	/*	Get temperature from JSON
		timeRange: 		'currently', 'hourly' or 'daily'
		isCelsius: 		true - Celsius, false - Farenheit
		apparent: 		true - 'feels like' temp; false - real temp
		dataInstance: 	number of hour or day (empty string in 'current' case)
	*/
	function getTemp(timeRange, isCelsius, apparent, dataInstance) {
		var tempCurr, tempMax, tempMin, tempDaily, temp, tempOption;

		var tempSign = function (val) {
			 if (val > 0)
			 	val = "+" + val
			 return val
		}

		if (apparent)
			tempOption = "apparentTemperature";
		else
			tempOption = "temperature";

		if (timeRange === "currently") {
			tempCurr = weatherdata.currently[tempOption];
		} else if (timeRange === "hourly") {
			temp = weatherdata.hourly.data[dataInstance][tempOption];
		} else if (timeRange === "daily") {
			tempMax = weatherdata.daily.data[dataInstance][tempOption+"Max"];
			tempMin = weatherdata.daily.data[dataInstance][tempOption+"Min"];
		}

		if (isCelsius === true) {
			tempCurr = tempSign(Math.round((tempCurr - 32) / 1.8));
			temp = tempSign(Math.round((temp - 32) / 1.8));
			tempMax = tempSign(Math.round((tempMax - 32) / 1.8));
			tempMin = tempSign(Math.round((tempMin - 32) / 1.8));

			tempDaily = tempMin + ".." + tempMax;
		} else if (isCelsius === false) {
			tempCurr = Math.round(tempCurr);
			temp = Math.round(temp);
			tempMax = Math.round(tempMax);
			tempMin = Math.round(tempMin);
			tempDaily = tempMin + ".." + tempMax;
		}

		if (timeRange === "currently") {
			return tempCurr;
		} else if (timeRange === "hourly") {
			return temp;
		} else if (timeRange === "daily") {
			return tempDaily
		}
	}

	/*
		Get cloud cover from JSON
		timeRange: 		'currently', 'hourly' or 'daily'
		dataInstance: 	number of hour or day (empty string in 'current' case)
	*/
	function getCloudCover(timeRange, dataInstance) {
		var cloudiness;
		if (timeRange === "currently") {
			cloudiness = Math.round(weatherdata.currently.cloudCover * 100)
		} else if ((timeRange === "hourly") || (timeRange === "daily")) {
			cloudiness = Math.round(weatherdata[timeRange].data[dataInstance].cloudCover * 100)
		}

		return cloudiness+"%"
	}

	/*
		Get humidity from JSON
		timeRange: 		'currently', 'hourly' or 'daily'
		dataInstance: 	number of hour or day (empty string in 'current' case)
	*/
	function getHumidity(timeRange, dataInstance) {
		var humidity;
		if (timeRange === "currently") {
			humidity = Math.round(weatherdata.currently.humidity * 100)
		} else if ((timeRange === "hourly") || (timeRange === "daily")) {
			humidity = Math.round(weatherdata[timeRange].data[dataInstance].humidity * 100)
		}

		return humidity+"%"
	}

	/*
		Get wind speed from JSON
		timeRange: 		'currently', 'hourly' or 'daily'
		dataInstance: 	number of hour or day (empty string in 'current' case)
		unit:			' m/s', ' km/h', ' mph'
	*/
	function getWindSpeed(timeRange, unit, dataInstance) {
		var windSpeed;
		if (timeRange === "currently") {
			windSpeed = weatherdata.currently.windSpeed;
		} else if ((timeRange === "hourly") || (timeRange === "daily")) {
			windSpeed = weatherdata[timeRange].data[dataInstance].windSpeed
		}

		if (unit === "m/s") {
			windSpeed = (windSpeed * 0.44704).toPrecision(2);
		} else if (unit === "km/h") {
			windSpeed = (windSpeed * 1.60934).toPrecision(2);
		}

		return windSpeed
	}

	/*
		Get wind direction from JSON and convert it
		timeRange: 		'currently', 'hourly' or 'daily'
		dataInstance: 	number of hour or day (empty string in 'current' case)
	*/
	function getWindDirection(timeRange, dataInstance) {
		var direction, wDirection;
		if (timeRange === "currently") {
			direction = weatherdata.currently.windBearing
		} else if ((timeRange === "hourly") || (timeRange === "daily")) {
			direction = weatherdata[timeRange].data[dataInstance].windBearing
		}

		switch (true) {
		case direction < 11.25:
			wDirection = '<i class="wi wi-direction-down"></i>'; //"N";
			break;
		case (direction >= 11.25 && direction < 56.25):
			wDirection = '<i class="wi wi-direction-down-left"></i>'; //"NE";
			break;
		case (direction >= 56.25 && direction < 101.25):
			wDirection = '<i class="wi wi-direction-left"></i>'; //"E";
			break;
		case (direction >= 101.25 && direction < 146.25):
			wDirection = '<i class="wi wi-direction-up-left"></i>'; //"SE";
			break;
		case (direction >= 146.25 && direction < 191.25):
			wDirection = '<i class="wi wi-direction-up"></i>'; //"S";
			break;
		case (direction >= 191.25 && direction < 236.25):
			wDirection = '<i class="wi wi-direction-up-right"></i>'; //"SW";
			break;
		case (direction >= 236.25 && direction < 281.25):
			wDirection = '<i class="wi wi-direction-right"></i>'; //"W";
			break;
		case (direction >= 281.25 && direction < 326.25):
			wDirection = '<i class="wi wi-direction-down-right"></i>'; //"NW";
			break;
		case direction >= 326.25:
			wDirection = '<i class="wi wi-direction-down"></i>'; //"N";
			break;
		}
		return wDirection
	}

	/*
		Get wind time and date from JSON
		timeRange: 		'hourly' or 'daily'
		dataInstance: 	number of hour or day
	*/
	function getTimepoint(timeRange, dataInstance) {
		var timestmp = new Date((weatherdata[timeRange].data[dataInstance].time) * 1000);
		if (timeRange === 'hourly') {
			return timestmp.getHours()
		} else if (timeRange === 'daily') {
			return timestmp.getDate() + "/" + (timestmp.getMonth()+1)
		}
	}

	function getIcon (timeRange, dataInstance) {
		var icon, symbol;
		if (timeRange === "currently") {
			icon = weatherdata.currently.icon
		} else if ((timeRange === "hourly") || (timeRange === "daily")) {
			icon = weatherdata[timeRange].data[dataInstance].icon
		}
		symbol = '<i class="wi wi-forecast-io-' + icon + '"></i>';

		return symbol
	}

	function getProbability(timeRange, dataInstance) {
		var probability;
		if ((timeRange === "hourly") || (timeRange === "daily")) {
			probability = Math.round(weatherdata[timeRange].data[dataInstance].precipProbability * 100)
		}
		return probability+"%"
	}

	return {
		fetchTemp: getTemp,
		fetchCloudCover: getCloudCover,
		fetchHumidity: getHumidity,
		fetchWindSpeed: getWindSpeed,
		fetchWindDirection: getWindDirection,
		fetchTimepoint: getTimepoint,
		fetchIcon: getIcon,
		fetchProbability: getProbability
	}
}

/*
	==================================================================================================================
	==================================================================================================================
	==================================================================================================================
*/

function showCurrentWeather() {
	var tempValue;
	var city = geoRespond._embedded["location:nearest-cities"][0]._embedded["location:nearest-city"].name;
	var adminLevel = geoRespond._embedded["location:nearest-cities"][0]._embedded["location:nearest-city"]["_links"]["city:admin1_division"].name
	var country = geoRespond._embedded["location:nearest-cities"][0]._embedded["location:nearest-city"]["_links"]["city:country"].name

	if (isCelsius === true) {
		tempValue = "°C";
	} else {
		tempValue = "°F";
	}

	$(".currentTemp").append("<span class='currTemp'>" + fetcher.fetchTemp('currently', isCelsius, false) + tempValue + "</span>")
		.append("<p>feels like " + fetcher.fetchTemp('currently', isCelsius, true) + tempValue + "</p>");

	if (adminLevel.indexOf(city) === -1) {
		$(".location").append("<p>" + city + "<br>" + adminLevel + "<br>" + country + "</p>");
	} else {
		$(".location").append("<p>" + city + "<br>" + country + "</p>");
	}

	$(".currentIcon").html(fetcher.fetchIcon('currently'));

	$(".metaInfo").append(
		"<p>Cloudiness: " + fetcher.fetchCloudCover('currently')
		+ "<br>Humidity: " + fetcher.fetchHumidity('currently')
		+ "<br>Wind: " + fetcher.fetchWindSpeed('currently', windUnit) + " " + windUnit
		+ " " + fetcher.fetchWindDirection('currently')
		+ "</p>");

	$(".dayBrief").append(responds.hourly.summary);

	$(".weekBrief").append(responds.daily.summary);
}

/*
	==================================================================================================================
	==================================================================================================================
	==================================================================================================================
*/

function showShortForecast () {
	$(".shortInstance").each(function (index) {
		$(this).append("<p class='time'>" + fetcher.fetchTimepoint('hourly', index+1) + ':00' + "</p>")
			.append("<p>" + fetcher.fetchTemp('hourly', isCelsius, false, index+1) + "</p>")
			.append("<p>" + fetcher.fetchTemp('hourly', isCelsius, true, index+1) + "</p>")
			.append("<p>" + fetcher.fetchIcon('hourly', index+1) + "</p>")
			.append("<p>" + fetcher.fetchCloudCover('hourly', index+1) + "</p>")
			.append("<p>" + fetcher.fetchHumidity('hourly', index+1) + "</p>")
			.append("<p>" + fetcher.fetchWindSpeed('hourly', windUnit, index+1) + "</p>")
			.append("<p>" + fetcher.fetchWindDirection('hourly', index+1) + "</p>")
			.append("<p>" + fetcher.fetchProbability('hourly', index+1) + "</p>");
	});
	$(".windUnit").text("Wind, " + windUnit);
	if (isCelsius === true) {
		$(".tempUnit").text("Temp, °C");
	} else {
		$(".tempUnit").text("Temp, °F");
	}
}


function showLongForecast () {
	$(".longInstance").each(function (index) {
		$(this).append("<p class='time'>" + fetcher.fetchTimepoint('daily', index+1) + "</p>")
			.append("<p>" + fetcher.fetchTemp('daily', isCelsius, false, index+1) + "</p>")
			.append("<p>" + fetcher.fetchTemp('daily', isCelsius, true, index+1) + "</p>")
			.append("<p>" + fetcher.fetchIcon('daily', index+1) + "</p>")
			.append("<p>" + fetcher.fetchCloudCover('daily', index+1) + "</p>")
			.append("<p>" + fetcher.fetchHumidity('daily', index+1) + "</p>")
			.append("<p>" + fetcher.fetchWindSpeed('daily', windUnit, index+1) + "</p>")
			.append("<p>" + fetcher.fetchWindDirection('daily', index+1) + "</p>")
			.append("<p>" + fetcher.fetchProbability('daily', index+1) + "</p>");
	});
	$(".windUnit").text("Wind, " + windUnit)
	if (isCelsius === true) {
		$(".tempUnit").text("Temp, °C");
	} else {
		$(".tempUnit").text("Temp, °F");
	}
}


function clearData () {
	 $('.data').text("")
}

/*
	==================================================================================================================
	==================================================================================================================
	==================================================================================================================
*/

function storageAvailability(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}

function togglesInitialState() {

	//check Local Storage availability
	if(storageAvailability('localStorage')) {
		storageFlag = true;
	}

	if(storageFlag === true) {

	//Initialize temperature
		isCelsius = localStorage.isCelsius || true;
		if(localStorage.isCelsius === 'true' || isCelsius === true) {
			$('#first_toggle-2').prop('checked', 'checked');
			isCelsius = true;
		}
		else if(localStorage.isCelsius === 'false' || isCelsius === false){
			$('#second_toggle-2').prop('checked', 'checked');
			isCelsius = false;
		}

	//Initialize wind speed
		windUnit = localStorage.windUnit || 'm/s';
		if(localStorage.windUnit === 'm/s' || windUnit === 'm/s') {
			$('#first_toggle').prop('checked', 'checked');
			windUnit = 'm/s';
		} else if(localStorage.windUnit === 'km/h' || windUnit === 'km/h'){
			$('#second_toggle').prop('checked', 'checked');
			windUnit = 'km/h';
		}
		else if(localStorage.windUnit === 'mph' || windUnit === 'mph'){
			$('#third_toggle').prop('checked', 'checked');
			windUnit = 'mph';
		}

	//default temperature and wind units if local storage isn't available
	} else if(storageFlag === false) {
		$('#first_toggle-2').prop('checked', 'checked');
		isCelsius = true;
		$('#first_toggle').prop('checked', 'checked');
		isCelsius = 'm/s';
	}
}

function redraw() {
	clearData();
	showCurrentWeather();
	showShortForecast();
	showLongForecast();
}

/*=========================================================
  =========================================================
  =========================================================
  =========================================================
  =========================================================
  =========================================================*/


$(document).ready(function () {
	togglesInitialState();
	TeleportAutocomplete.init('.my-input').on('change', function(value) {
		searchResult = value;
		reverseGeo();
	});

	getCoordinates().then(reverseGeo)
		.then(getWeather)
		.done(function() {
			console.log(currentPlace, '\n', geoRespond, '\n', responds);
			fetcher = fetcherMaker(responds);
			redraw();
		});

//make accordion for forecasts
	$('.accordion').accordion({
		"transitionSpeed": 800,
		transitionEasing: "cubic-bezier(0.64, 0.01, 0.15, 0.98)"
	});

//temperature value toggler
	$(".tempSettings").on('click', function () {
		if ($("#first_toggle-2").prop("checked")) {
			isCelsius = true;
			if(storageFlag === true) {
				localStorage.isCelsius = true
			}
		} else {
			isCelsius = false;
			if(storageFlag === true) {
				localStorage.isCelsius = false
			}
		}
		redraw();
	});

//wind speed value toggler
	$(".toggle_radio").on('click', function () {
		$('.my-input').val("");
		if ($("#first_toggle").prop("checked")) {
			windUnit = 'm/s';
			localStorage.windUnit = 'm/s'
		} else if ($("#second_toggle").prop("checked")) {
			windUnit = 'km/h';
			localStorage.windUnit = 'km/h'
		} else if ($("#third_toggle").prop("checked")) {
			windUnit = 'mph';
			localStorage.windUnit = 'mph'
		}
		console.log(windUnit);
		redraw();
	});

	$(".info").on("click", function() {
		$(".overlay").css("display", "block")
	})

	$(".cross").on("click", function() {
		$(".overlay").css("display", "none")
	})

	$(".overlay").on("click", function() {
		$(this).css("display", "none")
	})

});

}())

/*
Reverse geocoding:
https://api.opencagedata.com/geocode/v1/json?q=47.959123999999996+37.7931349&language=en&no_annotations=1&key=1331493ff40e8a6dc97e7346b63be27e
https://api.teleport.org/api/locations/50.315796,30.300249/?embed=location%3Anearest-cities%2Flocation%3Anearest-city

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

icons: https://erikflowers.github.io/weather-icons/

*/
