/*
	Please, don't steal my appID - I use free account with requests limitation.
	You can create account and get your own appID here: https://developer.forecast.io/
*/

//Wrap it all in IIFE to prevent global scope pollution with my variables
(function() {
var currentPlace = {},
	wRequestUrl = "",
	responds = {},
	geoRespond = {},
	searchResult = {},
	wAppId = "5fb8da6c7819d24192882b5b6934556d",
	fahrenheitCountries = ['United States', 'Bahamas', 'Belize', 'Cayman Islands', 'Palau', 'Puerto Rico', 'Guam'],
	fahrenheitCountry,
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
	wRequestUrl = "https://api.forecast.io/forecast/" + wAppId + "/" + lat + "," + lon;

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
		dataInstance: 	number of hour or day (empty string or nothing in 'current' case)
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
		dataInstance: 	number of hour or day (empty string or nothing in 'current' case)
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
		dataInstance: 	number of hour or day (empty string or nothing in 'current' case)
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
		dataInstance: 	number of hour or day (empty string or nothing in 'current' case)
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
		dataInstance: 	number of hour or day (empty string or nothing in 'current' case)
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
		dataInstance: 	number of hour or day (empty string or nothing in 'current' case)
	*/
	function getTimepoint(timeRange, dataInstance) {
		var timestmp = new Date((weatherdata[timeRange].data[dataInstance].time) * 1000);
		if (timeRange === 'hourly') {
			return timestmp.getHours()
		} else if (timeRange === 'daily') {
			return timestmp.getDate() + "/" + (timestmp.getMonth()+1)
		}
	}

	/*
		Get weather condition from JSON and convert it to an icon
		timeRange: 		'hourly' or 'daily'
		dataInstance: 	number of hour or day (empty string or nothing in 'current' case)
	*/
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

	/*
		Get precipitation probability from JSON
		timeRange: 		'hourly' or 'daily'
		dataInstance: 	number of hour or day (empty string or nothing in 'current' case)
	*/
	function getProbability(timeRange, dataInstance) {
		var probability;
		if ((timeRange === "hourly") || (timeRange === "daily")) {
			probability = Math.round(weatherdata[timeRange].data[dataInstance].precipProbability * 100)
		}
		return probability+"%"
	}

	/*
		Get brief information about weather from JSON
		timeRange: 		'hourly' or 'daily'
		unit:			' m/s', ' km/h', ' mph'
		isCelsius: 		true - Celsius, false - Farenheit
	*/
	function getBriefInfo(timeRange, unit, isCelsius) {

		function tempConverter(inputString) {
			var outputString = inputString;
			var dirtyValue = inputString.match(/-?\d+°\w/);
			if (dirtyValue) {
				var valueF = Number.parseInt(dirtyValue, 10);
				var valueC = Math.round((valueF - 32) / 1.8);
				outputString = inputString.replace(dirtyValue, valueC + '°C');
			}
			return outputString;
		}

		function lengthConverter(inputString) {
			var outputString = inputString;
			function converter(element, index, array) {
				element = Math.round(element*2.54);
				return element;
			}
			var parenthesis = inputString.match(/\(.*\)/);
			if (parenthesis) {
				parenthesis = parenthesis.toString();
				var values = parenthesis.match(/\d+/g);
		  		var x = values.map(converter);
				for(var i = 0; i < x.length; i++) {
		  			outputString = inputString.replace(values[i], x[i]);
				}
				outputString = outputString.replace(/in.\)/g, 'centimeters)');
			}
			return outputString;
		}

		var summary = weatherdata[timeRange].summary;
		if (isCelsius === true) {
			summary = tempConverter(summary);
		}
		if (unit === 'm/s' || 'km/h') {
			summary = lengthConverter(summary);
		}
		return summary;
	}

	return {
		fetchTemp: getTemp,
		fetchCloudCover: getCloudCover,
		fetchHumidity: getHumidity,
		fetchWindSpeed: getWindSpeed,
		fetchWindDirection: getWindDirection,
		fetchTimepoint: getTimepoint,
		fetchIcon: getIcon,
		fetchProbability: getProbability,
		fetchBriefInfo: getBriefInfo
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
	// outerScopeCountry = country;

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

	$(".dayBrief").append(fetcher.fetchBriefInfo('hourly', windUnit, isCelsius));
	$(".weekBrief").append(fetcher.fetchBriefInfo('daily', windUnit, isCelsius));


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


function togglesInitialState() {

	function setTemperatureToggler() {
		if (isCelsius === true)
			$('#first_toggle-2').prop('checked', 'checked')
		else
			$('#second_toggle-2').prop('checked', 'checked')
	}

	function setWindToggler() {
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
	}

	//check Local Storage availability
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

	if(storageAvailability('localStorage')) {
		storageFlag = true;
	} else {
		storageFlag = false;
	}

	if(storageFlag === true) {

	//Decision - Fahrenheit or Celsius
		if(localStorage.isCelsius !== undefined)
			isCelsius = localStorage.isCelsius === 'true'
		else if (fahrenheitCountry !== undefined) {
				isCelsius = !fahrenheitCountry;
			}
			else {
				isCelsius = true
			}

		setTemperatureToggler();

	//Initialize wind speed
		windUnit = localStorage.windUnit || windUnit;
		setWindToggler();

	//default temperature and wind units if local storage isn't available
	} else if(storageFlag === false) {

		setTemperatureToggler();
		setWindToggler();
	}
}

//check if user's country use Fahrenheit scale
function isFahrenheitCountry() {
	var country = geoRespond._embedded["location:nearest-cities"][0]._embedded["location:nearest-city"]["_links"]["city:country"].name
	if (fahrenheitCountries.indexOf(country) == -1) {
		fahrenheitCountry = false;
		isCelsius = true;
		windUnit = 'm/s';
	} else {
		fahrenheitCountry = true;
		isCelsius = false;
		windUnit = 'mph';
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

	getCoordinates().then(reverseGeo)
		.then(getWeather)
		.done(function() {
			console.log(currentPlace, '\n', geoRespond, '\n', responds);
			fetcher = fetcherMaker(responds);
			isFahrenheitCountry();
			togglesInitialState();
			redraw();
		});

	// togglesInitialState();
	TeleportAutocomplete.init('.my-input').on('change', function(value) {
		searchResult = value;
		reverseGeo();
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
			if(storageFlag === true) {
				localStorage.windUnit = 'm/s'
			}
		} else if ($("#second_toggle").prop("checked")) {
			windUnit = 'km/h';
			if(storageFlag === true) {
				localStorage.windUnit = 'km/h'
			}
		} else if ($("#third_toggle").prop("checked")) {
			windUnit = 'mph';
			if(storageFlag === true) {
				localStorage.windUnit = 'mph'
			}
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