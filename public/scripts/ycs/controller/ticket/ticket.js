(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('ticketCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', '$interval', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal, $interval) {
  sc.loadingGrid = true;
  sc.loadingMsg = true;

  var listRefreshTimer;

  var existingDataOpts = [
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
    { value: 48, label: '已作废' }
  ];

  var recycleDataOpts = [
    { value: 46, label: '已删除' }
  ];

  sc.msgBoxFolded = false;

  sc.qData = {};

  sc.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    flatEntityAccess: true,
    rowHeight: 65,
    onRegisterApi: function(gridApi){
      sc.gridApi = gridApi;
    },
    columnDefs: [
      {
        field: 'workorderno',
        displayName: '工单号',
        width: 140,
        cellClass:'multiline',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'sdname',
        displayName: '服务名称',
        cellClass:'multiline',
        width: 140,
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'orderno',
        displayName: '操作',
        width: 60,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.editOrder(COL_FIELD)">详情</a></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableSorting: false,
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'sourceid',
        displayName: '来源',
        width: 90,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ {value: 10, label: '网站'}, {value: 20, label: '微信'}, {value: 30, label: '直销'}, {value: 40, label: '渠道'}, {value: 50, label: '服务商'}, {value: 60, label: 'aV'}, {value: 70, label: 'pV'}, {value: 80, label: '内部测试'}, {value: 90, label: '其他'}]
        },
        cellTemplate: '<div class="ui-grid-cell-contents"><span ng-if="COL_FIELD === 10">网站</span><span ng-if="COL_FIELD === 20">微信</span><span ng-if="COL_FIELD === 30">直销</span><span ng-if="COL_FIELD === 40">渠道</span><span ng-if="COL_FIELD === 50">服务商</span><span ng-if="COL_FIELD === 60">aV</span><span ng-if="COL_FIELD === 70">pV</span><span ng-if="COL_FIELD === 80">内部测试</span><span ng-if="COL_FIELD === 90">其他</span></div>',
        enableHiding: false 
      },
      {
        field: 'area',
        displayName: '服务区域',
        width: 100,
        cellTemplate: '<div class="ui-grid-cell-contents area"><p>{{row.entity.province}}</p><p>{{row.entity.city}}</p><p>{{row.entity.district}}</p></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableSorting: false,
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'cc',
        displayName: '联系人/手机/用户名',
        width: 150,
        cellTemplate: '<div class="ui-grid-cell-contents contact"><p class="cname">{{row.entity._cName}}</p><p class="cellphone">{{row.entity.ccmobile}}</p><p class="uname">{{row.entity._uName}}</p></div>',
        filter: {
          placeholder: '搜索...'
        },
        enableColumnMenu: false,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableSorting: false,
        enableHiding: false
      },
      {
        field: 'sernickname',
        displayName: '服务商',
        width: 140,
        cellClass:'multiline',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'due',
        displayName: '总金额',
        width: 100,
        type: 'number',
        cellTemplate: '<div class="ui-grid-cell-contents prices"><p>￥{{row.entity.due}}</p></div>',
        headerCellClass: 'text-center',
        cellClass:'text-right',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'uniquetradeid',
        displayName: '支付单号',
        width: 140,
        cellClass:'paymentnum multiline',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'paychannel',
        displayName: '支付渠道',
        width: 100,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ {value: '支付宝', label: '支付宝'}, {value: '微信', label: '微信'}]
        },
        enableHiding: false
      },
      {
        field: 'modified',
        displayName: '最后更新时间',
        width: 145,
        cellClass:'text-center time multiline',
        headerCellClass: 'text-center',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'status',
        displayName: '订单状态',
        width: 90,
        type: 'number',
        cellClass:'text-center multiline',
        headerCellClass: 'text-center',
        filter: {
          condition: uiGridConstants.filter.STARTS_WITH,
          type: uiGridConstants.filter.SELECT,
          selectOptions: []
        },
        cellTemplate: '<div class="ui-grid-cell-contents"><span ng-if="COL_FIELD === 0">待审核</span><span ng-if="COL_FIELD === 5">待付款</span><span ng-if="COL_FIELD === 10">已付款</span><span ng-if="COL_FIELD === 11">已付款(金额有误)</span><span ng-if="COL_FIELD === 15">已收款</span><span ng-if="COL_FIELD === 20">服务中</span><span ng-if="COL_FIELD === 30">已完成</span><span ng-if="COL_FIELD === 40">申请中止</span><span ng-if="COL_FIELD === 42">已取消</span><span ng-if="COL_FIELD === 44">已中止</span><span ng-if="COL_FIELD === 46">已删除</span><span ng-if="COL_FIELD === 48">已作废</span></div>',
        enableHiding: false
      },
      {
        field: 'serviceStatus',
        displayName: '服务状态',
        width: 100,
        cellClass:'multiline',
        enableColumnMenu: false,
        enableSorting: false,
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'remark',
        displayName: '备注',
        width: 140,
        cellClass:'multiline',
        filter: {
          placeholder: '搜索...'
        }
      }
    ]
  };

  sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;

    var ajaxUrl = 'admin/order/getOrderList';
    
    var qData = {
      pageSize : 999999
    };

    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);

    sc.checkRecyle = false;

    delete sc.qData.district;

    //每次在列表增加或删除一个对象，下面的数字相应加减

    sc.gridOptions.columnDefs[11].filter.selectOptions = existingDataOpts;
  };  

  sc.fillExitingData = function fillExitingData(data){
    var gridData = data.re.orderList;

    if (gridData.length > 0){
      gridData.forEach(function(row){
        var cc = row.cc.split('/');
        row._cName = cc[0]; // 联系人
        row._uName = cc[1]; // 用户名
      });
    }

    sc.gridOptions.data = gridData;

    sc.loadingGrid = false;
  };

  sc.getMessageData = function getMessageData(){
    sc.loadingMsg = true;

    var ajaxUrl = 'admin/order/getMsgList';
    var qData = {
      pageSize : 100   // 优化生产环境访问速度，只显示最新的100条消息
    };
    ycsApi.post(ajaxUrl, qData, sc.renderMessageData);
  };

  sc.renderMessageData = function renderMessageData(data){
    sc.tempMsgList = data.re.msgList;
    sc.messages = [].concat(sc.tempMsgList);

    sc.loadingMsg = false;
  };

  sc.autoRefresh = function autoRefresh(){
    Notification.info({message: '消息列表每3分钟自动刷新一次', delay: 5000});

    listRefreshTimer = $interval(function(){
      Notification('消息列表已刷新');
      sc.getMessageData();
    }, 180000);
  };

  // Stop the timer when exit current controller
  sc.$on('$destroy', function(){
    if (listRefreshTimer){
      $interval.cancel(listRefreshTimer);
      Notification.info('Timer destroyed');
    }
  });

  sc.changeMsgStatus = function changeMsgStatus(id){
    if (!id || String(id).trim() === ''){
      return;
    }

    var ajaxUrl = 'admin/order/setMsgReaded';
    var qData = {
      msgids: id + ''
    };
    ycsApi.post(ajaxUrl, qData, sc.getMessageData);
  };

  sc.editOrder = function editOrder (id, msgStatus, msgId) {
    if (!isNaN(parseFloat(msgStatus)) && isFinite(msgStatus)){
      if (msgStatus === 0 && msgId){
        sc.changeMsgStatus(msgId);
      }
    }

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

  sc.filterTicket = function filterTicket(){
    sc.filterData = {};

    sc.loadingGrid = true;

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

    var ajaxUrl = 'admin/order/getOrderList';
    var qData = {};
    qData = sc.filterData;
    qData.pageSize = 999999;

    if(sc.checkRecyle){
      qData.status = sc.statusForNow;
    }

    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  };

  sc.getRecycleData = function getRecycleData(){
    var ajaxUrl = 'admin/order/getOrderList';
    var qData = {
      pageSize : 999999,
      status : 46
    };

    sc.loadingGrid = true;

    sc.statusForNow = 46;

    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);

    sc.checkRecyle = true;

    delete sc.qData.district;

    sc.gridOptions.columnDefs[10].filter.selectOptions = recycleDataOpts;
  };

  sc.clearFilterData = function clearFilterData(){
    var ajaxUrl = 'admin/order/getOrderList';
    var qData = {};
    if(sc.checkRecyle){
      qData.status = sc.statusForNow;
    }

    sc.loadingGrid = true;
    
    delete sc.qData.district;

    if(sc.filterData){
      ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
    }
  };

  sc.refreshList = function refreshList(){
    sc.getExistingData();
    sc.getMessageData();
    Notification.info('工单列表已刷新');
    Notification('消息列表已刷新');
  };

  sc.toggleMsgBox = function toggleMsgBox(toState){
    if (toState === 'fold'){
      sc.msgBoxFolded = true;
    } else if (toState === 'unfold'){
      sc.msgBoxFolded = false;
    }
  };

  sc.exportTickets = function exportTickets(){
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/ticket/exportTicket.html',
      size: 'md',
      backdrop: 'static',
      controller: 'exportTicketModalCtrl',
      resolve: {
        orderInfo: function() {
          return {
          };
        }
      }
    });
  };

  // sc.ticketsExported = function ticketsExported(data){
  //   var file = new Blob([ data ], {
  //       type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //   });

  //   // Create <a> link to the Blob steam and perform cliking

  //   var now = new Date();
  //   var dateStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
  //   var timeStr = (now.getHours() + 1) + '-' + ((now.getMinutes() < 10 ? '0' : '') + now.getMinutes()) + '-' + ((now.getSeconds() < 10 ? '0' : '') + now.getSeconds());
  //   var filename = 'YCS_' + dateStr + '_' + timeStr + '.xls';
   
  //   var fileURL = URL.createObjectURL(file);
  //   var a = document.createElement('a');
  //       a.href = fileURL; 
  //       a.target = '_blank';
  //       a.download = filename;
    
  //   document.body.appendChild(a);
  //   a.click();
  // };

  // sc.exportTickets = function exportTickets(){
  //   var ajaxUrl = 'admin/order/exportOrderList';
  //   var qData = {};

  //   ycsApi.postToGetStream(ajaxUrl, qData, sc.ticketsExported);
  // };

  sc.getExistingData();
  sc.getMessageData();
  sc.autoRefresh();
}]);

