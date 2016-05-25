(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('ticketOrderCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', '$interval', function (sc, ycsUtil, ycsApi, Notification, $modal, $interval) {
  // if (!sc.qData) {
  // 	sc.qData = {};
  // }

  sc.editPrice = false;

  sc.payTypeOpts = [
  	{value: 0, label: '支付宝支付'},
  	{value: 1, label: '网上银行支付'},
  	{value: 2, label: '线下支付'},
  	{value: 3, label: '微信支付'}
  ];

  sc.translateStatus = function translateStatus(status){
    var statusMap = {0:'待审核', 5:'待付款', 10:'已付款', 11:'已付款(金额有误)', 15:'已收款', 20:'服务中', 30:'已完成', 40:'申请中止', 42:'已取消', 44:'已中止', 46:'已删除', 48:'已作废'};
    return statusMap[status];
  };

  sc.translatePaytype = function translatePaytype(paytype){
    var paytypeMap = {0:'支付宝支付', 1:'网上银行支付', 2:'线下支付', 3:'微信支付'};
    return paytypeMap[paytype];
  };

  // 修改服务项服务规格

	sc.modifyServiceItemSpecs = function modifyServiceItemSpecs(){
		var modalInstance = $modal.open({
	    animation: true,
	    templateUrl: 'tpl/modal/ticket/modifyOrderSpecs.html',
	    size: 'lg',
	    controller: 'modifyOrderSpecsModalCtrl',
	    backdrop: 'static',
	    resolve: {
				orderDetail: function() {
					return {
						func: 'edit',
						data: angular.extend({}, sc.qData)
					};
				}
      }
	  });

	  modalInstance.result.then(function (orderDetail){
	  	sc.orderModal.getExistingData();
	  });
	};

	// 更换服务商

	sc.changeVendor = function changeVendor(){

		var modalInstance = $modal.open({
	    animation: true,
	    templateUrl: 'tpl/modal/ticket/modifyOrderSpecs.html',
	    size: 'lg',
	    controller: 'modifyOrderSpecsModalCtrl',
	    backdrop: 'static',
	    resolve: {
				orderDetail: function() {
					return {
						func: 'changeVendor',
						data: angular.extend({}, sc.qData)
					};
				}
      }
	  });

	  modalInstance.result.then(function (orderDetail){
	  	sc.orderModal.getExistingData();
	  });

	};

	// 修改总价
	
	sc.priceSaved = function priceSaved(data){
    Notification.success('修改总价成功');
    sc.orderModal.getExistingData();
  };

	sc.startEditPrice = function startEditPrice(){
		sc.editPrice = true;
	};

	sc.submitEditPrice = function submitEditPrice(){
		sc.editPrice = false;

		var ajaxUrl = 'admin/order/updateOrderInfo';
		var qData = {
			id: sc.qData.orderid,
			price: sc.qData.tmpPrice
		};

		ycsApi.post(ajaxUrl, qData, sc.priceSaved);
	};

	sc.cancelEditPrice = function cancelEditPrice(){
		sc.editPrice = false;
		delete sc.qData.tmpPrice;
	};

	// 修改支付方式

	sc.paytypeSaved = function priceSaved(data){
    Notification.success('修改支付方式成功');
    sc.orderModal.getExistingData();
  };

	sc.startEditPaytype = function startEditPaytype(){
		sc.editPaytype = true;
	};

	sc.submitEditPaytype = function submitEditPaytype(){
		sc.editPaytype = false;

		var ajaxUrl = 'admin/order/updateOrderInfo';
		var qData = {
			id: sc.qData.orderid,
			paytype: sc.qData.tmpPaytype
		};

		ycsApi.post(ajaxUrl, qData, sc.paytypeSaved);
	};

	sc.cancelEditPaytype = function cancelEditPaytype(){
		sc.editPaytype = false;
	};

	// 修改订单备注

	sc.remarkSaved = function remarkSaved(data){
    Notification.success('修改订单备注成功');
    sc.orderModal.getExistingData();
  };

	sc.submitEditRemark = function submitEditRemark(){
		var ajaxUrl = 'admin/order/updateOrderInfo';
		var qData = {
			id: sc.qData.orderid,
			remark: sc.qData.remark
		};

		ycsApi.post(ajaxUrl, qData, sc.remarkSaved);
	};

	// 修改订单状态

	sc.statusSaved = function statusSaved(data){
    Notification.success('修改订单状态成功');
    sc.orderModal.getExistingData();
  };

	sc.changeTicketStatus = function changeTicketStatus(detail, status){
		var ajaxUrl = 'admin/order/updateOrderInfo';

		var qData = {};

		qData.id = detail.orderid;
		qData.status = status;

		ycsApi.post(ajaxUrl, qData, sc.statusSaved);
	};

}]);

})(window.angular);