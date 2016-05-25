(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('basicInfoCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', '$filter', '$state', function (sc, ycsUtil, ycsApi, Notification, $modal, $filter, $state) {
  if (sc.vendorId === 'new'){
    sc.qData = {
      registedTime: new Date(),
      fieldArray: [10,20,30,40,50,60,70,80,90]
    };
  }

  sc.accAvailable = true;

  sc.uploadBtnDisabled = false;

  sc.typeUnitOpts = [
    {value: 1, label: '服务商机构'},
    {value: 2, label: '服务商分支机构'},
    {value: 3, label: '客户公司'},
    {value: 4, label: '客户分支公司'}
  ];

  sc.peopleUnitOpts = [
    // {value: -1, label: '-'},
    {value: 0, label: '1-10'},
    {value: 1, label: '11-20'},
    {value: 2, label: '21-50'},
    {value: 3, label: '51-100'},
    {value: 4, label: '101-300'},
    {value: 5, label: '301-1000'},
    {value: 6, label: '1000-5000'},
    {value: 7, label: '5000-10000'},
    {value: 8, label: '10000以上'}
  ];

  sc.fieldOpts = [
    {value:10, label: '工商'},
    {value:20, label: '财务会计'},
    {value:30, label: '审计'},
    {value:40, label: '税务'},
    {value:50, label: '法律'},
    {value:60, label: '资产评估'},
    {value:70, label: '许可证'},
    {value:80, label: '商标专利'},
    {value:90, label: '人力资源'}
  ];

  sc.imageUploaded = function imageUploaded(data) {
    sc.qData.logo = data;
    ycsUtil.disableButton(sc, false);
  };

  sc.uploadImage = function uploadImage(file) {
    ycsUtil.uploadImage(file, 'serlogo', sc.imageUploaded, sc);
  };

  sc.$on('imageSelected', function (event, file){
    sc.$apply(function () {
      sc.uploadImage(file);
      ycsUtil.disableButton(sc, true);
    });
  });

  sc.deleteLogo = function deleteLogo(){
    delete sc.qData.logo;
  };

  sc.basicInfoSaved = function basicInfoSaved(data){
    Notification.success('服务商信息已保存！');
    sc.getExistingData();
  };

  sc.newVendorAdded = function newVendorAdded(data) {
    Notification.success('已成功添加服务商！');
    $state.go('vendor');
  };

  sc.toggleSelected = function toggleSelected (item) {
    var itemIndex = sc.qData.fieldArray.indexOf(item);
    if ( itemIndex === -1){
      sc.qData.fieldArray.push(item);
    } else {
      sc.qData.fieldArray.splice(itemIndex, 1);
    }
  };

  sc.checkIfSelected = function checkIfSelected(item) {
    if (sc.qData && sc.qData.fieldArray){
      return sc.qData.fieldArray.indexOf(item) !== -1 ? true : false;
    } else {
      return false;
    }
  };

  sc.checkAccountResult = function checkAccountResult(data){
    // Is invalid
    if (!data || Number(data.status) !== 200){
      sc.accAvailable = false;

    // Valid
    } else {
      sc.accAvailable = true;
    }
  };

  sc.checkAccountAvailability = function checkAccountAvailability(isInvalid, account){
    if (isInvalid) { return; }

    var ajaxUrl = 'admin/servicer/checkServicerCodeValid';
    var qData = {
      code: account
    };

    // 一旦填了ID，查询的结果就不准确
    // if(sc.vendorId !== 'new'){
    //   qData.servicerid = Number(sc.vendorId);
    // }

    ycsApi.post(ajaxUrl, qData, sc.checkAccountResult, null, null, sc.checkAccountResult);
  };

  sc.save = function save(detail){
    var ajaxUrl;
    var qData = detail;

    qData.tag = '';

    if (qData.tagsInput && qData.tagsInput.length > 0){
      qData.tagsInput.forEach(function(tag, tIndex){
        qData.tag += ((tIndex > 0 ? ',' : '') + tag.text);
      });
    }

    if (!qData.logo || qData.logo.length === 0) {
      delete qData.logo;
    }

    qData.registed = $filter('date')(qData.registedTime, 'yyyy-MM-dd'); 

    qData.field = sc.qData.fieldArray.join(',');

    // Is add new
    if (sc.vendorId === 'new'){
      ajaxUrl = 'admin/servicer/addServicerBasicInfo';
      qData.industry = 1400;
      qData.city = Math.round(qData.district / 100) * 100;
      qData.province = Math.round(qData.district / 10000) * 10000;
      delete qData.servicerid;

      ycsApi.post(ajaxUrl, qData, sc.newVendorAdded);

    // Is edit
    } else {
      ajaxUrl = 'admin/servicer/modifyServicerBasicInfo';

      ycsApi.post(ajaxUrl, qData, sc.basicInfoSaved);
    }
   
  };

  sc.resetVendorPassword = function resetVendorPassword(id, username, mobile, email){
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/vendor/resetVendorPassword.html',
      size: 'md',
      backdrop: 'static',
      controller: 'resetVendorPasswordCtrl',
      resolve: {
        vendorInfo: function() {
          return {
            servicerid: Number(id),
            username: username,
            mobile: mobile,
            email: email
          };
        }
      }
    });
  };

}]);

app.controller('resetVendorPasswordCtrl', ['$scope', 'vendorInfo', '$modalInstance', 'ycsApi', 'Notification', function(sc, vendorInfo, $modalInstance, ycsApi, Notification){
  sc.vendorInfo = vendorInfo;

  sc.detail = {};

  sc.detail.username = sc.vendorInfo.username;

  sc.detail.password = '00000000';

  sc.detail.contactstel = sc.vendorInfo.mobile;

  sc.detail.contactsemail = sc.vendorInfo.email;

  sc.dataSaved = function dataSaved(){
    Notification.success('服务商登录密码重置成功！');
    $modalInstance.close();
  };

  sc.save = function save(detail){
    var ajaxUrl = 'admin/servicer/resetServicerPwd';
    var qData = detail;

    qData.servicerid = sc.vendorInfo.servicerid;

    if (qData.tel !== true || !qData.tel){
      delete qData.contactstel;
    }

    if (qData.email !== true || !qData.email){
      delete qData.contactsemail;
    }
    
    ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };
}]);

})(window.angular);