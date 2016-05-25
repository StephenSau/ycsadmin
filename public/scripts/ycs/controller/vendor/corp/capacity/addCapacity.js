(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('addCapacityModalCtrl', ['$scope', 'capacityInfo', '$modalInstance', 'ycsApi', 'Notification', function(sc, capacityInfo, $modalInstance, ycsApi, Notification){
  sc.currentStep = 1;

  sc.capacityInfo = capacityInfo;

  sc.invoiceTypeUnitOpts = [
    {value: '均可', label: '均可'},
    {value: '收据', label: '收据'},
    {value: '国税通用机打发票', label: '国税通用机打发票'},
    {value: '增值税普通发票', label: '增值税普通发票'},
    {value: '增值税专用发票', label: '增值税专用发票'},
    {value: '小规模普通发票', label: '小规模普通发票'},
  ];

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

  sc.currentCataIndex = 0;

  sc.serviceItemList = [];
  sc.currentSelectedNames = [];

  // in case siid and name index may not matching
  sc.qData = {};

  sc.renderServiceItemList = function renderServiceItemList (data){
    sc.serviceItemList = data.re;
  };

  sc.loadServiceItemList = function loadServiceItemList () {
    var ajaxUrl = 'admin/serviceItem/serviceAll';
    var qData = {};

    ycsApi.post(ajaxUrl, qData, sc.renderServiceItemList);
  };

  sc.switchCategory = function switchCategory (index) {
    sc.currentCataIndex = index;
  };

  sc.checkIfSelected = function checkIfSelected(siid) {
    return sc.capacityInfo.select.indexOf(siid) !== -1 ? true : false;
  };

  sc.toggleSelected = function toggleSelected(siid, name){
    sc.currentSelectedServiceItem = siid;
    sc.currentSelectedNames = [name];
  };

  sc.addServiceItem = function addServiceItem(){
    var ajaxUrl = 'admin/servicer/getItemDetailById';

    var qData = {
      itemid : sc.currentSelectedServiceItem
    };

    ycsApi.post(ajaxUrl, qData, sc.serviceItemSaved);
  };

  sc.prevStep = function prevStep(){
    sc.currentStep = 1;
  };

  sc.serviceItemSaved = function serviceItemSaved(data){
    sc.currentStep = 2;
    sc.detail = data.re;

    sc.detail.tempOptions = data.re.options;
  };

  sc.dataSaved = function dataSaved(data){
    Notification.success('服务能力添加成功！');
    sc.loadServiceItemList();
    $modalInstance.close();
  };

  sc.save = function save(detail){
    var ajaxUrl = 'admin/servicer/addItemSpecial';
    var qData = detail;
    
    qData.remark = (detail.advantage && detail.advantage.length > 0) ? detail.advantage : '';
    qData.siid = sc.currentSelectedServiceItem;
    qData.srid = Number(sc.capacityInfo.srid);
    
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

    ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };

  sc.loadServiceItemList();

}]);

})(window.angular);