(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('serviceItemEditModalCtrl', ['$scope', 'serviceItemInfo', '$modalInstance', 'ycsApi', 'Notification', function(sc, serviceItemInfo, $modalInstance, ycsApi, Notification){
  sc.serviceItemInfo = serviceItemInfo;

  sc.isEdit = false;

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

  sc.invoiceTypeUnitOpts = [
    {value: '均可', label: '均可'},
    {value: '收据', label: '收据'},
    {value: '国税通用机打发票', label: '国税通用机打发票'},
    {value: '增值税普通发票', label: '增值税普通发票'},
    {value: '增值税专用发票', label: '增值税专用发票'},
    {value: '小规模普通发票', label: '小规模普通发票'},
  ];

  sc.loadServiceItemList = function loadServiceItemList () {
    var ajaxUrl = 'admin/serviceItem/serviceAll';
    var qData = {};

    ycsApi.post(ajaxUrl, qData, sc.renderServiceItemList);
  };

  sc.dataSaved = function dataSaved(data){
    Notification.success('服务能力编辑成功！');
    sc.loadServiceItemList();
    $modalInstance.close();
  };

  sc.save = function save(detail){
    var ajaxUrl = 'admin/servicer/editItem';
    var qData = detail;
    
    qData.srid = sc.serviceItemInfo.srid;   // 服务商ID
    qData.srsid = sc.serviceItemInfo.srsid; // 服务商自定义服务项id
    qData.siid = sc.serviceItemInfo.siid;   // 服务项id
    
    qData.remark = (detail.advantage && detail.advantage.length > 0) ? detail.advantage : '';
    qData.invoicetype = (detail.invoicetype && detail.invoicetype.length > 0) ? detail.invoicetype : '';

    var selectedOptions = [];

    if (detail.tempOptions && detail.tempOptions.length > 0){
      detail.tempOptions.forEach(function(tOption){

        var _option = angular.extend([], tOption.option);
        var selectedItem = [];

        _option.forEach(function(opt){
          if (opt.selected){
            selectedItem.push(opt);
          }
        });

        tOption.option = selectedItem;
        selectedOptions.push(tOption);
      });
    }

    var tempOption = {};
        tempOption.list = selectedOptions;

    qData.options = angular.toJson(tempOption);

    qData.status = Number(detail.status);

    ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };

  sc.fillExistingData = function fillExistingData(data){
    sc.detail = data.re;
    sc.detail.tempOptions = data.re.options;
    sc.detail.name = sc.serviceItemInfo.name;
  };

  sc.getExistingData = function getExistingData(){
    var ajaxUrl = 'admin/servicer/getStandard';
    var qData = { 
      srid : sc.serviceItemInfo.srid,
      srsid : sc.serviceItemInfo.srsid
    };

    ycsApi.post(ajaxUrl, qData, sc.fillExistingData);
  };

  sc.getExistingData();

}]);

})(window.angular);