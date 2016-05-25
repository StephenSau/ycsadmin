(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('ticketClientCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, Notification, $modal) {
  sc.sourceOpts = [
    {value: '10', label: '网站'},
    {value: '20', label: '微信'},
    {value: '30', label: '直销'},
    {value: '40', label: '渠道'},
    {value: '50', label: '服务商'},
    {value: '60', label: 'aV'},
    {value: '70', label: 'pV'},
    {value: '80', label: '内部测试'},
    {value: '90', label: '其他'}
  ];

  // if `username` is empty, clear all form inputs

  sc.checkIfAccEmpty = function checkIfAccEmpty(){
    if (!sc.qData.username || sc.qData.username.length === 0){
      sc.qData = {};
    }
  };

  sc.renderClientInfo = function renderClientInfo(username, data){
    // 找不到用户
    if (data.re.users.length === 0){
      sc.noUserFound = true;
      sc.insufficientInfo = false;

    } else {
      sc.noUserFound = true;

      var userList = data.re.users;
      var user;

      // 用户名精确匹配
      for (var i = 0; i < userList.length; i++){
        if (userList[i].username === username){
          user = userList[i];
          sc.noUserFound = false;
          break;
        }
      }

      if (!sc.noUserFound) {
        // 用户资料不完善
        if (!user || !user.contacts || user.contacts.length === 0 || !user.contactsmobile || !user.contactsprovince || !user.contactscity || !user.contactsaddress){
          sc.insufficientInfo = true;
          sc.qData = user;
        
        // 用户资料已完善
        } else {
          sc.insufficientInfo = false;
          sc.qData = user;

          if (!sc.qData.company || String(sc.qData.company).trim() === ''){
            sc.qData.company = '无';  // fallback for old data
          }
        }
      }
    }

  };

  sc.dataSaved = function dataSaved(data){
    Notification.success('修改客户信息成功');
    sc.orderModal.getExistingData();
  };

  sc.searchClientInfo = function searchClientInfo(username){
  	var ajaxUrl = 'admin/user/getUserInfo';
		var qData = {
			username: username
		};
		ycsApi.post(ajaxUrl, qData, sc.renderClientInfo.bind(this, username));
  };

  sc.editUserInfo = function editUserInfo(detail){
    var ajaxUrl = 'admin/user/editUserInfo';
    var qData = detail;

    if (qData.contacts){
      qData.contacts.trim();
    }

    ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };
}]);

})(window.angular);