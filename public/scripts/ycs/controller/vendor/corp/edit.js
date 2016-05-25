(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('vendorEditCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, Notification, $modal) {

  sc.stepsTpl = [
    'tpl/vendor/corp/steps/defaultArea.html',
    'tpl/vendor/corp/steps/defaultServiceItem.html',
    'tpl/vendor/corp/steps/defaultPrice.html'
  ];

  sc.capacity = { 
    isInit: false
  };
  
  sc.initStep = {
    current: 0
  };

  sc.tabsTpl = {
    basicInfo: 'tpl/vendor/corp/basicInfo.html',
    vendorInfo: 'tpl/vendor/corp/vendorInfo.html',
    partnerShip: 'tpl/vendor/corp/partnerShip.html',
    capacity: 'tpl/vendor/corp/capacity.html',
    staff: 'tpl/vendor/corp/staff.html'
  };

  sc.currentTab = sc.tabsTpl.basicInfo;

  sc.switchTab = function switchTab(tabName){
    switch (tabName){
      case 'vendorInfo':
      case 'partnerShip':
      case 'staff':
        sc.currentTab = sc.tabsTpl[tabName];
        break;
      case 'capacity':
        if (sc.capacity.isInit){
          sc.currentTab = sc.stepsTpl[sc.initStep.current];
        } else {
          sc.currentTab = sc.tabsTpl.capacity;
        }
        break;
      default:
      case 'basicInfo':
        sc.currentTab = sc.tabsTpl.basicInfo;
        break;
    }
  };

  sc.fillExistingFullData = function fillExistingData(data){
    sc.qData = data.re;

    // registed date

    sc.qData.registedTime = new Date(sc.qData.registed);

    // begindate & enddate

    sc.qData.contracts.forEach(function(item){
      item.begindateTime = new Date(item.begindate);
      item.enddateTime = new Date(item.enddate);
    });

    // 专业领域

    sc.qData.fieldArray = [];

    if (sc.qData.field && sc.qData.field.length > 0) {
      var _fieldArray = ycsUtil.spliter(sc.qData.field, ',');

      if (_fieldArray.length > 0){

        _fieldArray.forEach(function(item){
          if (Number(item) > 0) { // get rid of old dirty data
            sc.qData.fieldArray.push(Number(item));
          }
        });
      }
    }

    // Helps determine if exiting account is valid
    sc.qData.existingCorpAccount = sc.qData.code || '';

    // Initialising steps

    if (sc.qData.initialize === 2){
      sc.capacity.isInit = false;
    } else{
      sc.capacity.isInit = true;
      sc.initStep.current = sc.qData.initialize;
    }

  };

  sc.getExistingData = function getExistingData(){
    var ajaxUrl = 'admin/servicer/queryServicerDetail';
    var qData = {
      servicerid : sc.vendorId
    };
    ycsApi.post(ajaxUrl, qData, sc.fillExistingFullData);
  };

  if (sc.vendorId !== 'new'){ 
    sc.getExistingData();
  }

}]);

})(window.angular);