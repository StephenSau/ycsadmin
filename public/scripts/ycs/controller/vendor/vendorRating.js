(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('vendorRatingCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$state', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $state) {
  sc.getExistingData = function getExistingData(){
    var ajaxUrl = 'admin/servicer/servicerList';
    var qData = {};
    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  };  

  sc.fillExitingData = function fillExitingData(data){
    sc.detail = data.re.servicerList;
    sc.detail.forEach(function(vendor){
    	vendor.score = (parseFloat(vendor.score) * 100) / 100;
    });
  };

  sc.backToList = function backToList(){
    $state.go('vendor');
  };

  sc.dataSaved = function dataSaved(backToList, data){

    Notification.success('服务商评分保存成功！');

    if (backToList){
      sc.backToList();
    } else{
    	sc.getExistingData();
    }
  };

  sc.save = function save(detail, backToList){
  	var ajaxUrl = 'admin/servicer/editServicerScore';

  	detail.forEach(function(vendor){
  		vendor.servicerId = vendor.id;
  		vendor.score = Number(vendor.score).toPrecision(3);
  		vendor.score = parseFloat(vendor.score);

  	});

    var qData = {
    	scoreList : angular.toJson(detail)
    };
    
    ycsApi.post(ajaxUrl, qData, sc.dataSaved.bind(this, backToList));
  };

  sc.getExistingData();
}]);

})(window.angular);