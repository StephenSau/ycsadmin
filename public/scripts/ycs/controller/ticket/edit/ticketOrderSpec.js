(function(angular){

'use strict';

var app = angular.module('backendApp');


// 订单详情(地区、服务项、规格、服务商) orderDetailCtrl

app.controller('orderDetailCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', '$interval', function (sc, ycsUtil, ycsApi, Notification, $modal, $interval) {
	sc.isAllSelected = false;
	
	// Add new
  if (!sc.qData) {
  	sc.qData = {};
  }

  sc.isEdit = false;

  sc.fillExistingData = function fillExistingData(){
	  // is Edit mode
  	sc.qData = angular.extend({}, sc.editData.data);

  	sc.serviceItemList = angular.copy(sc.qData.serviceitems, []);
  	sc.qData.servicername = (sc.qData.srname + '');

  	sc.currentSelectedInit();
  };

  sc.editService = function editService () {
	  var modalInstance = $modal.open({
	    animation: true,
	    templateUrl: 'tpl/modal/ticket/selectService.html',
	    size: 'lg',
	    controller: 'editServiceDetail',
	    backdrop: 'static',
	    resolve: {
				serviceDetail: function() {
					return {
		        currentSelected: sc.qData.service || []
					};
				}
      }
	  });

	  modalInstance.result.then(function (serviceDetail){
		  sc.qData.service = serviceDetail;
		  sc.qData.servicename = serviceDetail[0].name;
		  sc.qData.serviceid = serviceDetail[0].id;
		  sc.editServiceItem();
	  });
	};

	sc.currentSelectedInit = function currentSelectedInit (){
		sc.currentSelected = {};

		if (sc.serviceItemList.length === 0) {
			sc.isAllSelected = true;
		} else {
			sc.serviceItemList.forEach(function(serviceItem){
				sc.currentSelected[serviceItem.id] = {};

				if (serviceItem.specification && serviceItem.specification.length > 0){
					serviceItem.specification.forEach(function(specOptions){
						sc.currentSelected[serviceItem.id][specOptions.name] = [];

						// fill exsiting data for editMode
						if (specOptions.content && specOptions.content.length > 0) {
							sc.currentSelected[serviceItem.id][specOptions.name] = specOptions.content.split(',');
						}
					});
				}

				sc.currentSpecs = [];
				Object.keys(sc.currentSelected).forEach(function(serviceItemID){
					var currentItem = sc.currentSelected[serviceItemID];

					Object.keys(currentItem).forEach(function(specs, index, array){
						sc.currentSpecs.push(specs);
					});
				});
			});
		}
	};

	sc.renderServiceItem = function renderServiceItem (data){
		sc.serviceItemList = data.re.specificationlist;
		sc.currentSelectedInit();
	};

	sc.editServiceItem = function editServiceItem (){
		var ajaxUrl = 'admin/serviceItem/qryServiceItemOptions';
		var qData = {
			serviceid : sc.qData.serviceid,
			district : sc.qData.district,
			city : Math.round(sc.qData.district / 100) * 100,
      province : Math.round(sc.qData.district / 10000) * 10000
		};
		ycsApi.post(ajaxUrl, qData, sc.renderServiceItem);
	};

	sc.checkIfSelected = function checkIfSelected(option, serviceItemId, specName){
		return sc.currentSelected[serviceItemId][specName].indexOf(option) < 0 ? false : true;
	};

	sc.toggleSelected = function toggleSelected(option, type, serviceItemId, specName){
		var target = sc.currentSelected[serviceItemId][specName];
		var targetIndex = target.indexOf(option);
		
		// 单选
		if (type === 1) {
			target[0] = option;
		
		// 多选
		} else if (type === 2) {
			if (targetIndex === -1){
				target.push(option);
			} else {
				target.splice(targetIndex, 1);
			}
		}

		var selectAll = false;
		var currentSelectedSpecs = [];

		Object.keys(sc.currentSelected).forEach(function(serviceItemID){
			var currentItem = sc.currentSelected[serviceItemID];

			Object.keys(currentItem).forEach(function(specs, index, array){
				if(currentItem[specs].length > 0) {
					currentSelectedSpecs.push('selected');
				}
				
				if (currentSelectedSpecs.length === sc.currentSpecs.length){
					selectAll = true;
				}
			});

			if (selectAll === true){
				sc.isAllSelected = true;
			}
			
		});

	};

	sc.orderSaved = function orderSaved(data){
		var orderInfo = data.re;

		Notification.success({title: '订单已创建成功', message: '订单号：' + orderInfo.orderno + '（￥' + orderInfo.due + '）', delay: 5000});

		sc.orderModal.close();
	};

	sc.orderModified = function orderModified(data){
		Notification.success('订单信息已更新！');
		sc.orderSpecsModal.close();
	};

	// 修改订单

	sc.modifyOrder = function modifyOrder(){
		var ajaxUrl = 'admin/order/updateOrderInfo';

		var qryConditions = {
			qrycondition: sc.qData.serviceitems
		};

		if (qryConditions.qrycondition && qryConditions.qrycondition.length > 0){
			qryConditions.qrycondition.forEach(function(serviceItem){
				serviceItem.siid = Number(serviceItem.id);

				serviceItem.specification.forEach(function(option){
					var result = sc.currentSelected[serviceItem.id][option.name].join(',');
					option.content = result;
					option.type += '';

					delete option.options;
				});

				serviceItem.options = angular.copy(serviceItem.specification, []);

				delete serviceItem.specification;
				delete serviceItem.price;
				delete serviceItem.id;
				delete serviceItem.stepsdetail;
				delete serviceItem.name;
			});
		}

		var qData = {
			id: sc.qData.orderid,
			spid: sc.qData.servicerid || sc.qData.srid,
			qryConditions: angular.toJson(qryConditions)
		};

		// 只更改服务商时不用传规格
		if (sc.orderDetail.func === 'changeVendor'){
			delete qData.qryConditions;
		}

		ycsApi.post(ajaxUrl, qData, sc.orderModified);
	};

	// 新建订单

	sc.generateOrder = function generateOrder(){
		var ajaxUrl = 'admin/order/createOrder';

		var qData = sc.qData;

		qData.city = Math.round(sc.qData.district / 100) * 100;
    qData.province = Math.round(sc.qData.district / 10000) * 10000;

		qData.userid = sc.orderUser.id;
	  var serviceItemInfos = sc.verndorServiceItemInfo;

	  if (serviceItemInfos && serviceItemInfos.length > 0){
		  serviceItemInfos.forEach(function(selectedServiceItem){
		  	for (var i = 0; i < sc.serviceItemList.length; i++){
		  		var serviceItem = sc.serviceItemList[i];
		  		if (serviceItem.id === selectedServiceItem.serviceItemId){
		  			selectedServiceItem.selectedOpts = serviceItem.specification;

		  			for (var j = 0; j < selectedServiceItem.selectedOpts.length; j++){
		  				var opts = selectedServiceItem.selectedOpts[j];
							if (opts.type === 2){
								opts.content = sc.currentSelected[selectedServiceItem.serviceItemId][opts.name].join(',');
							}
		  			}

		  			return;
		  		}
		  	}
		  });
	  }

	  var sum = 0;
	  sc.verndorServiceItemInfo.forEach(function(vendorServiceItem){
	  	sum += Number(vendorServiceItem.price);
	  });

	  qData.discount = 0;  // 第一期暂无折扣
	  qData.fee = 0;			 // 木有邮寄费

	  qData.amount = sum;
	  qData.due = qData.amount - qData.discount + qData.fee;

	  qData.serviceItemInfos = angular.toJson(serviceItemInfos);

	  ycsApi.post(ajaxUrl, qData, sc.orderSaved);
	};

	sc.appendVendorInfo = function appendVendorInfo(vendorId){
		if (!vendorId) {return; }

		sc.qData.servicerid = vendorId;

		for (var i = 0; i < sc.filteredVendorList.length; i++){
			var vendor = sc.filteredVendorList[i];
			if (vendor.id === vendorId){
				sc.verndorServiceItemInfo = vendor.serviceItemInfos;

				sc.qData.servicername = vendor.nickname;
				break;
			}
		}
	};

	sc.renderVendorList = function renderVendorList(data){
		sc.filteredVendorList = data.re.serviceproviders;

	  var modalInstance = $modal.open({
	    animation: true,
	    templateUrl: 'tpl/modal/ticket/selectVendor.html',
	    size: 'md',
	    controller: 'editVendorDetail',
	    backdrop: 'static',
	    resolve: {
				vendorDetail: function() {
					return {
		        currentSelected: null,
		        vendorList: angular.copy(sc.filteredVendorList, [])
					};
				}
      }
	  });

	  modalInstance.result.then(function (vendorDetail){
	  	sc.appendVendorInfo(vendorDetail.currentSelected);
	  });
	};

	sc.editVendor = function editVendor(){
		var ajaxUrl = 'admin/service/qryServiceProviders';
		
		var qryConditions = {
			qrycondition: angular.copy(sc.serviceItemList, [])
		};

		if (qryConditions.qrycondition && qryConditions.qrycondition.length > 0){
			qryConditions.qrycondition.forEach(function(serviceItem){
				serviceItem.options = angular.copy(serviceItem.specification, []);

				serviceItem.options.forEach(function(option){
					var result = sc.currentSelected[serviceItem.id][option.name].join(',');
					option.content = result;
					option.type += '';
				});
			});
		}

		var qData = {
			id : sc.qData.serviceid || sc.qData.sdid,	// 服务项ID
			area : sc.qData.district,
			city : Math.round(sc.qData.district / 100) * 100,
			province : Math.round(sc.qData.district / 10000) * 10000,
			qryConditions: angular.toJson(qryConditions)
		};

		ycsApi.post(ajaxUrl, qData, sc.renderVendorList);
	};

	// Is Edit mode

	if (sc.editData && sc.editData.data){
		sc.fillExistingData();
		sc.isEdit = true;
	}

}]);


})(window.angular);