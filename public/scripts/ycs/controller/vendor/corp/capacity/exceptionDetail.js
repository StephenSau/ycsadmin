(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('exceptionDetailModalCtrl', ['$scope', 'exceptionDetailInfo', '$modalInstance', 'ycsApi', 'ycsUtil', 'Notification', '$modal', '$timeout', function(sc, exceptionDetailInfo, $modalInstance, ycsApi, ycsUtil, Notification, $modal, $timeout){
  sc.exceptionDetailInfo = exceptionDetailInfo;

  sc.srid = Number(exceptionDetailInfo.data.srid);
  sc.srsid = Number(exceptionDetailInfo.data.srsid);
  sc.siid = Number(exceptionDetailInfo.data.siid);

  sc.exceptionDetail = {};

  sc.currentAreaList = [];
  sc.selectedCities = [];
  
  sc.invoiceTypeUnitOpts = [
    {value: '均可', label: '均可'},
    {value: '收据', label: '收据'},
    {value: '国税通用机打发票', label: '国税通用机打发票'},
    {value: '增值税普通发票', label: '增值税普通发票'},
    {value: '增值税专用发票', label: '增值税专用发票'},
    {value: '小规模普通发票', label: '小规模普通发票'},
  ];

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

  sc.renderSupportedArea = function renderSupportedArea(data){
    sc.exceptionDetail.tempArea = data.re; 
  };

  sc.getSupportedArea = function getSupportedArea(){
    var ajaxUrl = 'admin/servicer/queryAreaByServicerId';
    var qData = {
      servicerid : sc.srid
    };

    ycsApi.post(ajaxUrl, qData, sc.renderSupportedArea);
  };

  sc.checkIfSelected = function checkIfSelected(cityCode) {
    return sc.selectedCities.indexOf(cityCode) !== -1 ? true : false;
  };

  sc.toggleSelected = function toggleSelected (item) {
    var itemIndex = sc.selectedCities.indexOf(item);
    if ( itemIndex === -1){
      sc.selectedCities.push(item);
    } else {
      sc.selectedCities.splice(itemIndex, 1);
    }
  };

  // Add New

  sc.renderOptions = function renderOptions(data){
    sc.exceptionDetail = data.re;
    sc.exceptionDetail.tempOptions = data.re.options;
  };

  sc.getOptions = function getOptions(){
    var ajaxUrl = 'admin/servicer/getStandard';
    var qData = { 
      srid : sc.srid,
      srsid : sc.srsid
    };

    ycsApi.post(ajaxUrl, qData, sc.renderOptions);
  };

  // Edit

  sc.renderExceptionDetail = function renderExceptionDetail(data){
    sc.exceptionDetail = data.re;
    sc.exceptionDetail.specialName = data.re.name;
    sc.exceptionDetail.tempOptions = data.re.options;

    data.re.area.forEach(function(cities){
      cities.cityList[0].districtList.forEach(function(item){
        if (item.isSelected === true){
          sc.selectedCities.push(item.city);
        }
      });
    });
  };

  sc.getExceptionDetail = function getExceptionDetail(){
    var ajaxUrl = 'admin/servicer/getDetail';
    var qData = { 
      srid : sc.srid,
      srsid : sc.srsid,
      name : sc.exceptionDetailInfo.name
    };

    ycsApi.post(ajaxUrl, qData, sc.renderExceptionDetail);
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
      checkAll: false
    });
  };

  sc.addAvailableCity = function addAvailableCity(){
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/vendor/addSupportArea.html',
      size: 'md',
      controller:'selectVendorSupportAreaCtrl',
      backdrop: 'static',
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

  sc.dataSaved = function dataSaved(data){
    // 处理添加例外写入数据库延迟
    $timeout(function(){
      $modalInstance.close(exceptionDetailInfo);
    }, 500);
  };

  sc.save = function save(exceptionDetail){
    var result = '';
    var ajaxUrl = 'admin/servicer/addSpecial';
    
    result += sc.selectedCities.join(',');
    
    var qData = exceptionDetail;
        qData.addCitys = result;
        qData.srsid = sc.srsid;
        qData.siid = sc.siid;
        qData.srid = sc.srid;
        qData.options = {};

    if(sc.exceptionDetailInfo.func === 'add'){
      qData.addOrEdit = 'add';
    } else {
      qData.addOrEdit = 'edit';
    }

    qData.remark = qData.advantage && qData.advantage.length > 0 ? qData.advantage : '';

    if (exceptionDetail.tempOptions && exceptionDetail.tempOptions.length > 0) {
      var tempOption = {};
          tempOption.list = exceptionDetail.tempOptions;
      qData.options = angular.toJson(tempOption);
    } else {
      delete qData.options;
    }

    delete qData.id;

    ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };

 
  // Add New
  if (sc.exceptionDetailInfo.func === 'add'){
    sc.getOptions();

  // Edit
  } else {
    sc.getExceptionDetail();
  }

  sc.getSupportedArea();

}]);

app.controller('selectVendorSupportAreaCtrl', ['$scope', 'areaInfo', '$modalInstance', 'ycsUtil', function(sc, areaInfo, $modalInstance, ycsUtil){
  sc.areaInfo = areaInfo;

  sc.ok = function ok () {
    $modalInstance.close(areaInfo);
  };

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

}]);

})(window.angular);