app.controller('editOrderModalCtrl', ['$scope', 'orderInfo', '$modalInstance', 'ycsApi', 'ycsUtil', 'Notification', function(sc, orderInfo, $modalInstance, ycsApi, ycsUtil, Notification){
  sc.orderInfo = orderInfo;

  // Step flag for add new order
  sc.newOrder = {
    step: 0
  };

  sc.orderUser = {
    id: null
  };

  sc.orderModal = {
    showServiceTab: false
  };

  sc.orderModal.close = function orderModalclose () {
    $modalInstance.close(orderInfo);
  };

  sc.tabsTpl = {
    client: 'tpl/ticket/client.html',
    order: 'tpl/ticket/order-edit.html',
    service: 'tpl/ticket/service.html'
  };

  sc.currentTab = sc.tabsTpl.order;

  sc.switchTab = function switchTab(tabName){
    switch (tabName){
      case 'service':
      case 'client':
        sc.currentTab = sc.tabsTpl[tabName];
        break;
      default:
      case 'order':
        sc.currentTab = sc.tabsTpl.order;
        break;
    }
  };

  sc.orderModal.fillExistingFullData = function orderModalFillExistingFullData(data){
    sc.qData = data.re;

    switch (sc.qData.status) {
      case 20:  // 处理中
        sc.orderModal.showServiceTab = true;
        sc.orderModal.serviceActive = true;
        break;
      case 30:  // 已完成
      case 40:  // 申请中止
      case 44:  // 已中止
        sc.orderModal.showServiceTab = true;
        sc.orderModal.serviceActive = false;
        break;
      default:
        sc.orderModal.showServiceTab = false;
        sc.orderModal.serviceActive = false;
    }

    if (!sc.qData.company || String(sc.qData.company).trim() === ''){
      sc.qData.company = '无';  // fallback for old data
    }

    sc.qData.noAvailableSpecs = true;

    for (var i = 0; i < sc.qData.serviceitems.length; i++){
      var sItem = sc.qData.serviceitems[i];
      if (sItem.options && sItem.options.length > 0){
        sc.qData.noAvailableSpecs = false;
        sItem.optionsGroup = ycsUtil.spliter(sItem.options, '|');
      }
    }
  };

  sc.orderModal.getExistingData = function orderModalGetExistingData(){
    var ajaxUrl = 'admin/order/qryOrderByNo';
    var qData = {
      orderno : sc.orderInfo.id
    };
    ycsApi.post(ajaxUrl, qData, sc.orderModal.fillExistingFullData);
  };

  sc.toNextStep = function toNextStep(userId){
    sc.newOrder.step = 1;
    sc.orderUser.id = userId;
  };

  if (sc.orderInfo.id !== 'new'){ 
    sc.orderModal.getExistingData();
  }


}]);

