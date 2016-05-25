(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('userContactInfoCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$state', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $state) {
  sc.dataSaved = function dataSaved(){
    Notification.success('用户联系人信息保存成功！');
  };

  sc.save = function save(detail){
  	var ajaxUrl = 'admin/user/editUser';

    var qData = detail;

    if (qData.contacts){
      qData.contacts.trim();
    }

    qData.userid = sc.userInfo.id;

    qData.contactscity = Math.round(qData.contactsdistrict / 100) * 100;

    qData.contactsprovince = Math.round(qData.contactsdistrict / 10000) * 10000;
    
    ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };
}]);

})(window.angular);