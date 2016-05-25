(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('defaultPriceCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', '$filter', function (sc, ycsUtil, ycsApi, Notification, $modal, $filter) {
  sc.invoiceTypeUnitOpts = [
    {value: '均可', label: '均可'},
    {value: '收据', label: '收据'},
    {value: '国税通用机打发票', label: '国税通用机打发票'},
    {value: '增值税普通发票', label: '增值税普通发票'},
    {value: '增值税专用发票', label: '增值税专用发票'},
    {value: '小规模普通发票', label: '小规模普通发票'},
  ];

  sc.getExistingData = function getExistingData(){
    var ajaxUrl = 'admin/servicer/getItems';
    var qData = { 
      srid : sc.vendorId
    };
    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  };  

  sc.fillExitingData = function fillExitingData(data){
    sc.qData = data.re.list;
    sc.tempArray = [];
    sc.qData.forEach(function(detail){
      sc.tempArray.push(detail.price);
      if (!detail.invoicetype){
        detail.invoicetype = '均可';
      }
    });
  };

  sc.priceTableSaved = function priceTableSaved(){
    Notification.success('服务价格信息已保存！');
    sc.capacity.isInit = false;
    sc.initStep.current = 0;
    sc.switchTab('capacity');
  };

  sc.save = function save(data){
    var ajaxUrl = 'admin/servicer/itemPrice';
    var tempObj = {};

    tempObj.list = data;

    if (tempObj.list && tempObj.list.length > 0){
      tempObj.list.forEach(function(datum){
        datum.advantage = datum.advantage && datum.advantage.length > 0 ? datum.advantage : '';
      });
    }

    var qData = {
      addCustom : angular.toJson(tempObj),
      srid : Number(sc.vendorId)
    };

    ycsApi.post(ajaxUrl, qData, sc.priceTableSaved);
  };

  sc.defaultPrice = function defaultPrice(index){
    sc.qData[index].price = sc.tempArray[index];
  };

  sc.getExistingData();

}]);

})(window.angular);