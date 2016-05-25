(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('serviceItemCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal) {
  sc.isAdded = false;
  sc.loadingGrid = true;

  sc.gridOptions = {
    enableColumnResizing: true,
    enableSorting: true,
    enableFiltering: true,
    flatEntityAccess: true,
    onRegisterApi: function(gridApi){
      sc.gridApi = gridApi;
    },
    columnDefs: [
      {
        field: 'name',
        displayName: '服务名称',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'code',
        displayName: '服务编号',
        filter: {
          placeholder: '搜索...'
        },
        width: 100,
        type: 'number',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableHiding: false
      },
      {
        field: 'id',
        displayName: '操作',
        width: 100,
        enableHiding: false,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ui-sref="service.item.edit({itemId:COL_FIELD})">编辑</a></div>',
        enableSorting: false,
        enableFiltering: false
      },
      {
        field: 'status',
        displayName: '是否提供',
        width: 100,
        enableHiding: false,
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ { value: '0', label: '否' }, { value: '1', label: '是' }]
        },
        cellClass:'text-center',
        headerCellClass: 'text-center',
        cellTemplate: '<div class="ui-grid-cell-contents"><span class="is-true" ng-if="COL_FIELD === 1">是</span><span class="is-false" ng-if="COL_FIELD === 0">否</span></div>'
      },
      {
        field: 'tag',
        displayName: '标签',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'categorynames',
        displayName: '所在分类',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      }
    ]
  };  

  sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;

    var ajaxUrl = 'admin/serviceItem/serviceList';
    var qData = {};
    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  };  

  sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.serviceList;
    sc.loadingGrid = false;
  };  

  sc.getExistingData();
}]);

})(window.angular);