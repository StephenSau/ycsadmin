(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('vendorCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal) {
  sc.qData = {};

  sc.loadingGrid = true;

  sc.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    flatEntityAccess: true,
    onRegisterApi: function(gridApi){
      sc.gridApi = gridApi;
    },
    columnDefs: [
      {
        field: 'nickname',
        displayName: '服务商简称',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'id', displayName: '操作',
        width: 80,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ui-sref="vendor.corp.edit({vendorId: COL_FIELD})">详情</a></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableSorting: false,
        enableHiding: false,
        enableFiltering: false
      },            
      { 
        field: 'code',
        displayName: '服务商帐号',
        filter: {
          placeholder: '搜索...'
        },
        width: 120,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableHiding: false
      },    
      { 
        field: 'score',
        displayName: '服务商评分',
        filter: {
          placeholder: '搜索...'
        },
        type: 'number',
        width: 120,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableHiding: false
      },
      {
        field: 'status',
        displayName: '合作关系',
        width: 100,
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ { value: 1, label: '未合作' }, { value: 2, label: '未生效' }, { value: 3, label: '生效中' }, { value: 4, label: '待续约' }, { value: 5, label: '已失效' }, { value: 6, label: '冻结中' }, { value: 8, label: '特约专用' }]
        },
        cellClass:'text-center',
        headerCellClass: 'text-center',
        cellTemplate:'<div class="ui-grid-cell-contents"><span class="intact" ng-if="COL_FIELD === 1">未合作</span><span class="ready" ng-if="COL_FIELD === 2">未生效</span><span class="on-going" ng-if="COL_FIELD === 3">生效中</span><span class="due" ng-if="COL_FIELD === 4">待续约</span><span class="overdue" ng-if="COL_FIELD === 5">已失效</span><span class="frozen" ng-if="COL_FIELD === 6">冻结中</span><span ng-if="COL_FIELD === 8">特约专用</span></div>',
        enableHiding: false
      },
      {
        field: 'id',
        displayName: '提供服务区域',
        width: 120,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.supportArea(COL_FIELD, row.entity.nickname)"><i class="fa fa-map-marker fa-lg"></i></a></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableSorting: false,
        enableHiding: false,
        enableFiltering: false
      },
      {
        field: 'id',
        displayName: '提供服务项',
        width: 120,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.supportServiceItem(COL_FIELD, row.entity.nickname)"><i class="fa fa-tasks"></i></a></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableSorting: false,
        enableHiding: false,
        enableFiltering: false
      },
      {
        field: 'contacts',
        displayName: '联系人',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'contactstel',
        displayName: '联系人手机',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'field',
        displayName: '专业领域',
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ 
            { value: '工商', label: '工商' },
            { value: '财务会计', label: '财务会计' },
            { value: '审计', label: '审计' },
            { value: '税务', label: '税务' },
            { value: '法律', label: '法律' },
            { value: '资产评估', label: '资产评估' },
            { value: '许可证', label: '许可证' },
            { value: '商标专利', label: '商标专利' },
            { value: '人力资源', label: '人力资源' }
          ]
        },
        enableHiding: false
      }
    ]
  };  

  sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;

    var ajaxUrl = 'admin/servicer/servicerList';
    var qData = {};

    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
    delete sc.qData.district;
  };  

  sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.servicerList;
    sc.loadingGrid = false;
  };

  sc.supportArea = function supportArea (id, name) {
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/vendor/supportArea.html',
      size: 'xl',
      controller: 'getSupportAreaCtrl',
      resolve: {
        supportAreas: function() {
          return {
            id: id,
            name: name
          };
        }
      }
    });
  };

  sc.supportServiceItem = function supportServiceItem (id, name) {
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/vendor/supportServiceItem.html',
      size: 'xl',
      controller: 'getSupportItemCtrl',
      resolve: {
        supportItems: function() {
          return {
            id: id,
            name: name
          };
        }
      }
    });
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

    var ajaxUrl = 'admin/servicer/servicerList';
    var qData = {};
    qData = sc.filterData;
    qData.pageSize = 999999;

    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  };

  sc.getExistingData();

}]);

// Modal: 查看服务商提供的服务区域

app.controller('getSupportAreaCtrl', ['$scope', 'supportAreas', '$modalInstance', 'ycsApi', 'Notification', '$filter', function(sc, supportAreas, $modalInstance, ycsApi, Notification, $filter){
  sc.supportAreas = supportAreas;

  sc.ok = function ok () {
    $modalInstance.close();
  };

  sc.close = function cancel () {
    $modalInstance.dismiss('cancel');
  };

  sc.detail = {};

  sc.getAreaData = function getAreaData () {
    var ajaxUrl = 'admin/servicer/queryAreaByServicerId';
    var qData = {
      servicerid : sc.supportAreas.id
    };

    ycsApi.post(ajaxUrl, qData, sc.renderAreaData);
  };

  sc.renderAreaData = function renderAreaData (data) {
    sc.detail.servicename = sc.supportAreas.name;
    
    sc.tempArea = data.re;

    var list = [];

    sc.tempArea.forEach(function(item){
      var listItem = {};

      var currentProvince = item.provinceName;

      item.cityList.forEach(function(city){
        var currentCity = city.cityName;

        var result = '';
        city.districtList.forEach(function(district, dIndex){
          result += ((dIndex > 0 ? ', ' : '') + district.districtName);
        });

        list.push({
          province: currentProvince,
          city: currentCity,
          districts: result
        });
      });

    });

    sc.detail.list = list;
  };

  sc.getAreaData();
  
}]);

// Modal: 查看服务商提供的服务项

app.controller('getSupportItemCtrl', ['$scope', 'supportItems', '$modalInstance', 'ycsApi', 'Notification', '$filter', function(sc, supportItems, $modalInstance, ycsApi, Notification, $filter){
  sc.supportItems = supportItems;
  sc.servicerName = supportItems.name;

  sc.detail = {};

  sc.ok = function ok () {
    $modalInstance.close();
  };

  sc.close = function cancel () {
    $modalInstance.dismiss('cancel');
  };

  sc.renderItemData = function renderItemData (data) {
    sc.detail.servicename = sc.supportItems.name;

    var list = [];

    sc.tempItem = data.re;

    sc.tempItem.forEach(function(item){
      var currentTopCatName = item.topCatName;

      item.subCatList.forEach(function(subcat){
        var currentSubCat = subcat.subCatName;

        var result = [];
        subcat.serviceList.forEach(function(service, sIndex){
          result.push(service.serviceName);
        });
        
        list.push({
          topCatName: currentTopCatName,
          subCatName: currentSubCat,
          services: result
        });
      });

    });

    sc.detail.list = list;
  };

  sc.getItemData = function getItemData () {
    var ajaxUrl = 'admin/servicer/querySeviceByServicerId';
    var qData = {
      servicerid : sc.supportItems.id
    };

    ycsApi.post(ajaxUrl, qData, sc.renderItemData);
  };

  sc.getItemData();
}]);

})(window.angular);