// (function(angular, N){

// 'use strict';

// var app = angular.module('backendApp');

// app.controller('industryCategoryModalCtrl', ['$scope', 'industryInfo', '$modalInstance', 'ycsUtil', 'ycsApi', 'Notification', function (sc, industryInfo, $modalInstance, ycsUtil, ycsApi, Notification) {
// 	sc.industries = [];

// 	sc.currentSelected = null;

// 	sc.getExistingData = function getExistingData(){
// 		var industries = N.Lib.industryCategory;
// 		sc.industries = industries;
// 	};

// 	sc.checkSelected = function checkSelected(code){
// 		sc.currentSelected = code;
// 	};

//   sc.save = function save() {
  
//     $modalInstance.close(industryInfo);
//   };

//   sc.cancel = function cancel () {
//     $modalInstance.dismiss('cancel');
//   };

//   sc.getExistingData();

// }]);

// })(window.angular, window.Neo);