(function(angular){

'use strict';

var app = angular.module('backendApp');


app.controller('supportRegionCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', '$rootScope', function (sc, ycsUtil, ycsApi, Notification, $modal, $rootScope) {
  sc.detail = {};

  sc.getData = function getData () {
    var ajaxUrl = 'admin/service/queryServiceArea';
    var qData = {
      serviceid : sc.serviceId
    };

    ycsApi.post(ajaxUrl, qData, sc.renderData);
  };

  sc.renderData = function renderData (data) {
    sc.detail.servicename = data.re.servicename;
    sc.detail.servicecode = data.re.servicecode;

    var list = [];

    sc.tempArea = data.re.provinces;

    sc.tempArea.forEach(function(provinces){
      var currentProvince = provinces.name;

      var listItem = {};
    //       listItem.province = currentProvice;

      provinces.cities.forEach(function(cities){
        var currentCity = cities.cityname;

        var result = '';

        var servicer = '';

        cities.supportdistricts.forEach(function(district, dIndex){
          result += ((dIndex > 0 ? ', ' : '') + district.districtname);
          servicer += ((dIndex > 0 ? ', ' : '') + district.servicers);
        });

        list.push({
          province: currentProvince,
          city: currentCity,
          districts: result,
          servicers: servicer
        });

      });
    });

    sc.detail.list = list;
  };


  sc.getData();

}]);

})(window.angular);