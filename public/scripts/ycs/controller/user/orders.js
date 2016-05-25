(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('userOrdersCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$state', '$modal', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $state, $modal) {
  sc.loadingGrid = true;

  sc.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    onRegisterApi: function(gridApi){
      sc.gridApi = gridApi;
    },
    columnDefs: [
      {
        field: 'orderno',
        displayName: '订单号',
        width: 140,
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'orderno',
        displayName: '操作',
        width: 100,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.editOrder(COL_FIELD)">查看订单</a></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableSorting: false,
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'servicename',
        displayName: '服务名称',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'area',
        displayName: '服务区域',
        width: 200,
        cellTemplate: '<div class="ui-grid-cell-contents area">{{row.entity.provincecn}}{{row.entity.citycn}}{{row.entity.districtcn}}</div>',
        enableColumnMenu: false,
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'amount',
        displayName: '总金额',
        width: 120,
        type: 'number',
        cellTemplate: '<div class="ui-grid-cell-contents prices"><p>￥{{row.entity.amount}}</p></div>',
        headerCellClass: 'text-center',
        cellClass:'text-right',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },

      {
        field: 'created',
        displayName: '下单时间',
        width: 150,
        headerCellClass: 'text-center',
        cellClass:'text-center time multiline',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'status',
        displayName: '订单状态',
        width: 100,
        type: 'number',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        filter: {
          condition: uiGridConstants.filter.STARTS_WITH,
          type: uiGridConstants.filter.SELECT,
          selectOptions: [
            { value: 0, label: '待审核' },
            { value: 5, label: '待付款' },
            { value: 10, label: '已付款' },
            { value: 11, label: '已付款(金额有误)'},
            { value: 15, label: '已收款' },
            { value: 20, label: '服务中' },    // 处理中
            { value: 30, label: '已完成' },
            { value: 40, label: '申请中止'},
            { value: 42, label: '已取消' },
            { value: 44, label: '已中止' },
            { value: 46, label: '已删除' },
            { value: 48, label: '已作废' }
          ]
        },
        cellTemplate: '<div class="ui-grid-cell-contents"><span ng-if="COL_FIELD === 0">待审核</span><span ng-if="COL_FIELD === 5">待付款</span><span ng-if="COL_FIELD === 10">已付款</span><span ng-if="COL_FIELD === 11">已付款(金额有误)</span><span ng-if="COL_FIELD === 15">已收款</span><span ng-if="COL_FIELD === 20">服务中</span><span ng-if="COL_FIELD === 30">已完成</span><span ng-if="COL_FIELD === 40">申请中止</span><span ng-if="COL_FIELD === 42">已取消</span><span ng-if="COL_FIELD === 44">已中止</span><span ng-if="COL_FIELD === 46">已删除</span><span ng-if="COL_FIELD === 48">已作废</span></div>',
        enableHiding: false
      }
    ]
  };

  sc.editOrder = function editOrder (id) {
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/ticket/editOrder.html',
      size: 'xl',
      backdrop: 'static',
      controller: 'editOrderModalCtrl',
      resolve: {
        orderInfo: function() {
          return {
            id: id,
            checkRecyle: sc.checkRecyle,
            filterData: sc.filterData
          };
        }
      }
    });

    modalInstance.result.then(function (orderInfo){
      var ajaxUrl = 'admin/order/getOrderList';
      var qData = {};

      if(orderInfo.filterData){
        qData = orderInfo.filterData;

        if(!orderInfo.checkRecyle){
          delete qData.status;
        } else {
          qData.status = 46;
        }
      } else {
        qData.pageSize = 999999;

        if(!orderInfo.checkRecyle){
          delete qData.status;
        } else {
          qData.status = 46;
        }
      }

      ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
    });

  };

  sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.order;
    sc.loadingGrid = false;
  };

  sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;

    var ajaxUrl = 'admin/user/getOrderListByUserid';
    var qData = { 
      userid: sc.userInfo.id
    };
    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  };

  sc.getExistingData();
}]);

})(window.angular);