(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('userBasicInfoCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$state', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $state) {
  sc.typeUnitOpts = [
    {value: 1, label: '服务商机构'},
    {value: 2, label: '服务商分支机构'},
    {value: 3, label: '客户公司'},
    {value: 4, label: '客户分支公司'}
  ];

  sc.dataSaved = function dataSaved(){
    Notification.success('用户基本信息保存成功！');
  };

  sc.save = function save(detail){
  	var ajaxUrl = 'admin/user/editUser';

    var qData = detail;

    qData.userid = sc.userInfo.id;
    
    ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };
}]);

})(window.angular);