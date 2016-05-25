(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('defaultServiceItemCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', '$filter', function (sc, ycsUtil, ycsApi, Notification, $modal, $filter) {

  sc.currentCataIndex = 0;

  sc.serviceItemList = [];

  sc.selectedServiceItem = [];
  sc.currentSelectedNames = [];

  // in case siid and name index may not matching
  sc.qData = {};

  sc.subcatSelected = [];

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

  sc.toggleChildrenStatus = function toggleChildrenStatus(childList, pIndex, index){

    var goingToChecked = sc.subcatSelected[pIndex][index] ? true : false;

    childList.forEach(function(child){

      var arrayIndex = sc.selectedServiceItem.indexOf(child.id);

      if (goingToChecked && arrayIndex === -1){
        sc.selectedServiceItem.push(child.id);
        sc.qData[child.id] = child.name;
      } else if (!goingToChecked && arrayIndex >= 0) {
        sc.selectedServiceItem.splice(arrayIndex, 1);
        delete sc.qData[child.id];
      }

      var nameIndex = sc.currentSelectedNames.indexOf(child.name);

      if (goingToChecked && nameIndex === -1){
        sc.currentSelectedNames.push(child.name);
      } else if (!goingToChecked && nameIndex >=0) {
        sc.currentSelectedNames.splice(nameIndex, 1);
      }
    });

  };

  sc.checkIfSelected = function checkIfSelected(siid) {
    return sc.selectedServiceItem.indexOf(siid) !== -1 ? true : false;
  };

  sc.toggleSelected = function toggleSelected(siid, name){
    var arrayIndex = sc.selectedServiceItem.indexOf(siid);

    if (arrayIndex === -1){
      sc.selectedServiceItem.push(siid);
      sc.qData[siid] = name;
    } else {
      sc.selectedServiceItem.splice(arrayIndex, 1);
      delete sc.qData[siid];
    }

    var nameIndex = sc.currentSelectedNames.indexOf(name);

    if (nameIndex === -1){
      sc.currentSelectedNames.push(name);
    } else {
      sc.currentSelectedNames.splice(nameIndex, 1);
    }

  };

  sc.serviceItemSaved = function serviceItemSaved(data){
    Notification.success('可提供的服务项信息保存成功！');
    sc.initStep.current = 2;
    sc.switchTab('capacity');
  };

  sc.save = function save(){
    var ajaxUrl = 'admin/servicer/addItem';

    var temp = [];

    Object.keys(sc.qData).forEach(function(siid){
      temp.push(String(siid + '-' + sc.qData[siid]));
    });

    var qData = {
      srid: Number(sc.vendorId),
      addItems: temp.join(',')
    };

    ycsApi.post(ajaxUrl, qData, sc.serviceItemSaved);
  };

  sc.loadServiceItemList();
}]);

})(window.angular);