app.controller('exportTicketModalCtrl', ['$scope', 'orderInfo', '$modalInstance', 'ycsApi', 'ycsUtil', 'Notification', '$filter', function(sc, orderInfo, $modalInstance, ycsApi, ycsUtil, Notification, $filter){
  sc.orderInfo = orderInfo;

  sc.qData = {};

  sc.qData.option = 'all';

  sc.renderTimeFrame = function renderTimeFrame(){
    var now = new Date();

    // Default fromTime: yesterday 18:00:00
    var fromTime = new Date(now.getTime() - 24 * 3600000);
        fromTime.setHours(18);
        fromTime.setMinutes(0);
        fromTime.setSeconds(0);
        fromTime.setMilliseconds(0);

    // Default toTime: today 18:00:00
    var toTime = now;
        toTime.setHours(18);
        toTime.setMinutes(0);
        toTime.setSeconds(0);
        toTime.setMilliseconds(0);

    sc.qData.beginTime = fromTime;
    sc.qData.endTime = toTime;
  };

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

  sc.dataSaved = function dataSaved(){
    sc.ticketsExported();
    $modalInstance.close();
  };

  sc.ticketsExported = function ticketsExported(data){
    var file = new Blob([ data ], {
        type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Create <a> link to the Blob steam and perform cliking

    var now = new Date();
    var dateStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + (now.getDate() < 10 ? '0' : '') + now.getDate();
    var timeStr = (now.getHours()) + '-' + ((now.getMinutes() < 10 ? '0' : '') + now.getMinutes()) + '-' + ((now.getSeconds() < 10 ? '0' : '') + now.getSeconds());
    var filename = 'YCS_' + dateStr + '_' + timeStr + '.xls';
   
    var fileURL = URL.createObjectURL(file);
    var a = document.createElement('a');
        a.href = fileURL; 
        a.target = '_blank';
        a.download = filename;
    
    document.body.appendChild(a);
    a.click();
  };

  sc.exportTickets = function exportTickets(detail){
    var ajaxUrl = 'admin/order/exportOrderList';
    var qData = {};
    qData = detail;

    if(qData.option === 'all'){
      qData = {};
    } else {
      qData.beginTime = $filter('date')(detail.beginTime, 'yyyy-MM-dd HH:mm');
      qData.endTime = $filter('date')(detail.endTime, 'yyyy-MM-dd HH:mm');
    }

    ycsApi.postToGetStream(ajaxUrl, qData, sc.ticketsExported);
  };

  sc.renderTimeFrame();
}]);

})(window.angular);