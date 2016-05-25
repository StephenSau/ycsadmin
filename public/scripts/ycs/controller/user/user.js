(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('userCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal) {
  sc.loadingGrid = true;

  sc.qData = {};

  sc.userRoleOpts = [
    {value: '0', label: '普通用户'},
    {value: '1', label: '普通用户(带订单)'},
    {value: '2', label: '已冻结用户'},
    {value: '4', label: '已删除用户'},
  ];

  sc.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    flatEntityAccess: true,
    rowHeight: 50,
    onRegisterApi: function(gridApi){
      sc.gridApi = gridApi;
    },
    columnDefs: [
      {
        field: 'username',
        displayName: '用户名',
        cellClass:'multiline',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'id',
        displayName: '操作',
        width: 70,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.editUser(COL_FIELD)">详情</a></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableSorting: false,
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'company',
        displayName: '公司简称',
        cellClass:'multiline',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field:'mobile',
        displayName: '账户手机号码',
        width: 130,
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'area',
        displayName: '所在区域',
        width: 200,
        cellClass:'multiline',
        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.contactsprovincecn}}{{row.entity.contactscitycn}}{{row.entity.contactsdistrictcn}}</div>',
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'contacts',
        displayName: '联系人',
        width: 100,
        cellClass:'multiline',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'contactsmobile',
        displayName: '联系人手机号码',
        width: 130,
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'contactsemail',
        displayName: '联系人电子邮箱',
        cellClass:'multiline',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'order',
        displayName: '订单情况',
        width: 180,
        headerCellClass: 'text-center',
        cellClass:'text-center',
        cellTemplate: '<div class="ui-grid-cell-contents order-statics"><div><span ng-class="{notZero: row.entity.executeCount > 0}">进行中：{{row.entity.executeCount}}</span><span> | </span><span ng-class="{notZero: row.entity.finishedCount > 0}">已完成：{{row.entity.finishedCount}}</span><div><span ng-class="{notZero: row.entity.cancelCount > 0}">已取消：{{row.entity.cancelCount}}</span><span> | </span><span ng-class="{notZero: row.entity.stopCount > 0}">已中止：{{row.entity.stopCount}}</span></div>',
        enableColumnMenu: false,
        enableSorting: false,
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'status',
        displayName: '更多操作',
        width: 90,
        cellTemplate: '<div class="ui-grid-cell-contents"><div><a ng-if="COL_FIELD === 0" ng-click="grid.appScope.changeUserPassword(row.entity.id)">修改密码</a></div><div> <a ng-if="COL_FIELD === 0" ng-click="grid.appScope.userPermission(row.entity.id, row.entity.username, COL_FIELD, \'freeze\')">冻结</a><a ng-if="COL_FIELD === 1" ng-click="grid.appScope.userPermission(row.entity.id, row.entity.username, COL_FIELD, \'unfreeze\')">解冻</a> <a class="link-delete" ng-if="COL_FIELD === 0 || COL_FIELD === 1" ng-click="grid.appScope.userPermission(row.entity.id, row.entity.username, COL_FIELD, \'delete\')">删除</a><a ng-if="COL_FIELD === 4" ng-click="grid.appScope.userPermission(row.entity.id, row.entity.username, COL_FIELD, \'restore\')">恢复</a> </div></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableSorting: false,
        enableFiltering: false,
        enableHiding: false
      }
    ]
  };

  sc.chooseIndustry = function chooseIndustry(){
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/industryCategory.html',
      size: 'lg',
      controller: 'industryCategoryModalCtrl',
      backdrop: 'static',
      resolve: {
        industryInfo: function() {
          return {
          };
        }
      }
    });

    modalInstance.result.then(function (industryInfo){
      
    });
  };

  sc.editUser = function editUser (id) {
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/user/editUser.html',
      size: 'xl',
      backdrop: 'static',
      controller: 'editUserModalCtrl',
      resolve: {
        userInfo: function() {
          return {
            id: id,
            filterData: sc.filterData
          };
        }
      }
    });

    modalInstance.result.then(function (userInfo){
      //sc.getExistingData();
      var ajaxUrl = 'admin/user/getUserList';
      var qData = {};
      qData.pageSize = 999999;


      if(userInfo.filterData){
        qData = userInfo.filterData;
      }

      ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
    });
  };


  sc.userPermission = function userPermission (id, username, status, func) {
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/user/userPermission.html',
      size: 'md',
      backdrop: 'static',
      controller: 'userPermissionModalCtrl',
      resolve: {
        userInfo: function() {
          return {
            id: id,
            username: username,
            status: status,
            func: func
          };
        }
      }
    });

    modalInstance.result.then(function (){
      sc.getExistingData();
    }); 
  };

  sc.changeUserPassword = function changeUserPassword (id, username) {
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/user/changeUserPassword.html',
      size: 'md',
      backdrop: 'static',
      controller: 'changeUserPasswordModalCtrl',
      resolve: {
        userInfo: function() {
          return {
            id: id
          };
        }
      }
    });

    modalInstance.result.then(function (){
      sc.getExistingData();
    }); 
  };


  sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.users;
    sc.loadingGrid = false;
  };

  sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;

    var ajaxUrl = 'admin/user/getUserList';
    var qData = { 
      pageSize: 999999
    };
    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);

    delete sc.qData.contactsdistrict;
    delete sc.qData.userrole;
  };

  sc.filterUser = function filterUser(){
    sc.loadingGrid = true;
    sc.filterData = {};
    
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

    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  }; 

  sc.getExistingData();


}]);

