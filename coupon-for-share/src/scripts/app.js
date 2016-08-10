var infoObject = {};
var couponObject = {};
function getIds(urlParam, wantedItem) {

	var url = urlParam,
		splitted = [],
		id = '';

	url = url.toLowerCase();
	splitted = url.split('&');

	splitted.forEach(function(item) {
		if (item.indexOf(wantedItem) !== -1) {
			id = item;
		}
	});

	splitted = id.split(wantedItem + '=');
	return splitted[1];
}

function getInitialInfo(installationId, serviceId) {
	var url = 'http://test-yaskravo-app.azurewebsites.net/api/discountcodes/info?'
			+ 'installationid=' + installationId
			+ '&serviceid=' + serviceId;
	console.log(url);
	return $.ajax({
		url: url,
		type: 'GET',
		datatype: 'json',
		error: function(respond) {
			console.log(respond);
		},
		success: function(respond) {
			console.log(respond);
			infoObject = respond;
		}
	});
}

function getCouponCode(installationId, serviceId) {
	var url = 'http://test-yaskravo-app.azurewebsites.net/api/discountcodes/code?'
			+ 'installationid=' + installationId
			+ '&serviceid=' + serviceId;
	console.log(url);
	return $.ajax({
		url: url,
		type: 'GET',
		datatype: 'json',
		error: function(respond) {
			console.log(respond);
		},
		success: function(respond) {
			console.log(respond);
			couponObject = respond;
		}
	});
}

function isServiceInactive() {
	if (infoObject.service.status === 'Inactive' || infoObject.service.status === 'Expired') {
		$('.coupon-share').addClass('hide-me');
		$('.service-invalid').removeClass('hide-me');
	} else {
		showInfoToNewUser();
	}
}

function isCouponInactive() {
	if (infoObject.code) {
		if (infoObject.code.status === 'Expired') {
			$('.coupon-share').addClass('hide-me');
			$('.coupon-invalid').removeClass('hide-me');
		}
	}
}


function showCode() {
	$('.coupon-share').addClass('hide-me');
	$('.coupon-code').addClass('get-in')
		.removeClass('hide-me');
}

function initialPopulate() {
	$('.usage-info').text(infoObject.service.rules);
	$('.coupon-img').attr('src', infoObject.service.couponUrl)
		.on('load', function() {
			$('.wrapper').addClass('get-in')
				.removeClass('hide-me');
		});
}

function codePopulate() {
	$('.deal-code').text(couponObject.code.value);
	$('.deal-time').text(couponObject.code.validThrough);
}

function showUsageInfo() {
	$('.overlay').addClass('fade-in')
		.removeClass('hide-me fade-out');
}

function showInfoToNewUser() {
	if (!infoObject.code) {
		showUsageInfo();
	}
}

function hideUsageInfo() {
	$('.overlay').removeClass('fade-in')
		.addClass('fade-out');
	setTimeout(function() {
		$('.overlay').addClass('hide-me');
	}, 500);
}

$(document).ready(function() {
	// var currentUrlParam = window.location.search;
	// var installationId = getIds(currentUrlParam, 'installationnid');
	// var couponGlobalId = getIds(currentUrlParam, 'couponglobalid');
	var serviceId = '4',
		installationId = '123123';

	getInitialInfo(installationId, serviceId).done(function() {
		initialPopulate();
		isServiceInactive();
		isCouponInactive();
	});
	$('.fb-yes').on('click', function() {
		getCouponCode(installationId, serviceId).done(function() {
			codePopulate();
			showCode();
		});
	});
	$('.show-rules').on('click', showUsageInfo);
	$('.modal-close').on('click', hideUsageInfo);


});





// 1 - exp/inactive
// 2 - exp/active
// 3 - no exp/inactive
// 4 - no exp/active


// {
// 	rules: Правила,
// 	service: {
// 		active/inactive/expired,
// 		Срок действия},
// 	code: {} или {
// 		active/expired/redeemed,
// 		Код,
// 		Срок действия,
// 		Когда погашен}
// 	couponUrl: Ссылка на купон
// }
