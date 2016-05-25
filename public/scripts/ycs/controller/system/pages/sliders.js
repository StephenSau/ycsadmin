(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('slidersCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', '$state', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal, $state) {

  sc.isHomeSlider = $state.current.name.indexOf('Home') > -1 ? true : false;

  sc.fillExitingData = function fillExitingData(status, data){
    var list = data.re;

    if (status === 'online') {
      sc.sliderListOnline = data.re;
    } else if (status === 'offline') {
      sc.sliderListOffline = data.re;
    }
  };

  sc.getExistingData = function getExistingData(){
    var ajaxUrl = 'admin/adconfig/adList';
    var code = sc.isHomeSlider ? 'index.ad' : 'info.ad';

    var qDataOnline = {
      code: code,
      status: 1  
    };

    var qDataOffline = {
      code: code,
      status: 0
    };

    ycsApi.post(ajaxUrl, qDataOnline, sc.fillExitingData.bind(this, 'online'));
    ycsApi.post(ajaxUrl, qDataOffline, sc.fillExitingData.bind(this, 'offline'));
  };

  sc.listSortingSaved = function listSortingSaved(data){
    sc.getExistingData();
    Notification.success('排序已保存');
  };

  sc.listDragEnd = function listDragEnd(){
    var ajaxUrl = 'admin/adconfig/changeSort';
    var sortList = [];

    sc.sliderListOnline.forEach(function(slide, sIndex){
      sortList.push({
        adid: slide.id,
        sort: sIndex
      });
    });

    var qData = {sortList: angular.toJson(sortList)};

    ycsApi.post(ajaxUrl, qData, sc.listSortingSaved);
  };

  sc.sliderSaved = function sliderSaved(data){
    sc.getExistingData();
    Notification.success('轮转图已保存');
  };

	sc.addSlider = function addSlider(isEdit, slider){
    var sliderData = slider || {};

		var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/system/addSlider.html',
      size: 'lg',
      controller: 'addSliderModalCtrl',
      backdrop: 'static',
      resolve: {
        sliderInfo: function() {
          return {
            isEdit: isEdit,
            isHomeSlider: sc.isHomeSlider,
            sliderData: sliderData,
            listLen: sc.sliderListOnline.length
          };
        }
      }
    });

    modalInstance.result.then(function(){
      sc.sliderSaved();
    });
  };

  sc.sliderDeleted = function sliderDeleted(){
    sc.getExistingData();
    Notification.success('轮转图已删除');
  };

  sc.delSlider = function delSlider(adid){
    var ajaxUrl = 'admin/adconfig/delete';
    var qData = { adid: adid };
    ycsApi.post(ajaxUrl, qData, sc.sliderDeleted);
  };

  sc.editSlider = function editSlider(sliderId, status){
    var targetSlider;

    var targetList = status === 'online' ? sc.sliderListOnline : sc.sliderListOffline;

    for (var i = 0; i < targetList.length; i++){
      if (targetList[i].id === sliderId){
        targetSlider = angular.copy(targetList[i], {});
        break;
      }
    }

    sc.addSlider(true, targetSlider);
  };

  sc.getExistingData();

}]);

app.controller('addSliderModalCtrl', ['$scope', 'sliderInfo', '$modalInstance', 'ycsApi', 'ycsUtil', 'Notification', function(sc, sliderInfo, $modalInstance, ycsApi, ycsUtil, Notification){
  sc.sliderInfo = sliderInfo.sliderData;
  sc.isEdit = sliderInfo.isEdit;
  sc.isHome = sliderInfo.isHomeSlider;
  sc.listLen = sliderInfo.listLen;

  sc.uploadBtnDisabled = false;

  sc.fileChanged = false;

  if (sc.sliderInfo.status === undefined){
    sc.sliderInfo.status = 1;
  }

  sc.imageUploaded = function imageUploaded(data){
    sc.sliderInfo.image = data;
    sc.fileChanged = true;
    ycsUtil.disableButton(sc, false);
  };

  sc.uploadImage = function uploadImage(file){
    var fileType = sc.isHome ? 'idxturn' : 'infoturn';
    ycsUtil.uploadImage(file, fileType, sc.imageUploaded, sc);
  };

  sc.$on('imageSelected', function (event, file, target){
    sc.$apply(function () {
      sc.uploadImage(file);
      ycsUtil.disableButton(sc, true);
    });
  });

  sc.saved = function saved(){
    $modalInstance.close();
  };

  sc.save = function save(sliderInfo){
    var ajaxUrl = sc.isEdit ? 'admin/adconfig/edit' : 'admin/adconfig/add';
    var qData = sliderInfo;

    qData.code = sc.isHome ? 'index.ad' : 'info.ad';
    
    if (!sc.isEdit){
      qData.sort = sc.listLen;
    } else {
      qData.adid = qData.id;
    }

    ycsApi.post(ajaxUrl, qData, sc.saved);
  };

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };
}]);

})(window.angular);