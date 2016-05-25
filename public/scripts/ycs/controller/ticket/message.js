(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('ticketMessageCtrl', ['$scope', 'ycsUtil', 'ycsApi', '$filter', 'Notification', '$modal', '$interval', function (sc, ycsUtil, ycsApi, $filter, Notification, $modal, $interval) {
  var listRefreshTimer;

  sc.isFiltering = false;

  sc.ticketStatusOpts = [
    { value: 0, label: '待审核' },
    { value: 5, label: '待付款' },
    { value: 10, label: '已付款' },
    { value: 15, label: '已收款' },
    { value: 20, label: '服务中' }, 
    { value: 30, label: '已完成' },
    { value: 40, label: '申请中止'},
    { value: 42, label: '已取消' },
    { value: 44, label: '已中止' },
    { value: 46, label: '已删除' },
    { value: 48, label: '已作废' }
  ];

  sc.qData = {};

  sc.getMessageData = function getMessageData(){
    var ajaxUrl = 'admin/order/getMsgList';
    var qData = {};

    if (sc.filterData) {
      qData = sc.filterData;
    }

    qData.pageSize = 999999;

    ycsApi.post(ajaxUrl, qData, sc.renderMessageData);
  };

  sc.renderMessageData = function renderMessageData(data){
    sc.tempMsgList = data.re.msgList;
    sc.messages = [].concat(sc.tempMsgList);
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

  sc.checkAllMsgs = function checkAllMsgs(){
    if (sc.messages.length === 0) {
      return;
    }

    var unreadList = [];
    sc.messages.forEach(function(msg){
      if (msg.status === 0){
        unreadList.push(msg.id);
      }
    });

    var ids = unreadList.join(',');

    sc.changeMsgStatus(ids);
  };

  sc.changeMsgStatus = function changeMsgStatus(ids){
    if (!ids || String(ids).trim() === ''){
      return;
    }

    var ajaxUrl = 'admin/order/setMsgReaded';
    var qData = {
      msgids : ids + ''
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
            // filterData: sc.filterData
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

  sc.renderDate = function renderDate(){
    if (!sc.qData._sendTim) {
      sc.qData._sendTime = new Date();
    }
  };

  sc.filterTickets = function filterTickets(qData){
    var ajaxUrl = 'admin/order/getMsgList';
    
    qData.pageSize = 999999;

    if (qData._sendTime){
      qData.sendTime = $filter('date')(qData._sendTime, 'yyyy-MM-dd'); 
    }

    sc.filterData = qData;

    sc.isFiltering = true;

    ycsApi.post(ajaxUrl, qData, sc.renderMessageData);
  };

  sc.clearFilterData = function clearFilterData(){
    sc.isFiltering = false;
    sc.qData = {};
    delete sc.filterData;

    sc.getMessageData();
  };

  sc.refreshList = function refreshList(){
    sc.getMessageData();
    Notification('消息列表已刷新');
  };

  sc.getMessageData();
  sc.autoRefresh();
}]);

})(window.angular);