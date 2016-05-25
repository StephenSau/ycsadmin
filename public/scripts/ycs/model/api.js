(function(angular, N){

'use strict';

var app = angular.module('backendApp');

var Util = N.Lib.Util;
var $ = N.$;

app.factory('ycsApi', function(appSettings, fsErrorCode, $http, Notification, $timeout, $cookies){

	var apiFactory = {};

	apiFactory.baseUrl = appSettings.apiHost;

	// Generate queryUrl
	apiFactory.getQueryUrl = function apiGetQueryUrl(path, host, port){
		var queryUrl = (host && host.length > 0 ? String(host) : '') + 
									 (port && port.length > 0 ? ':' + port + '/' : '') + 
									 apiFactory.baseUrl +
									 String(path);
		return queryUrl;
	};


	// File System

	apiFactory.fsUrl = 'http://' + appSettings.fsHost + '/';

	// Generate File System queryUrl
	apiFactory.getFsQueryUrl = function apiGetQueryUrl(path, host, port){
		var queryUrl = (host && host.length > 0 ? String(host) : '') + 
									 (port && port.length > 0 ? ':' + port + '/' : '') + 
									 apiFactory.fsUrl +
									 String(path);
		return queryUrl;
	};

	// GET
	apiFactory.get = function apiGet(path, cb, host, port) {
		if (!this.checkUserInfo()) { return; }

		var queryUrl = apiFactory.getQueryUrl(path, host, port);

		$http({
			method: 'GET',
			url: queryUrl,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		})
			.success(function(data){
				if (!data || data.status !== '200') {
					apiFactory.errHandler(data);
				} else if (cb && typeof cb === 'function'){
					cb(data);
				}
				return data;
			})
			.error(function(){ apiFactory.errHandler(); });
	};

	// POST
	apiFactory.post = function apiPost(path, qData, cb, host, port, errCb) {
		// Skip User Info Checking for login post
		if (path !== 'admin/user/login'){
			if (!this.checkUserInfo()) { return; }
		}

		var queryUrl = apiFactory.getQueryUrl(path, host, port);

		$http({
			method: 'POST',
			url: queryUrl,
			data: apiFactory.translateJSONparams(qData),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		})
			.success(function(data){
				if (!data || data.status !== '200') {
					apiFactory.errHandler(data, errCb);
				} else if (cb && typeof cb === 'function'){
					cb(data);
				}
				return data;
			})
			.error(function(e){ apiFactory.errHandler(e, errCb); });
	};	

	apiFactory.postForm = function apiPostForm(path, qData, cb, errCb, host, port) {
		if (!this.checkUserInfo()) { return; }

		var queryUrl = apiFactory.getQueryUrl(path, host, port);

		$http({
			method: 'POST',
			url: queryUrl,
			data: qData,
			headers: { 'Content-Type': undefined},
			transformRequest: function (data){
				var formData = new FormData();
				Object.keys(data).forEach(function(key){
					formData.append(key, data[key]);
				});
				return formData;
			}
		})
			.success(function(data){
				if (!data || data.status !== '200') {
					if (errCb && typeof errCb === 'function'){
						errCb(data);
					} else {
						apiFactory.errHandler(data);
					}
				} else if (cb && typeof cb === 'function'){
					cb(data);
				}
				return data;
			})
			.error(function(e){apiFactory.errHandler(e, errCb); });
	};

	apiFactory.postImage = function apiPostImage(path, qData, cb, errCb, host, port) {
		if (!this.checkUserInfo()) { return; }

		var queryUrl = apiFactory.getFsQueryUrl(path, host, port);

		Notification('开始上传');

		$http({
			method: 'POST',
			url: queryUrl,
			data: qData,
			headers: {
				'Content-Type': undefined
				// 'Access-Control-Allow-Credentials': true,
				// 'Access-Control-Allow-Origin': '*'
			},
			transformRequest: function (data){
				var formData = new FormData();
				Object.keys(data).forEach(function(key){
					formData.append(key, data[key]);
				});
				return formData;
			}
		})
			.success(function(data){
				// console.log('upload', data);
				// if (!data || data.status !== '200') {
				// 	apiFactory.errHandler(data);
				// } else if (cb && typeof cb === 'function'){
				if (cb && typeof cb === 'function'){
					cb(data);
				}
				return data;
			})
			.error(function(e){ apiFactory.errHandler(e); });
	};

	// POST to FS

	apiFactory.postFS = function apiPost(path, qData, cb, errCb, host, port) {
		if (!this.checkUserInfo()) { return; }

		var queryUrl = apiFactory.getFsQueryUrl(path, host, port);

		// Notification({message: queryUrl, title: 'POST FS API'});

		$http({
			method: 'POST',
			url: queryUrl,
			data: apiFactory.translateJSONparams(qData),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
				// 'Access-Control-Allow-Credentials': true,
				// 'Access-Control-Allow-Origin': '*'
			}
		})
			.success(function(data){
				if (!data || data.status !== '200') {
					if (errCb && typeof errCb === 'function'){
						errCb(data);
					} else {
						apiFactory.errHandler(data);
					}
				} else if (cb && typeof cb === 'function'){
					cb(data);
				}
				return data;
			})
			.error(function(e){apiFactory.errHandler(e, errCb); });
	};

	// POST to get application/octet-stream like XLS etc

	apiFactory.postToGetStream = function apiPost(path, qData, cb, host, port) {
		if (!this.checkUserInfo()) { return; }

		var queryUrl = apiFactory.getQueryUrl(path, host, port);

		$http({
			method: 'POST',
			url: queryUrl,
			data: apiFactory.translateJSONparams(qData),
			responseType: 'arraybuffer',	// Prevent export file curruption
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		})
			.success(function(data){
				cb(data);
				return data;
			})
			.error(function(e){ apiFactory.errHandler(e); });
	};	


	// Error Msg
	apiFactory.errHandler = function apiErrorHandler (errObj, errCb) {
		// Force Logout
		if (Number(errObj.errorcode) === 1034){
			apiFactory.forceLogout();
			Notification.error({message: errObj.errormsg, title: 'ERROR: '+ errObj.errorcode, delay: 5000});
			return;
		
		// Check vendor|user 's account name availability
		} else if (Number(errObj.errorcode) === 3233 || Number(errObj.errorcode) === 3113){
			Notification.error({message: errObj.errormsg, title: '账户已存在', delay: 5000});
			if (errCb && typeof errCb === 'function'){
				errCb(errObj);
			}
			return errObj;
		}

		if (errObj && errObj.errormsg && errObj.errorcode){
			Notification.error({message: errObj.errormsg, title: 'ERROR: '+ errObj.errorcode, delay: 5000});
		} else if (errObj && errObj.errorcode) {
			// Polyfill for the missing FS errmsg
			if (fsErrorCode[errObj.errorcode] && fsErrorCode[errObj.errorcode].length > 0){
				Notification.error({message: fsErrorCode[errObj.errorcode], title: 'ERROR: '+ errObj.errorcode, delay: 5000});
			} else {
				Notification.error({message: 'ERROR:'+ errObj.errorcode, delay: 5000});
			}
		} else {
			window.console.warn('Oops, please check your requested URL');
		}

		if (errCb && typeof errCb === 'function'){
			errCb(errObj);
		}
		return;
	};

	apiFactory.translateJSONparams = function translateJSONparams(jsonObj){
		var result = '';
		var count = 0;
		Object.keys(jsonObj).forEach(function(key){
			result += (count > 0 ? '&' : '') + String(key) + '=' + encodeURIComponent(String(jsonObj[key]));
			count++;
		});
		return result;
	};

	apiFactory.checkUserInfo = function checkUserInfo(){
		var adminObj = Util.Data.get('ycsAdminUser', 'local');

    if (!adminObj || !adminObj.username || adminObj.username.length === 0){
    	apiFactory.forceLogout();
			Notification.error({message: '会话已失效，请重新登录', delay: 5000});
			return false;
    }

    return true;
	};

	apiFactory.forceLogout = function forceLogout(){
		$timeout(function(){
			$cookies.remove('JSESSIONID');
			Util.Data.deleteStorage('ycsAdminUser', 'local');
			window.location.replace('../index.html');
		}, 500);
	};

	return apiFactory;
});

})(window.angular, window.Neo);