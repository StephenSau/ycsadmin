(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('ticketServiceCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$filter', function (sc, ycsUtil, ycsApi, Notification, $filter) {

  sc.dataSaved = function dataSaved(data){
    Notification.success('修改步骤状态成功');
    sc.orderModal.getExistingData();
    sc.currentEdit = '';
  };

  sc.changeSerivceStepsStatus = function changeSerivceStepsStatus(id, orderno, siid, status, modified){
  	var ajaxUrl = 'admin/order/updateStepStatus';
		var qData = {
			id: id,
			orderno: orderno,
			siid: siid,
			status: status
		};

		if (modified && sc.currentEdit === id){
			qData.modified = $filter('date')(modified, 'yyyy-MM-dd HH:mm:ss');
		}

		ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };

  sc.showEditWrapper = function showEditWrapper(id){
  	sc.currentEdit = id;
  	sc.changeTime = new Date();
  };

  sc.hiddenEditWrapper = function hiddenEditWrapper(){
  	sc.currentEdit = '';
  };

}]);

})(window.angular);