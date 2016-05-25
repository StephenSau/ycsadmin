(function(angular, CryptoJS, N){

'use strict';

var Util = N.Lib.Util;

var app = angular.module('backendApp');

app.controller('loginCtrl', ['appSettings', '$scope', 'ycsApi', 'Notification', function(appSettings, sc, ycsApi, Notification){

	var vcImgBase = appSettings.apiHost + 'vc';

	sc.vcImg = '';

	sc.refreshVC = function refreshVC(){
		sc.vcImg = vcImgBase + '?ts=' + new Date().getTime();
	};

	sc.checkLogin = function checkLogin(credentials){

		if (!credentials) {
			Notification.error('请正确填写用户名、密码和验证码');
			return;
		}

		var verifyInfo = {
			username: credentials.username,
			password: credentials.password,
			// password: sc.crypto(credentials.password)	// encrypted
			validateCodeImg: credentials.validateCodeImg
		};

		ycsApi.post('admin/user/login', verifyInfo, sc.feedBack);
	};

	// NO CRYPTO, USE HTTPS
	// sc.crypto = function crypto(info){
	// 	var keyHex = CryptoJS.enc.Utf8.parse('');
	// 	var result = CryptoJS.DES.encrypt(info, keyHex, {
	// 		mode: CryptoJS.mode.ECB,
	// 		padding: CryptoJS.pad.Pkcs7
	// 	});
	// 	return result.ciphertext.toString();
	// };

	sc.feedBack = function feedBack(msg){
		// DEBUG only, to be deprecated soon.
		if (msg && msg.re){
			Util.Data.store('ycsAdminUser', Util.Data.objToJSON(msg.re), 'local');
		}

		window.setTimeout(function(){
			window.location.replace('app/index.html');
		}, 500);
	};

	// Refresh verify code
	sc.refreshVC();
}]);

})(window.angular, window.CryptoJS, window.Neo);