(function(angular){

'use strict';

var app = angular.module('backendApp');

// Modal：选择服务

app.controller('editServiceDetail', ['$scope', 'ycsApi', 'serviceDetail', '$modalInstance', '$filter', function(sc, ycsApi, serviceDetail, $modalInstance, $filter){
	sc.serviceDetail = serviceDetail;

	sc.serviceList = [];
	sc.serviceSearch = null;

	sc.fillExitingData = function fillExitingData(data){
		sc._serviceList = data.re;
		sc.serviceList = angular.extend({}, sc._serviceList);
	};

	sc.getServices = function getServices() {
		var ajaxUrl = 'admin/serviceItem/qryServiceList';
		var qData = {};
		ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
	};

	sc.checkIfSelected = function checkIfSelected(item) {
		if (sc.serviceDetail.currentSelected.length === 0){
			return false;
		}
		return sc.serviceDetail.currentSelected[0].name.indexOf(item) > -1;
	};

	sc.toggleSelected = function toggleSelected (item) {
		sc.serviceDetail.currentSelected = [];
		var itemIndex = sc.serviceDetail.currentSelected.indexOf(item);
		if ( itemIndex === -1){
			sc.serviceDetail.currentSelected.push(item);
		} else {
			sc.serviceDetail.currentSelected.splice(itemIndex, 1);
		}
	};

	sc.filterRequirement = function filterRequirement() {
		var query = sc.serviceSearch;
 		sc.serviceList = $filter('filter')(sc._serviceList, {name: query});
	};

	sc.delSelected = function delSelected(index){
		sc.serviceDetail.currentSelected.splice(index, 1);
	};

	sc.ok = function ok () {
		$modalInstance.close(sc.serviceDetail.currentSelected);
	};

	sc.cancel = function cancel () {
		$modalInstance.dismiss('cancel');
	};

	sc.getServices();

}]);

// Modal：选择服务商

app.controller('editVendorDetail', ['$scope', 'ycsApi', 'vendorDetail', '$modalInstance', '$filter', function(sc, ycsApi, vendorDetail, $modalInstance, $filter){
	sc.vendorDetail = vendorDetail;

	sc.vendorList = [];
	sc.vendorSearch = null;

	sc.fillExitingData = function fillExitingData(){
		sc._vendorList = vendorDetail.vendorList;
		sc.vendorList = angular.copy(sc._vendorList, []);
	};

	sc.toggleSelected = function toggleSelected (item) {
		sc.vendorDetail.currentSelected = item;
	};

	sc.filterVendor = function filterVendor() {
		var query = sc.vendorSearch;
 		sc.vendorList = $filter('filter')(sc._vendorList, {$: query});
	};


	sc.ok = function ok () {
		$modalInstance.close(vendorDetail);
	};

	sc.cancel = function cancel () {
		$modalInstance.dismiss('cancel');
	};

	sc.fillExitingData();

}]);

// Modal: 修改订单的服务项规格

app.controller('modifyOrderSpecsModalCtrl', ['$scope', 'ycsApi', 'orderDetail', '$modalInstance', '$filter', function(sc, ycsApi, orderDetail, $modalInstance, $filter){
	sc.orderDetail = orderDetail;

	sc.orderSpecsModal = {};

	sc.fillExitingData = function fillExitingData(){
		sc.editData = {
			data: sc.orderDetail.data
		};
	};

	sc.cancel = function cancel () {
		$modalInstance.dismiss('cancel');
	};

	sc.orderSpecsModal.close = function orderSpecsModalClose(){
		$modalInstance.close(orderDetail);
	};

	sc.fillExitingData();

}]);

})(window.angular);