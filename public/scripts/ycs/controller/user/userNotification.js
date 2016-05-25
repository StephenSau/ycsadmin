(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('userNotificationCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal) {
  sc.qData = {};
  sc.tempSelected = [];
  sc.tempArray = [];
  sc.choiceUsers = false;
  sc.getMsgList = true;
  sc.loadingGrid = true;
  sc.loadingHistory = true;

  sc.qData = {
    isSendSms : 0,
    isSendMessage : 0
  };

  sc.userRoleOpts = [
    {value: '0', label: '普通用户'},
    {value: '1', label: '普通用户(带订单)'},
    {value: '2', label: '已冻结用户'},
    {value: '4', label: '已删除用户'},
  ];

  sc.toggleSelection = function toggleSelection(id, username, delFromTag) {
    var selectedIndex = sc.tempArray.indexOf(id);

    var selectedVendorIndex = sc.tempSelected.indexOf(username);
    if (selectedIndex === -1){
      sc.tempArray.push(id);
      sc.tempSelected.push({username:username, id:id});
    } else {
      sc.tempArray.splice(selectedIndex, 1);
      
      sc.tempSelected.forEach(function(item, cIndex){
        if(item.id === id){
          sc.tempSelected.splice(cIndex, 1);
        }
      });

      if(delFromTag){
        sc.gridApi.selection.getSelectedGridRows().forEach(function(item){
          if(item.entity.username === username){
            item.isSelected = false;
          }
        });
      }
    }
  };

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
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.openMsgDetailList(COL_FIELD, \'user\', row.entity.message, row.entity.created)">详情</a></div>',
        enableFiltering: false
      }
    ]
  };

  sc.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    enableSelectAll: false,
    flatEntityAccess: true,
    onRegisterApi: function(gridApi){
      sc.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged(sc,function(row){
        sc.toggleSelection(row.entity.id, row.entity.username);
      });
      gridApi.selection.on.rowSelectionChangedBatch(sc,function(rows){
        rows.forEach(function(item){
          sc.toggleSelection(item.entity.id, item.entity.username);
        });
      });
    },
    columnDefs: [
      {
        field: 'username',
        displayName: '用户名',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },      
      { 
        field: 'company',
        displayName: '公司名称',
        filter: {
          placeholder: '搜索...'
        },
        width: 250,
        enableHiding: false
      },
      {
        field:'contacts',
        displayName: '联系人',
        filter: {
          placeholder: '搜索...'
        },
        width: 150,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableHiding: false
      },
      { 
        field: 'mobile',
        displayName: '账户手机号码',
        filter: {
          placeholder: '搜索...'
        },
        width: 120,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableHiding: false
      }
    ]
  }; 

  sc.fillMsgSentList = function fillMsgSentList(data){
    sc.historyGridOptions.data = data.re.list;
    sc.loadingHistory = false;
  }; 

  sc.getMsgSentList = function getMsgSentList(){
    sc.loadingHistory = true;

    var ajaxUrl = 'admin/user/getMessageSendList';
    var qData = {
      type: 0
    };

    ycsApi.post(ajaxUrl, qData, sc.fillMsgSentList);
  };

  sc.fillMsgDetailData = function fillMsgDetailData(data){
    sc.msgDetailList = data.re.list;
  }; 

  sc.getMsgSentDetail = function getMsgSentDetail(id){
    var ajaxUrl = 'admin/user/getMessageSendDetail';
    var qData = {
      type: 0,
      mslid: id
    };

    ycsApi.post(ajaxUrl, qData, sc.fillMsgDetailData);
  }; 

  sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.users;
    sc.gridApi.selection.clearSelectedRows();
    sc.tempArray = [];
    sc.tempSelected = [];
    sc.tempArray.length = 0;
    sc.loadingGrid = false;
  };

  sc.filterUserData = function filterUserData(data){
    sc.gridOptions.data = data.re.users;
    sc.loadingGrid = false;
  };

  sc.getExistingData = function getExistingData(){
    var ajaxUrl = 'admin/user/getUserList';
    var qData = {
      pageSize: 999999
    };

    sc.loadingGrid = true;

    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
    delete sc.qData.contactsdistrict;
    delete sc.qData.userrole;
  };  

  sc.filterUser = function filterUser(){
    sc.filterData = {};

    sc.loadingGrid = true;
    
    if(sc.qData.contactsdistrict){
      if(sc.qData.contactsdistrict % 10000 === 0 && sc.qData.contactsdistrict % 100 === 0){
        sc.filterData.contactsprovince = sc.qData.contactsdistrict;
      } else if(sc.qData.contactsdistrict % 100 === 0 && sc.qData.contactsdistrict % 10000 !== 0){
        sc.filterData.contactscity = Math.round(sc.qData.contactsdistrict / 100) * 100;
        sc.filterData.contactsprovince = Math.round(sc.qData.contactsdistrict / 10000) * 10000;
      } else{
        sc.filterData.contactsdistrict = sc.qData.contactsdistrict;
        sc.filterData.contactscity = Math.round(sc.qData.contactsdistrict / 100) * 100;
        sc.filterData.contactsprovince = Math.round(sc.qData.contactsdistrict / 10000) * 10000;
      }
    }

    if(sc.qData.userrole){
      sc.filterData.userrole = sc.qData.userrole;
    }

    var ajaxUrl = 'admin/user/getUserList';
    var qData = {};
    qData = sc.filterData;
    qData.pageSize = 999999;

    ycsApi.post(ajaxUrl, qData, sc.filterUserData);
  };

  sc.msgSent = function msgSent(){
    Notification.success('信息发送成功');
    sc.getExistingData();
  };

  sc.sendMsg = function sendMsg(detail){
    var ajaxUrl = 'admin/user/sendMsg';
    var qData;
    qData = detail;

    qData.ids = sc.tempArray.join(',');

    ycsApi.post(ajaxUrl, qData, sc.msgSent);
  };

  sc.clearContent = function clearContent(){
    sc.qData.content = '';
  };

  sc.openUserList = function openUserList(){
    sc.choiceUsers = true;
    sc.getMsgList = false;
    sc.getExistingData();
  };

  sc.openMsgSentList = function openMsgSentList(){
    sc.choiceUsers = false;
    sc.getMsgList = true;
    sc.getMsgSentList();
  };

  sc.openMsgDetailList = function openMsgDetailList (id, type, message, created) {
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/notificationHistoryDetail.html',
      size: 'xl',
      controller: 'notificationHistoryDetailUserModalCtrl',
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

app.controller('notificationHistoryDetailUserModalCtrl', ['$scope', 'notifyDetail', '$modalInstance', 'ycsApi', 'Notification', function(sc, notifyDetail, $modalInstance, ycsApi, Notification){
  sc.notifyDetail = notifyDetail;

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

  sc.fillMsgDetailData = function fillMsgDetailData(data){
    sc.msgDetailList = data.re.list;
  }; 

  sc.getMsgSentDetail = function getMsgSentDetail(id){
    var ajaxUrl = 'admin/user/getMessageSendDetail';
    var qData = {
      type: 0,
      mslid: sc.notifyDetail.id
    };

    ycsApi.post(ajaxUrl, qData, sc.fillMsgDetailData);
  };

  sc.getMsgSentDetail();
}]);

})(window.angular);