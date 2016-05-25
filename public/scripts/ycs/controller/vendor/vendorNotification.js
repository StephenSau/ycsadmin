(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('vendorNotificationCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', '$timeout', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal, $timeout) {
  sc.qData = {};
  sc.tempSelected = [];
  sc.tempArray = [];
  sc.choiceVendors = false;
  sc.getMsgList = true;
  sc.loadingGrid = true;
  sc.loadingHistory = true;
  
  sc.qData = {
    sendSMS : 0,
    sendEmail : 0
  };

  sc.toggleSelection = function toggleSelection(id, srname, delFromTag) {
    var selectedIdIndex = sc.tempArray.indexOf(id);
    var selectedVendorIndex = sc.tempSelected.indexOf(srname);

    if (selectedIdIndex === -1){
      sc.tempArray.push(id);
      sc.tempSelected.push({srname:srname, id:id});
    } else {
      sc.tempArray.splice(selectedIdIndex, 1);
      sc.tempSelected.forEach(function(item, cIndex){
        if(item.id === id){
          sc.tempSelected.splice(cIndex, 1);
        }
      });

      if(delFromTag){
        sc.gridApi.selection.getSelectedGridRows().forEach(function(item){
          if(item.entity.nickname === srname){
            item.isSelected = false;
          }
        });
      }
    }
  };



  // 历史消息列表

  sc.historyGridOptions = {
    enableColumnResizing: true,
    enableSorting: true,
    enableFiltering: true,
    flatEntityAccess: true,
    rowHeight: 66,
    columnDefs: [
      {
        field: 'message',
        displayName: '信息内容',
        cellClass:'multiline',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'receiver',
        displayName: '发送到',
        width: 250,
        cellClass:'multiline',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'created',
        displayName: '发送时间',
        width: 80,
        enableHiding: false,
        cellClass:'text-center time multiline',
        headerCellClass: 'text-center',
        filter: {
          placeholder: '搜索...'
        },
        enableColumnMenu: false
      },
      {
        field: 'id',
        displayName: '发送状态',
        width: 80,
        enableHiding: false,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.openMsgDetailList(COL_FIELD, \'vendor\', row.entity.message, row.entity.created)">详情</a></div>',
        enableFiltering: false
      }
    ]
  };

  sc.fillMsgSentList = function fillMsgSentList(data){
    // sc.msgSentList = data.re.list;
    sc.historyGridOptions.data = data.re.list;
    sc.loadingHistory = false;
  }; 

  sc.getMsgSentList = function getMsgSentList(){
    sc.loadingHistory = true;

    var ajaxUrl = 'admin/user/getMessageSendList';
    var qData = {
      type: 1
    };

    ycsApi.post(ajaxUrl, qData, sc.fillMsgSentList);
  };


  // 选择供应商列表

  sc.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    enableSelectAll: false,
    flatEntityAccess: true,
    onRegisterApi: function(gridApi){
      sc.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged(sc,function(row){
        sc.toggleSelection(row.entity.srid, row.entity.nickname);
      });
      gridApi.selection.on.rowSelectionChangedBatch(sc,function(rows){
        rows.forEach(function(item){
          sc.toggleSelection(item.entity.srid, item.entity.nickname);
        });
      });
    },
    columnDefs: [
      {
        field: 'code',
        displayName: '公司账号',
        filter: {
          placeholder: '搜索...'
        },
        width: 120,
        enableHiding: false
      },      
      { 
        field: 'nickname',
        displayName: '公司简称',
        filter: {
          placeholder: '搜索...'
        },
        width: 200,
        enableHiding: false
      },    
      { 
        field: 'contacts',
        displayName: '联系人',
        filter: {
          placeholder: '搜索...'
        },
        width: 100,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableHiding: false
      },
      { 
        field: 'contactstel',
        displayName: '联系人手机',
        filter: {
          placeholder: '搜索...'
        },
        width: 120,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableHiding: false
      },
      { 
        field: 'contactsemail',
        displayName: '联系人邮箱',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field:'status',
        displayName: '合作关系',
        width: 100,
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ { value: '未合作', label: '未合作' }, { value: '未生效', label: '未生效' }, { value: '生效中', label: '生效中' }, { value: '待续约', label: '待续约' }, { value: '已失效', label: '已失效' }, { value: '冻结中', label: '冻结中' }]
        },
        cellClass:'text-center',
        headerCellClass: 'text-center',
        cellTemplate:'<div class="ui-grid-cell-contents"><span class="intact" ng-if="COL_FIELD === \'未合作\'">未合作</span><span class="ready" ng-if="COL_FIELD === \'未生效\'">未生效</span><span class="on-going" ng-if="COL_FIELD === \'生效中\'">生效中</span><span class="due" ng-if="COL_FIELD === \'待续约\'">待续约</span><span class="overdue" ng-if="COL_FIELD === \'已失效\'">已失效</span><span class="frozen" ng-if="COL_FIELD === \'冻结中\'">冻结中</span></div>',
        enableSorting: false,
        enableColumnMenu: false,
        enableHiding: false
      }
    ]
  };

  sc.filterVendorData = function filterVendorData(data){
    sc.filledArray = [];

    data.re.contacts.forEach(function(item){
      if(item.index === 0){
        sc.filledArray.push(item);
      }
    });
    sc.gridOptions.data = sc.filledArray;
    sc.loadingGrid = false;
  };

  sc.fillExitingData = function fillExitingData(data){
    // sc.gridOptions.data = data.re.contacts;
    sc.filledArray = [];

    data.re.contacts.forEach(function(item){
      if(item.index === 0){
        sc.filledArray.push(item);
      }
    });
    sc.gridOptions.data = sc.filledArray;
    sc.gridApi.selection.clearSelectedRows();
    sc.tempArray = [];
    sc.tempSelected = [];
    sc.tempArray.length = 0;
    sc.loadingGrid = false;
  };  

  sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;

    var ajaxUrl = 'admin/servicer/getServicerContactsList';
    var qData = {
      pageSize: 999999
    };

    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
    delete sc.qData.district;
  };  

  sc.filterTicket = function filterTicket(){
    sc.loadingGrid = true;

    sc.filterData = {};
    
    if(sc.qData.district % 10000 === 0 && sc.qData.district % 100 === 0){
      sc.filterData.province = sc.qData.district;
    } else if(sc.qData.district % 100 === 0 && sc.qData.district % 10000 !== 0){
      sc.filterData.city = Math.round(sc.qData.district / 100) * 100;
      sc.filterData.province = Math.round(sc.qData.district / 10000) * 10000;
    } else{
      sc.filterData.district = sc.qData.district;
      sc.filterData.city = Math.round(sc.qData.district / 100) * 100;
      sc.filterData.province = Math.round(sc.qData.district / 10000) * 10000;
    }

    var ajaxUrl = 'admin/servicer/getServicerContactsList';
    var qData = {};
    qData = sc.filterData;
    qData.pageSize = 999999;

    ycsApi.post(ajaxUrl, qData, sc.filterVendorData);
  };

  sc.clearContent = function clearContent(){
    sc.qData.content = '';
    sc.qData.subject = '';
  };

  sc.msgSent = function msgSent(){
    Notification.success('信息发送成功');
    sc.getExistingData();
  };

  sc.sendMsg = function sendMsg(detail){
    var ajaxUrl = 'admin/servicer/sendMsgToServicerContacts';
    var qData;
    qData = detail;

    qData.srids = sc.tempArray.join(',');

    ycsApi.post(ajaxUrl, qData, sc.msgSent);
  };

  sc.openVendorList = function openVendorList(){
    sc.choiceVendors = true;
    sc.getMsgList = false;
    sc.getExistingData();
  };

  sc.openMsgSentList = function openMsgSentList(){
    sc.choiceVendors = false;
    sc.getMsgList = true;
    sc.getMsgSentList();
  };

  sc.openMsgDetailList = function openMsgDetailList (id, type, message, created) {
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/notificationHistoryDetail.html',
      size: 'xl',
      controller: 'notificationHistoryDetailModalCtrl',
      backdrop: 'static',
      resolve: {
        notifyDetail: function() {
          return {
            id: id,
            type: type,
            message: message,
            created: created
          };
        }
      }
    });

    modalInstance.result.then(function (notifyDetail){
      
    });
  };

  sc.getMsgSentList();
}]);


// Modal: 服务项规格

app.controller('notificationHistoryDetailModalCtrl', ['$scope', 'notifyDetail', '$modalInstance', 'ycsApi', 'Notification', function(sc, notifyDetail, $modalInstance, ycsApi, Notification){
  sc.notifyDetail = notifyDetail;

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

  sc.fillMsgDetailData = function fillMsgDetailData(data){
    sc.msgDetailList = data.re.list;
  }; 

  sc.getMsgSentDetail = function getMsgSentDetail(id){
    var ajaxUrl = 'admin/servicer/getSendMsgDetailList';
    var qData = {
      type: 1,
      mslid: sc.notifyDetail.id
    };

    ycsApi.post(ajaxUrl, qData, sc.fillMsgDetailData);
  };

  sc.getMsgSentDetail();
}]);

})(window.angular);