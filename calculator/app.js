var operandTrigger, tempChain, opSign, wasEvalTrigger, operationTrigger, periodTrigger = "";

function calculation (operationChain) {
	var result = eval(operationChain)
	var fractionalLength = (result % 1).toString().length;
	if (fractionalLength > 10) {
		result = parseFloat(result.toPrecision(10));
	}
	return result;
}

function checkDisplayLength() {
	var displayString = "";
	displayString = ($("#display").val()).toString();
	if (displayString.length > 10) { 
		$("#display").css("font-size", "18px")
	} else {
		$("#display").removeAttr("style");
	}
}

function digitHandler(pressedButton) {
//	console.log("pressedButton = " + pressedButton);
	var displayLimit = 24;
	var displayValue = 0;
	if (operationTrigger) {
		tempChain = $("#display").val() + opSign;
		operationTrigger = false;
	};
	displayValue = $("#display").val();
//	console.log("displayValue = " + displayValue);
	var displayString = "";
	displayString = displayValue.toString();
	if (displayString.length < displayLimit) {
		if (displayValue != "0") {
			$("#display").val(displayValue + pressedButton);
		} else {
			$("#display").val(pressedButton);
		}
	}
	checkDisplayLength();
	operandTrigger = true;
	wasEvalTrigger = false;
	console.log("tempChain: " + tempChain);
}

function initialState() {
	$("#display").removeAttr("style");
	$("#display").val("0");
	operandTrigger = false;
	wasEvalTrigger = false;
	operationTrigger = false;
	periodTrigger = false;
	tempChain = "";
	opSign = "";
	
}

function periodHandler() {
	$("#display").val($("#display").val() + ".");
	if (operandTrigger == false) {
		$("#display").val("0.");
	};
	$("#period").attr("disabled", "disabled");
	wasEvalTrigger = false;
	operandTrigger = true;
	periodTrigger = true;
	operationTrigger = false
}

function operationHandler(sign) {
	periodTrigger = true;
	opSign = sign;
	operandTrigger = false;
	operationTrigger = true;
	lastOperand = $("#display").val();
	wasEvalTrigger = false;
}


/*-----------MAIN FUNCTION-------------
---------------------------------------*/
$(document).ready(function () {
	
	$("#display").val("0");
	
	$(".digit").click(function() {
		digitHandler(this.value);
	});
	
	$("#period").click(function() {
		periodHandler();
	});
	
	$(".operation").click(function() {
		operationHandler(this.value);
	});
	
	$("#reset").click(function() {
		initialState();
	});
	
	$("#clear").click(function() {
		$("#display").removeAttr("style");
		$("#display").val("0");
		periodTrigger = true;
	});
	
	$("#percent").click(function() {
		
	});
	
	$("#result").click(function() {
		
	});
	
	
	/*-----Input from a keyboard--------
	------------------------------------*/
	$(this).keydown(function(e) {
		var key = e.which || e.keyCode;
		var keyValue = 0;
		if ((key >= 48 && key <= 52) || (!e.shiftKey && key == 53) || key == 54 || key == 55 || (!e.shiftKey && key == 56) || key == 57) {													// numbers  
			keyValue = String.fromCharCode(e.keyCode);
//			console.log("keyCode = " + key + "; keyValue = " + keyValue);
			digitHandler(keyValue);
		}
		
		if (key >= 96 && key <= 105) {								// Numeric keypad 
			keyValue = String.fromCharCode(e.keyCode - 48);
//			console.log("keyCode = " + key + "; keyValue = " + keyValue);
			digitHandler(keyValue);
		}
		
		if ((periodTrigger == false) && (key == 188 || key == 190 || key == 110)) {	// comma, period and keypad period
			periodHandler();
//			console.log("keyCode = " + key + "; keyValue = " + keyValue);
			
		}
		
		if (key == 8) {												// backspace
			$("#display").val($("#display").val().slice(0, -1));
			if ($("#display").val() == "") {
				$("#display").val("0");
			}
//			console.log("keyCode = " + key);
		}
		
		if (key == 27) {											// Esc
			initialState()
//			console.log("keyCode = " + key);
		}
		
		if (key == 13) {											// Enter
		
//			console.log("keyCode = " + key);
		}
		
		if ((key == 106 || key == 107 || key == 109 || key == 111) || 	//numpad opSigns
			key == 191 || (e.shiftKey && (key == 187 || key == 189 || key == 56))) {	// main opSigns
			switch (key) {
				case 106: keyValue = "*"; break;
				case 107: keyValue = "+"; break;
				case 109: keyValue = "-"; break;
				case 111: keyValue = "/"; break;
				case 56: keyValue = "*"; break;
				case 187: keyValue = "+"; break;
				case 189: keyValue = "-"; break;
				case 191: keyValue = "/"; break;
			}
//			console.log(keyValue);
//			operationHandler(keyValue);
		}
		
		if (e.shiftKey && key == 53) {								//percent
			keyValue = "%";
			console.log(keyValue);
		}
	});


	
	
	
	
	
	
	
	
	
	
	
	
	
	
});