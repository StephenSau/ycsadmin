(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('capacityCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal) {
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
        field: 'name',
        displayName: '服务名称',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'id',
        displayName: '编辑',
        width: 70,
        enableColumnMenu: false,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.editData(row.entity.id, row.entity.srid, row.entity.siid, row.entity.name)">编辑</a></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'status',
        displayName: '是否提供',
        width: 100,
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ { value: '0', label: '否' }, { value: '1', label: '是' }]
        },
        cellClass:'text-center',
        headerCellClass: 'text-center',
        cellTemplate: '<div class="ui-grid-cell-contents"><span class="is-true" ng-if="COL_FIELD === 1">是</span><span class="is-false" ng-if="COL_FIELD === 0">否</span></div>',
        enableHiding: false
      },
      {
        field: 'price',
        displayName: '价格',
        width: 160,
        filter: {
          placeholder: '搜索...'
        },
        type: 'number',
        cellClass:'text-right',
        headerCellClass: 'text-center',
        cellTemplate: '<div class="ui-grid-cell-contents"><p>{{COL_FIELD}} <span ng-if="row.entity.unit === 99" class="text-muted">元起</span><span ng-if="row.entity.unit !== 99" class="text-muted">元 \/ {{row.entity.unitname}}</span>&nbsp;<span ng-if="row.entity.pricetype !== 0" class="accumulated">累进</span></p></div>',
        enableHiding: false
      },
      {
        field: 'options',
        displayName: '服务规格',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'advantage',
        displayName: '服务特色说明',
        enableColumnMenu: false,
        filter: {
          placeholder: '搜索...'
        },
        enableSorting: false,
        enableHiding: false
      },
      {
        field: 'invoicetype',
        displayName: '提供发票类型',
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ { value: '均可', label: '均可' }, { value: '收据', label: '收据' }, { value: '国税通用机打发票', label: '国税通用机打发票' }, { value: '增值税普通发票', label: '增值税普通发票' }, { value: '增值税专用发票', label: '增值税专用发票' }, { value: '小规模普通发票', label: '小规模普通发票' }]
        },
        enableHiding: false
      },
      {
        field: 'special',
        displayName: '例外规则',
        width: 100,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.openExceptionList(row.entity.id, row.entity.siid, row.entity.name)">管理 ({{row.entity.special}})</a></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableSorting: false,
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'id',
        displayName: '删除',
        width: 70,
        enableColumnMenu: false,
        cellTemplate: '<div class="ui-grid-cell-contents"><a class="link-delete" ng-click="grid.appScope.delServiceItem(COL_FIELD)">删除</a></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableFiltering: false,
        enableHiding: false
      }
    ]
	};

	sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.list;
    sc.selectedServiceItem = [];
    data.re.list.forEach(function(item){
      sc.selectedServiceItem.push(item.siid);
    });
    sc.loadingGrid = false;
  };

  sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;
    var ajaxUrl = 'admin/servicer/getItems';
    var qData = { 
      srid : sc.vendorId
    };
    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  };  

  sc.editData = function editData (id, srid, siid, name) {
    var targetData = angular.extend({}, sc.gridOptions.data)[id];

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/vendor/serviceItemEdit.html',
      size: 'xl',
      controller: 'serviceItemEditModalCtrl',
      resolve: {
        serviceItemInfo: function() {
          return {
            srsid: id,      // 服务商自定义服务项id
            srid: srid,     // 服务商id
            siid: siid,     // 服务项id
            name: name
          };
        }
      }
    });

    modalInstance.result.then(function (serviceItemInfo){
      sc.getExistingData();
    });
  };

  sc.delServiceItem = function delServiceItem(id){ 
    var ajaxUrl = 'admin/servicer/delItem';

    var qData = { 
      srsid : id
    };

    ycsApi.post(ajaxUrl, qData, sc.getExistingData);
  };  

  sc.openExceptionList = function openExceptionList (id, siid, name) {
    var targetData = angular.extend({}, sc.gridOptions.data);

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/vendor/editExceptionList.html',
      size: 'lg',
      controller: 'exceptionListModalCtrl',
      backdrop: 'static',
      resolve: {
        exceptionListInfo: function() {
          return {
            data: targetData,
            srsid: id,
            srid: sc.vendorId,
            siid: siid,
            name: name
          };
        }
      }
    });

    modalInstance.result.then(function (exceptionListInfo){
      sc.getExistingData();
    });
  };

  sc.addCapacity = function addCapacity () {

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/vendor/addCapacity.html',
      size: 'xl',
      controller: 'addCapacityModalCtrl',
      backdrop: 'static',
      resolve: {
        capacityInfo: function() {
          return {
            select: sc.selectedServiceItem,
            srid: sc.vendorId
          };
        }
      }
    });

    modalInstance.result.then(function (capacityInfo){
      sc.getExistingData();
    });
  };

  sc.getExistingData();
}]);

})(window.angular);