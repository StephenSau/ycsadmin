(function(angular, N){

'use strict';

var app = angular.module('backendApp');

app.controller('supportAreaCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, Notification, $modal) {

  sc.isEmpty = true;

  sc.currentAreas = [];
  sc.currentAreaList = [];

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

	sc.supportAreaSaved = function supportAreaSaved(data){
		Notification.success('服务区域信息保存成功！');
		sc.initStep.current = 1;
    sc.switchTab('capacity');
	};

  sc.save = function save(areaList){
  	var result = '';

  	areaList.forEach(function(area, aIndex){
  		result += ((aIndex > 0 ? ',' : '') + area.selected.join(','));
  	});

  	var ajaxUrl = 'admin/servicer/area';
  	var qData = {
  		srid: Number(sc.vendorId),
  		addCitys: result
  	};

  	ycsApi.post(ajaxUrl, qData, sc.supportAreaSaved);
  };

}]);

// 增加区域版本Modal

app.controller('selectVendorSupportAreaCtrl', ['$scope', 'areaInfo', '$modalInstance', 'ycsUtil', function(sc, areaInfo, $modalInstance, ycsUtil){
  sc.areaInfo = areaInfo;

  sc.ok = function ok () {
    $modalInstance.close(areaInfo);
  };

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

}]);

})(window.angular, window.Neo);