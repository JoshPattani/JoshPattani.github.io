// This can be incorporated later in the visualizer to simulate the effects in different environmental conditions

// var StdTemp = 72;
// var StdHumidity = 45;
// 	// Fetch parameters for and calculate the sound velocities

// 	var playedTemperatureImperial = Math.round (100*PlayedTemperature.value) / 100;

//  <!--
// // Temperature conversion

// function farenheitToCentigrade (farenheit)
// {
//   return (5 / 9 * ( 1.0 * farenheit + 40 ) - 40);
// }

// -->
// 	var playedTemperatureCent = farenheitToCentigrade (PlayedTemperature.value);

// 	var playedTemperatureMetric = Math.round (100*playedTemperatureCent) / 100;

// 	var playedHumidity = PlayedHumidity.value;

//     // Calc sound velocities in Metric. These results are in cm/sec.

// <!-- from AcousticCalc

// Calculates the speed of sound at the specified
// ambient temperature and relative humidity (Yang Yili).
// ambientTemp must be in deg F if English is TRUE, else deg C.
// Result is returned in cm/sec if the global English is FALSE.
// Result is returned in inches/sec of the global English is TRUE.

// function speedOfSound (ambientTemp, humidity)
// {
// 	var pseudoTemp;
// 	var a = new Array(16);
// 	var T;
// 	var h;
// 	var f;
// 	var Psv;
// 	var Xw;
// 	var c;
// 	var Xc;
// 	var speed;
// 	var p = 101000;

// 	if (English) {
// 		pseudoTemp = farenheitToCentigrade (ambientTemp);
// 	} else {
// 		pseudoTemp = 1.0 * ambientTemp;
// 	}

// 	a[0] = 331.5024;
// 	a[1] = 0.603055;
// 	a[2] = -0.000528;
// 	a[3] = 51.471935;
// 	a[4] = 0.1495874;
// 	a[5] = -0.000782;
// 	a[6] = -1.82e-7;
// 	a[7] = 3.73e-8;
// 	a[8] = -2.93e-10;
// 	a[9] = -85.20931;
// 	a[10] = -0.228525;
// 	a[11] = 5.91e-5;
// 	a[12] = -2.835149;
// 	a[13] = -2.15e-13;
// 	a[14] = 29.179762;
// 	a[15] = 0.000486;

// 	T = pseudoTemp + 273.15;
// 	h = 1.0 * humidity /100.0;
// 	f = 1.00062 + 0.0000000314 * p + 0.00000056 * pseudoTemp * pseudoTemp;

// 	Psv = Math.exp (0.000012811805 * T * T - 0.019509874 * T +
// 		       34.04926034 - 6353.6311 / T);

// 	Xw = h * f * Psv / p;
// 	c = 331.45 - a[0] - p * a[6] - a[13] * p * p;
// 	c = Math.sqrt(a[9] * a[9] + 4 * a[14] * c);
// 	Xc = ((-1) * a[9] - c) / ( 2 * a[14]);

// 	speed = a[0] + a[1] * pseudoTemp + a[2] * pseudoTemp * pseudoTemp +
// 		(a[3] + a[4] * pseudoTemp + a[5] * pseudoTemp * pseudoTemp) * Xw +
// 		(a[6] + a[7] * pseudoTemp + a[8] * pseudoTemp * pseudoTemp) * p +
// 		(a[9] + a[10] * pseudoTemp + a[11] * pseudoTemp * pseudoTemp) * Xc +
// 		a[12] * Xw * Xw + a[13] * p * p + a[14] * Xc * Xc +
// 		a[15] * Xw * p * Xc;

// 	if (English) {
// 		speed = speed * 100 / 2.54;
// 	} else {
// 		speed = speed * 100;
// 	}

// 	return speed;
// }

// // -->

// 	var calcPlayedSoundVelocity = speedOfSound (playedTemperatureCent, playedHumidity);

// 	// Covert to m/sec to two decimal places, and also feet to two decimal places.

// 	var calcPlayedSoundVelocityMetric = Math.round (calcPlayedSoundVelocity) / 100;
// 	var calcPlayedSoundVelocityImperial = Math.round (100*calcPlayedSoundVelocity/2.54/12) / 100;
