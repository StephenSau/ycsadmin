(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('wechatCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', '$filter', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal, $filter) {
  sc.loadingGrid = true;

  sc.qData = {};

  sc.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    flatEntityAccess: true,
    rowHeight: 47,
    onRegisterApi: function(gridApi){
      sc.gridApi = gridApi;
    },
    columnDefs: [
      {
        field: 'action_info',
        displayName: '场景名称',
        width: 220,
        cellClass: 'multiline',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'id',
        displayName: '详情',
        width: 60,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.editQrcode(COL_FIELD, row.entity.action_info, row.entity.action_desc, row.entity.remark)">详情</a></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableSorting: false,
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'created',
        displayName: '创建时间',
        width: 150,
        cellClass:'text-center time multiline',
        headerCellClass: 'text-center',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'expire_seconds',
        displayName: '有效期',
        width: 100,
        headerCellClass: 'text-center',
        cellClass:'text-center',
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ {value: '7天有效', label: '7天有效'}, {value: '长期有效', label: '长期有效'}]
        },
        enableHiding: false
      },
      {
        field:'scans',
        displayName: '累计扫码次数',
        width: 110,
        type: 'number',
        cellClass:'text-center',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field:'action_desc',
        displayName: '描述',
        width: 220,
        cellClass:'multiline',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'downLoadUrl',
        displayName: '二维码',
        width: 80,
        cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{COL_FIELD}}" target="_blank" tooltip="下载二维码" tooltip-placement="left"><i class="fa fa-lg fa-qrcode"></i></a></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableSorting: false,
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'remark',
        displayName: '备注',
        cellClass:'multiline',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      }

    ]
  };

  sc.editQrcode = function editQrcode (id, qrtitle, qrdescribe, qrremark) {
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/wechat/editQrcode.html',
      size: 'md',
      backdrop: 'static',
      controller: 'editQrcodeModalCtrl',
      resolve: {
        qrcodeInfo: function() {
          return {
            id: id,
            length: sc.remainingNumber,
            qrtitle: qrtitle,
            qrdescribe: qrdescribe,
            qrremark: qrremark
          };
        }
      }
    });

    modalInstance.result.then(function (userInfo){
      sc.getExistingData();
    });
  };

  sc.renderTimeFrame = function renderTimeFrame(){
    var now = new Date();

    // Default exportTime: yesterday
    var fromTime = new Date(now.getTime() - 24 * 3600000);

    sc.qData.exportTime = fromTime;
  };


  sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.re;
    sc.loadingGrid = false;
    sc.remainingNumber = data.re.remainingnumber;
  };

  sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;

    var ajaxUrl = 'admin/qrcode/getList';
    var qData = { 
      pageSize: 999999
    };
    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  };

  sc.statisticsExported = function statisticsExported(data){
    var file = new Blob([ data ], {
        type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Create <a> link to the Blob steam and perform cliking

    var now = new Date();
    var dateStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    var timeStr = (now.getHours()) + '-' + ((now.getMinutes() < 10 ? '0' : '') + now.getMinutes()) + '-' + ((now.getSeconds() < 10 ? '0' : '') + now.getSeconds());
    var filename = 'YCS_Qrcode' + dateStr + '_' + timeStr + '.xls';
   
    var fileURL = URL.createObjectURL(file);
    var a = document.createElement('a');
        a.href = fileURL; 
        a.target = '_blank';
        a.download = filename;
    
    document.body.appendChild(a);
    a.click();
  };

  sc.exportStatistics = function exportStatistics(exportTime){
    var ajaxUrl = 'admin/qrcode/exportFollowList';
    var qData = {};

    qData.exporttime = $filter('date')(exportTime, 'yyyy-MM-dd');

    ycsApi.postToGetStream(ajaxUrl, qData, sc.statisticsExported);
  };

  sc.getExistingData();
  sc.renderTimeFrame();


}]);

// MODAL: 渠道二维码

app.controller('editQrcodeModalCtrl', ['$scope', 'qrcodeInfo', '$modalInstance', 'ycsApi', 'Notification', function(sc, qrcodeInfo, $modalInstance, ycsApi, Notification){
  sc.qrcodeInfo = qrcodeInfo;

  sc.qrcodeModal = {};

  sc.saving = false;

  if(qrcodeInfo.id === 'new'){
    sc.qData = {};
    sc.qData.qrtype = 0;
  } else{
    sc.qData = sc.qrcodeInfo;
  }

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

  sc.dataSaved = function dataSaved(){
    Notification.success('二维码创建成功！');
    $modalInstance.close();
  };

  sc.hasError = function hasError(data){
    sc.saving = false;
    Notification.error('二维码创建失败');
  };

  sc.save = function save(detail){
    var ajaxUrl = 'admin/qrcode/createQrcode';
    var qData = {};
    qData = detail;

    if(qData.qrtype === 1){
      delete qData.qrid;
    }

    sc.saving = true;

    ycsApi.post(ajaxUrl, qData, sc.dataSaved, null, null, sc.hasError);
  };


}]);

})(window.angular);