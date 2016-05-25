(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('exceptionListModalCtrl', ['$scope', 'exceptionListInfo', '$modalInstance', 'ycsApi', 'Notification', '$modal', function(sc, exceptionListInfo, $modalInstance, ycsApi, Notification, $modal){
  sc.exceptionListInfo = exceptionListInfo;

  sc.ok = function ok () {
    $modalInstance.close();
  };

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

  sc.detail = angular.extend({}, exceptionListInfo.data[0]);

  sc.srid = sc.detail.srid;

  sc.renderList = function renderList(data){
    sc.detailList = data.re.list;
  };

  sc.getList = function getList(info){
    var ajaxUrl = 'admin/servicer/specialList';
    var qData = { 
      srid : sc.srid,
      srsid : sc.exceptionListInfo.srsid
    };

    ycsApi.post(ajaxUrl, qData, sc.renderList);
  };

  sc.delException = function delException(srid, srsid, name) {
    var ajaxUrl = 'admin/servicer/delSpecial';
    var qData = {
      srid : srid,
      srsid : srsid,
      name : name
    };

    ycsApi.post(ajaxUrl, qData, sc.getList);
  };

  sc.addException = function addException (srid, name, srsid, func) {
    var targetData = angular.extend({}, sc.exceptionListInfo);

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/vendor/editExceptionDetail.html',
      size: 'xl',
      controller: 'exceptionDetailModalCtrl',
      backdrop: 'static',
      resolve: {
        exceptionDetailInfo: function() {
          return {
            srid: srid,
            name: name,
            srsid: srsid,
            siid: sc.exceptionListInfo.siid,
            func: func,
            data: targetData
          };
        }
      }
    });

    modalInstance.result.then(function (exceptionDetailInfo){
      sc.getList(exceptionDetailInfo);
    });

  };

  sc.getList();

}]);

})(window.angular);