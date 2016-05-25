(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('partnerShipCtrl', ['appSettings', '$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', '$filter', function (appSettings, sc, ycsUtil, ycsApi, Notification, $modal, $filter) {
	sc.addNew = false;

  sc.contracts = {
    files: []
  };

  sc.uploadBtnDisabledArray = [];

  for (var i = 0;i < sc.qData.contracts.length; i++){
    sc.uploadBtnDisabledArray[i] = false;
  }

  sc.statusUnitOpts = [
    {value: 1, label: '未合作'},
    {value: 2, label: '未生效'},
    {value: 3, label: '生效中'},
    {value: 4, label: '待续约'},
    {value: 5, label: '已失效'},
    {value: 6, label: '已冻结'},
    {value: 8, label: '特约专用'}
  ];

  sc.checkIfUploading = function checkIfUploading(condition){
    if(condition === true){
      return 'loading';
    } else{
      return ;
    }
  };

  sc.fillExisting = function fillExisting(){
    if (sc.qData && (!sc.qData.contracts || sc.qData.contracts.length < 1)){
      sc.qData = {
        contracts: [],
      };

    } else {
      if (sc.qData && sc.qData.contracts && sc.qData.contracts.length > 0){
        sc.qData.contracts.forEach(function(contract){
          // check if contract file has been updated
          contract.fileChanged = false;
        });
      }
    }
  };

  sc.addPartnerShip = function addPartnerShip(){
  	sc.qData.contracts.push({
      status: 1,     // 新增时`当前状态`默认值设为`未合作`
      begindateTime: new Date(),
      enddateTime: new Date(),
      fileChanged: false
    });
    sc.addNew = true;
  };

  sc.delContract = function delContract(index){
    delete sc.qData.contracts[index].files;
  };

  sc.contractUploaded = function contractUploaded(cIndex, data){
    sc.qData.contracts[cIndex].files = data;
    sc.qData.contracts[cIndex].fileChanged = true;  // set contract file field dirty
    sc.uploadBtnDisabledArray[cIndex] = false;
  };

  sc.uploadContract = function uploadContract(file, cIndex){
    ycsUtil.uploadCommonFile(file, 'admcontract', sc.contractUploaded.bind(this, cIndex));
  };

  sc.$on('commonFileSelected', function (event, file, cIndex){
    if (file.size < 1) {
      Notification.warning({title: '不能上传空文件', message: '你上传的文件大小为0字节，不是有效的文件，请重新选择', delay: 5000});
      return;
    } else {
      sc.$apply(function () {
        sc.uploadContract(file, cIndex);
        sc.uploadBtnDisabledArray[cIndex] = true;
      });
    }
  });

  sc.dataSaved = function dataSaved(data){
    Notification.success('合作关系保存成功！');
    sc.getExistingData();
  };

  sc.save = function save(detail){
    var ajaxUrl;
    var qData = detail;

    if ( sc.addNew === true ) {
      ajaxUrl = 'admin/servicer/addServicerContract';
      qData.servicerid = sc.vendorId;

    } else {
      ajaxUrl = 'admin/servicer/modifyServicerContract';
    }

    if (qData.receiver){
      qData.receiver.trim();
    }

    if (qData.contacts){
      qData.contacts.trim();
    }

	  qData.begindate = $filter('date')(qData.begindateTime, 'yyyy-MM-dd');
		qData.enddate = $filter('date')(qData.enddateTime, 'yyyy-MM-dd'); 

    ycsApi.post(ajaxUrl, qData, sc.dataSaved);

    sc.addNew = false;
  };

  sc.fillExisting();

}]);

})(window.angular);