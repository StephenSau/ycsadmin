(function(angular, N){

'use strict';

var app = angular.module('backendApp');

app.controller('modifyAreaCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', '$state', '$stateParams', function (sc, ycsUtil, ycsApi, Notification, $modal, $state, $stateParams) {

  sc.isEmpty = true;

  sc.currentAreas = [];
  sc.currentAreaList = [];

  sc.backToVendorInfo = function backToVendorInfo(){
    $state.go('vendor.corp.edit', {vendorId: $stateParams.vendorId});
  };

  sc.renderSelectedAreaList = function renderSelectedAreaList(data){
    data.re.forEach(function(city){
      var selectedDistricts = [];

      city.cityList.forEach(function(cityCode){
        cityCode.districtList.forEach(function(num){
          selectedDistricts.push(num.city);
        });

        sc.currentAreaList.push({
          code: Math.round(cityCode.districtList[0].city / 100) * 100,
          name: ycsUtil.getAreaLabelByCode(Math.round(cityCode.districtList[0].city / 100) * 100, ' '),
          selected: selectedDistricts,
          checkAll: false
        });

      });
      
    });
  };

  sc.getSelectedAreaList = function getSelectedAreaList(){
    var ajaxUrl = 'admin/servicer/queryAreaByServicerId';
    var qData = {
      servicerid: sc.srid
    };

    ycsApi.post(ajaxUrl, qData, sc.renderSelectedAreaList);
  };

  // Completely refresh
  sc.renderAreaList = function renderAreaList(){
  	sc.currentAreaList = [];

  	if (sc.currentAreas.length === 0) {return;}

  	sc.currentAreas.forEach(function(cityCode){
  		sc.currentAreaList.push({
  			code: cityCode,
  			name: ycsUtil.getAreaLabelByCode(cityCode, ' '),
  			// selected: [],
  			checkAll: false
  		});
  	});
  };

  // Add one item per time
  sc.appendAreaToList = function appendAreaToList(lastAddedCode){
  	sc.currentAreaList.push({
			code: lastAddedCode,
			name: ycsUtil.getAreaLabelByCode(lastAddedCode, ' '),
			selected: [],
			checkAll: true
  	});
  };

  sc.addAvailableCity = function addAvailableCity(){
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/vendor/addSupportArea.html',
      size: 'md',
      controller:'selectVendorSupportAreaCtrl',
      resolve: {
        areaInfo: function(){
          return {
            districtCode: null
          };
        }
      }
    });

	  modalInstance.result.then(function (areaInfo){
	  	var selectedIndex = sc.currentAreas.indexOf(areaInfo.districtCode);

	  	if (selectedIndex === -1){
				sc.currentAreas.push(areaInfo.districtCode);
				sc.isEmpty = false;
				sc.appendAreaToList(areaInfo.districtCode);

	  	} else {
	  		Notification.warning('此区域已存在，无需重复添加');
	  	}

	  });
  };

  sc.removeArea = function removeArea(index){
  	sc.currentAreaList.splice(index, 1);
  	sc.currentAreas.splice(index, 1);
  };

	sc.supportAreaSaved = function supportAreaSaved(backToDetail, data){
		Notification.success('服务区域信息保存成功！');

    if (backToDetail){
      sc.backToVendorInfo();
    }
	};

  sc.save = function save(areaList, backToDetail){
  	var result = '';

  	areaList.forEach(function(area, aIndex){
  		result += ((aIndex > 0 ? ',' : '') + area.selected.join(','));
  	});

  	var ajaxUrl = 'admin/servicer/updateArea';
  	var qData = {
  		id: Number(sc.srid),
  		cities: result
  	};

  	ycsApi.post(ajaxUrl, qData, sc.supportAreaSaved.bind(this, backToDetail));
  };

  sc.getSelectedAreaList();

}]);

})(window.angular, window.Neo);