// MODAL: 用户详情-基本信息

app.controller('editUserModalCtrl', ['$scope', 'userInfo', '$modalInstance', 'ycsApi', 'Notification', function(sc, userInfo, $modalInstance, ycsApi, Notification){
  sc.userInfo = userInfo;

  sc.userRoleOpts = [
    {value: 1, label: '普通用户'},
    {value: 88, label: '运营人员'},
    {value: 99, label: '系统管理员'},
  ];

  sc.userModal = {};

  sc.userModal.close = function userModalclose () {
    $modalInstance.close(userInfo);
  };

  sc.tabsTpl = {
    basicInfo: 'tpl/user/basicInfo.html',
    // corpInfo: 'tpl/user/corpInfo.html',
    contactInfo: 'tpl/user/contactInfo.html',
    orders: 'tpl/user/orders.html'
  };

  sc.currentTab = sc.tabsTpl.basicInfo;

  sc.switchTab = function switchTab(tabName){
    switch (tabName){
      // case 'corpInfo':
      case 'contactInfo':
      case 'orders':
        sc.currentTab = sc.tabsTpl[tabName];
        break;
      default:
      case 'basicInfo':
        sc.currentTab = sc.tabsTpl.basicInfo;
        break;
    }
  };

  sc.fillExitingData = function fillExitingData(data){
    sc.qData = data.re;
  };

  sc.getExistingData = function getExistingData(){
    var ajaxUrl = 'admin/user/getInfo';
    var qData = { 
      id: sc.userInfo.id
    };
    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  }; 

  sc.getExistingData();


}]);

app.controller('userPermissionModalCtrl', ['$scope', 'userInfo', '$modalInstance', 'ycsApi', 'Notification', function(sc, userInfo, $modalInstance, ycsApi, Notification){
  sc.userInfo = userInfo;

  sc.userModal = {};

  sc.userModal.close = function userModalclose () {
    $modalInstance.close();
  };

  sc.dataSaved = function dataSaved(data){
    Notification.success('用户状态修改成功！');
    $modalInstance.close();
  };

  sc.editUserStatus = function editUserStatus(detail){
    var ajaxUrl = 'admin/user/freezeOrDelete';

    var qData = detail;

    qData.id = sc.userInfo.id;

    switch (sc.userInfo.func){
      case 'freeze':
        qData.status = 1;
        break;
      case 'unfreeze':
        qData.status = 0;
        break;
      case 'delete':
        qData.status = 4;
        break;
      case 'restore':
        qData.status = 0;
        break;
    }

    ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };

  sc.renderUserDetail = function renderUserDetail(data){
    sc.qData = data.re;
  };

  sc.getUserDetail = function getUserDetail(){
    var ajaxUrl = 'admin/user/getInfo';

    var qData = {
      id: sc.userInfo.id
    };

    ycsApi.post(ajaxUrl, qData, sc.renderUserDetail);
  };

  sc.getUserDetail();

}]);

// MODAL: 修改用户账户密码

app.controller('changeUserPasswordModalCtrl', ['$scope', 'userInfo', '$modalInstance', 'ycsApi', 'Notification', function(sc, userInfo, $modalInstance, ycsApi, Notification){
  sc.userInfo = userInfo;

  sc.userModal = {};

  sc.userModal.close = function userModalclose () {
    $modalInstance.dismiss('cancel');
  };

  sc.dataSaved = function dataSaved(data){
    Notification.success('用户密码修改成功！');
    $modalInstance.dismiss('cancel');
  };

  sc.editPassword = function editPassword (detail){
    var ajaxUrl = 'admin/user/updatePassword';

    var qData = detail;

    qData.id = sc.userInfo.id;

    ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };

  sc.renderUserDetail = function renderUserDetail(data){
    sc.cred = data.re;
  };

  sc.getUserDetail = function getUserDetail(){
    var ajaxUrl = 'admin/user/getInfo';

    var qData = {
      id: sc.userInfo.id
    };

    ycsApi.post(ajaxUrl, qData, sc.renderUserDetail);
  };

  sc.getUserDetail();
}]);


})(window.angular);