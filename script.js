$(document).ready(function () {
	// $('#front').css('display', 'block');

	$('.frontEnd').on('click', function () {
		$('#front').css('display', 'block');
		$(this).css('opacity', '1');
		// $('.frontList').css('display', 'block');
		$('#data, #back').css('display', 'none');
		$('.dataVisualization, .backEnd').css('opacity', '.2').css('background', '#a2a2a2');

	});
	// $('.backEnd').on('click', function () {
	// 	$('#back, .backList').css('display', 'block');
	// 	$(this).css('opacity', '1');
	// 	// $('.backList').css('display', 'block');
	// 	$('#front, #data, .frontList, .dataList').css('display', 'none');
	// 	$('.frontEnd, .dataVisualization').css('opacity', '.4');
	// });
	// $('.dataVisualization').on('click', function () {
	// 	$('#data, .dataList').css('display', 'block');
	// 	$(this).css('opacity', '1');
	// 	// $('.dataList').css('display', 'block');
	// 	$('#front, #back, .frontList, .backList').css('display', 'none');
	// 	$('.frontEnd, .backEnd').css('opacity', '.4');
	// })
})