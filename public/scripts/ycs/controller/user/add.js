(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('userAddCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$state', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $state) {
  sc.accAvailable = true;

  sc.userRoleOpts = [
    {value: '1', label: '普通用户'},
    // {value: '1x', label: '服务商用户'}, // 2015-10-20 暂不再允许添加服务商用户
    {value: '88', label: '运营人员'},
    {value: '99', label: '系统管理员'},
  ];

  sc.backToList = function backToList(){
    $state.go('user');
  };

  sc.checkAccountResult = function checkAccountResult(data){
    // Is invalid
    if (!data || Number(data.status) !== 200){
      sc.accAvailable = false;

    // Valid
    } else {
      sc.accAvailable = true;
    }
  };

  sc.checkUsernameAvailability = function checkUsernameAvailability(isInvalid, account){
    if (isInvalid) { return; }

    var ajaxUrl = 'admin/user/validateUsername';
    var qData = {
      username: account
    };

    ycsApi.post(ajaxUrl, qData, sc.checkAccountResult, null, null, sc.checkAccountResult);
  };

  sc.dataSaved = function dataSaved(backToList, data){
    Notification.success('新建用户成功！');

    if (backToList){
      sc.backToList();
    }
  };

  sc.save = function save(detail, backToList){
  	var ajaxUrl = 'admin/user/addUser';
    var qData = detail;

    qData.contactscity = Math.round(qData.contactsdistrict / 100) * 100;

    qData.contactsprovince = Math.round(qData.contactsdistrict / 10000) * 10000;

    // Trim

    if (qData.title){
      qData.title.trim();
    }

    if (qData.company){
      qData.company.trim();
    }

    if (qData.contacts){
      qData.contacts.trim();
    }

    ycsApi.post(ajaxUrl, qData, sc.dataSaved.bind(this, backToList));
  };
}]);

})(window.angular);