(function(angular, N){

'use strict';

var app = angular.module('backendApp');

app.factory('ycsUtil', ['appSettings', 'fsErrorCode', 'ycsApi', 'Notification', '$interval', '$timeout', function(appSettings, fsErrorCode, ycsApi, Notification, $interval, $timeout){

  var utilFactory = {};

  utilFactory.spliter = function utilSpliter(string, splitMark){
    return string.split(splitMark);
  };

  // UTIL SORTING: Sort Array according to its child items' parameter
  // - target: target Array, with items in Object form
  // - parameter: perform sorting with the providing parameter
  // - sortDesc: if is set `true` sort in desc. Default to `false` (asc).
  utilFactory.sortByObjParameter = function sortByObjParameter(target, parameter, sortDesc){
    if (!target || target.length < 1){
      window.console.warn('utilFactory.sortByObjParamete: `target` mush be an array');
      return target;
    } else if (!parameter || String(parameter).trim() === ''){
      window.console.warn('utilFactory.sortByObjParamete: Please provide a proper `parameter`');
      return target;
    }

    if (sortDesc) {
      target.sort(function(left, right){
        return right[parameter] - left[parameter];
      });
    } else {
      target.sort(function(left, right){
        return left[parameter] - right[parameter];
      });
    }

    return target;
  };

  utilFactory.getAreaLabelByCode = function getAreaLabelByCode (code, divider) {
    if (!code || code < 100000 || code > 999999){return;}

    var provinceCode = ~~(code / 10000) * 10000;
    var cityCode = ~~(code / 100) * 100;

    var provinceOnly = (code % 10000 === 0),
        cityOnly = (code % 100 === 0);

    var result = '';
    divider = divider || '';

    var provinces = N.Lib.Address;

    for (var i = 0; i < provinces.length; i++){
      if (provinces[i].c === provinceCode){
        result += provinces[i].n;

        if (provinceOnly) { return result;}

        var cities = provinces[i].s;

        for (var j = 0; j < cities.length; j++){
          if (cities[j].c === cityCode){

            result += (divider + cities[j].n);

            if (cityOnly) { return result;}

            var districts = cities[j].s;

            for (var k = 0; k < districts.length; k++){
              if (districts[k].c === code){
                result += (divider + districts[k].n);
                return result;
              }
            }
          }
        }
      }
    }

    return result;
  };

  // DISABLE BUTTON
  // Set upload button disabled, responsable to sc.uploadBtnDisabled by default
  utilFactory.disableButton = function disableTargetButton(sc, goDisabled, specifyName){
    if (!sc){ return; }

    var target = (specifyName && specifyName.length > 0) ? specifyName : 'uploadBtnDisabled';
    if (goDisabled) {
      sc[target] = true;
    } else {
      sc[target] = false;
    }
  };

  // Util Stop looping uploading progress when there's a FS Error
  utilFactory.isFileError = function isFileError(intervalID, sc, specifyName, errObj){
    if (fsErrorCode[errObj.errorcode] && fsErrorCode[errObj.errorcode].length > 0){
      Notification.error({message: fsErrorCode[errObj.errorcode], title: 'ERROR: '+ errObj.errorcode, delay: 5000});
    } else {
      Notification.error({message: 'ERROR:'+ errObj.errorcode, delay: 5000});
    }
    utilFactory.disableButton(sc, false, specifyName);
    $interval.cancel(intervalID);
  };

  // Util Image Upload Function
  utilFactory.loopCheckProgress = function loopCheckProgress(intervalID, cb, data){
    if (data && data.re && Number(data.re.progress) >= 100){
      $interval.cancel(intervalID);
      Notification.success('上传成功！');

      if (cb && typeof cb === 'function'){
        cb(data.re.url);
      } else {
        return data.re.url;
      }
    }
  };

  utilFactory.returnImageUrl = function returnImageUrl (timestampCode, cb, sc, specifyName){
    var resultUrl = 'qryUploadResult.htm?progressId=' + timestampCode;

    var uploadingInt = $interval(function(){
      ycsApi.postFS(resultUrl, {}, utilFactory.loopCheckProgress.bind(this, uploadingInt, cb), utilFactory.isFileError.bind(this, uploadingInt, sc, specifyName));
    }, 3000);
  };

  utilFactory.imageUploaded = function imageUploaded(data){
    // Placeholder for upload success
  };

  // IMAGE UPLOAD
  // - file: file object
  // - type: `type` requested by FS
  utilFactory.uploadImage = function uploadImage(file, type, cb, sc, specifyName){
    // 图片大小不能超过5M
    if (file.size > 5242880){
      Notification.error({title: '图片太大了！', message:'图片大小超过系统限制', delay: 5000});

      $timeout(function(){
        utilFactory.disableButton(sc, false, specifyName);
      }, 800);

      return;
    }

    // var timestampCode = String(type).toUpperCase() + ((new Date().valueOf()) + '' + ~~(10000 + Math.random() * 90000));
    var timestampCode = ((new Date().valueOf()) + '' + ~~(10000 + Math.random() * 90000));

    var ajaxUrl = 'upload.htm?progressId=' + timestampCode;

    var qData = {
      photo: file,
      type: type,
      browserVer: 'OTHER',
      domain: appSettings.fsHost,
      keepFileName: 0
    };

    // Post Upload Image
    ycsApi.postImage(ajaxUrl, qData, this.commonFileUploaded);

    // Check upload status every 3s
    this.returnImageUrl(timestampCode, cb, sc, specifyName);
  };


  // Util Common File Upload Function
  utilFactory.returnFileUrl = function returnFileUrl (timestampCode, cb){
    var resultUrl = 'qryUploadResult.htm?progressId=' + timestampCode;

    var uploadingInt = $interval(function(){
      ycsApi.postFS(resultUrl, {}, utilFactory.loopCheckProgress.bind(this, uploadingInt, cb));
    }, 3000);
  };

  utilFactory.commonFileUploaded = function commonFileUploaded(data){
    // Placeholder for upload success
  };

  // COMMON FILE UPLOAD
  // - file: file object
  // - type: `type` requested by FS
  utilFactory.uploadCommonFile = function uploadCommonFile(file, type, cb, sc, specifyName){
    // 文件大小不能超过5M
    if (file.size > 5242880){
      Notification.error({title: '文件太大了！', message:'文件大小超过系统限制', delay: 5000});

      $timeout(function(){
        utilFactory.disableButton(sc, false, specifyName);
      }, 800);
      
      return;
    }

    var timestampCode = ((new Date().valueOf()) + '' + ~~(10000 + Math.random() * 90000));

    var ajaxUrl = 'uploadFile.htm?progressId=' + timestampCode;

    var qData = {
      file: file,
      type: 'admcontract',
      subSavePath: 'vendorcontract',    // 子目录
      browserVer: 'OTHER',
      domain: appSettings.fsHost,
      keepFileName: 0
    };

    // Post Upload File
    ycsApi.postImage(ajaxUrl, qData, this.commonFileUploaded);

    // Check upload status every 3s
    if (cb && typeof cb === 'function'){
      this.returnFileUrl(timestampCode, cb);
    }
  };

  return utilFactory;
}]);

// OTHER COMMON FILE UPLOAD
// ONLY ALLOW SINGLE FILE UPLOAD
app.directive('commonFileUpload', function () {
  var directiveDefObj = {
    scope: true,
    link: function (sc, iElm, iAttrs, controller) {
      iElm.bind('change', function (event) {
        var inputIndex = event.target.getAttribute('input-index');
        var files = event.target.files;
        sc.$emit('commonFileSelected', files[0], inputIndex);
      });
    }
  };
  return directiveDefObj;
});


// IMAGE UPLOAD
app.directive('imageUpload', ['Notification', function (Notification) {
  var directiveDefObj = {
    scope: true,
    link: function (sc, iElm, iAttrs, controller) {
      iElm.bind('change', function (event) {
        var files = event.target.files;

        // Check limits
        sc.checkSize = function checkSize(file){
          // If no sizing limits
          if (!iAttrs.heightFixed && !iAttrs.widthFixed && !iAttrs.sizeMax && !iAttrs.widthMax && !iAttrs.heightMax){
            sc.$emit('imageSelected', file, event.target);
            return;
          }

          // If a sizeMax is proivied;
          if (iAttrs.sizeMax && Number(iAttrs.sizeMax) > 0){
            if (file.size > Number(iAttrs.sizeMax) * 1048576) {
              Notification.warning({title: '图片太大了！', message: '你上传的图片大小超过了系统要求的 ' + iAttrs.sizeMax + 'M，请重新选择', delay: 5000 });
              return;
            }
          }

          var _URL, img;

          // If no restriction for width and height
          if (!iAttrs.heightFixed && !iAttrs.widthFixed && !iAttrs.widthMax && !iAttrs.heightMax) {
            sc.$emit('imageSelected', file, event.target);
            return;

          // If width and height is restricted
          } else if (iAttrs.heightFixed || iAttrs.widthFixed) {
            var sizeLimit = {
              w: Number(iAttrs.widthFixed), 
              h: Number(iAttrs.heightFixed)
            };

            _URL = window.URL || window.webkitURL;
            img = new Image();
                img.onload = function () {
                  if (this.width !== sizeLimit.w && this.height !== sizeLimit.h){
                    Notification.warning({title: '图片尺寸不符', message: '你上传的图片尺寸（'+ this.width + 'x' + this.height + '）与系统要求不符，请重新选择', delay: 5000});
                  } else {
                    sc.$emit('imageSelected', file, event.target);
                  }
                };
                img.src = _URL.createObjectURL(file);

          // If max-width or max-height is set
          } else if (iAttrs.widthMax || iAttrs.heightMax) {
            var maxSize = {
              w: Number(iAttrs.widthMax), 
              h: Number(iAttrs.heightMax)
            };

            _URL = window.URL || window.webkitURL;
            img = new Image();
                img.onload = function () {
                  if (this.width > maxSize.w || this.height > maxSize.h){
                    Notification.warning({title: '图片尺寸过大', message: '你上传的图片尺寸（'+ this.width + 'x' + this.height + '）超过了系统要求，请重新选择', delay: 5000});
                  } else {
                    sc.$emit('imageSelected', file, event.target);
                  }
                };
                img.src = _URL.createObjectURL(file);

          // Unknow sizing error
          } else {
            window.console.log('Image file error');
          }

        };

        sc.checkSize(files[0]);
      });
    }
  };
  return directiveDefObj;
}]);

// WORK WITH `imagePreview` DIRECTIVE FROM BELOW
app.directive('fileUpload', function () {
  var directiveDefObj = {
    scope: true,
    link: function (sc, iElm, iAttrs, controller) {
      iElm.bind('change', function (event) {
        var files = event.target.files;
        var bulk = [];
        for (var i = 0; i < files.length; i++) {
          bulk.push(files[i]);
        }
        sc.$emit('fileSelected', bulk);
      });
    }
  };
  return directiveDefObj;
});

// WORK WITH THE ABOVE `fileUpload` DIRECTIVE
// USES sc.img.previews
app.directive('imagePreview', function($timeout){
  var directiveDefObj = {
    restrict: 'EA',
    link: function (sc, iElm, iAttrs, controller) {
      sc.readFile = function readFile (file, fIndex){
        var reader = new FileReader();
        reader.onload = function (event) {
          sc.img.previews[fIndex] = {
            fileIndex: fIndex,
            imgDataURI: event.target.result
          };
        };
        reader.readAsDataURL(file);
      };

      sc.$on('sentToPreview', function (event, files, reset){
        if (!files){ return; }

        if (files.length === 0){
          sc.img.previews = [];
        } else if (reset && sc.img && sc.img.previews && sc.img.previews.length > 0 && files.length < sc.img.previews.length){
          sc.img.previews.splice(files.length - 1, sc.img.previews.length - files.length);
        }

        for(var i = 0; i < files.length; i++) {
          sc.readFile(files[i], i);
        }

        $timeout(function(){
          sc.$apply();
        }, 1000);
      });
    }
  };
  return directiveDefObj;
});

// ALTERNATIVE FILE UPLOAD
// ONLY ALLOW SINGLE FILE UPLOAD
app.directive('alterFileUpload', function () {
  var directiveDefObj = {
    scope: true,
    link: function (sc, iElm, iAttrs, controller) {
      iElm.bind('change', function (event) {
        var files = event.target.files;
        sc.$emit('alterfileSelected', files[0]);
      });
    }
  };
  return directiveDefObj;
});

// WORK WITH THE ABOVE `alterFileUpload`
// USES sc.alterImg.preview
app.directive('alterImagePreview', function($timeout){
  var directiveDefObj = {
    restrict: 'EA',
    scope: true,
    link: function (sc, iElm, iAttrs, controller) {
      sc.readFile = function readFile (file){
        var reader = new FileReader();
        reader.onload = function (event) {
          sc.alterImg.preview = {
            imgDataURI: event.target.result
          };
        };
        reader.readAsDataURL(file);
      };

      sc.$on('sentToAltPreview', function (event, file){
        if (!file){
          sc.alterImg.preview = {};
          return;
        }

        sc.readFile(file);

        $timeout(function(){
          sc.$apply();
        }, 1000);
      });
    }
  };
  return directiveDefObj;
});

app.directive('selectLocation', ['ycsApi', function(ycsApi){
  // Example
  // <select-location ng-model="certainCityCode"></select-location>

  var directiveDefObj = {
    name: 'init',
    require: '?ngModel',
    restrict: 'EA',
    templateUrl: 'tpl/util/select-location.html',
    scope: true,
    replace: true,
    link: function(sc, iElm, iAttrs, ngModelCtrl) {

      sc.provinceList = [];
      sc.cityList = [];
      sc.districtList = [];
      sc.provinceIndex = null;
      sc.cityIndex = null;
      sc.cityDisabled = true;

      sc.$watch('selectCity', function(cityIndex) {
        if (!sc.cityList || sc.cityList.length === 0) { return; }

        if (typeof cityIndex === 'number'){
          sc.cityCode = sc.cityList[cityIndex].code;
          sc.cityIndex = cityIndex;
          
          ngModelCtrl.$setViewValue(sc.cityCode);
        }

        sc.getDistrictOpts();
      });

      sc.inputName = '';
      iAttrs.$observe('inputName', function(targetInputName){
        sc.inputName = targetInputName;
      });

      // Init: grab province options
      sc.renderProvinceOpts = function renderProvinceOpts(data){
        sc.provinceList = [];

        N.Lib.Address.forEach(function(province, pIndex){
          sc.provinceList.push({
            name: province.n,
            code: province.c,
            index: pIndex
          });
        });
      };

      // Province select on-change
      sc.refreshCities = function refreshCities(){
        sc.selectCity = null;
        sc.cityIndex = null;
        sc.cityDisabled = true;
        sc.provinceIndex = sc.selectProvince;
        sc.renderCityOpts(sc.provinceIndex);
      };

      // Render city options
      sc.renderCityOpts = function renderCityOpts(provinceIndex){
        var selectedCities = [];
            selectedCities = N.Lib.Address[provinceIndex].s;

        sc.cityList = [];

        if (selectedCities.length > 0) {
          sc.cityDisabled = false;

          selectedCities.forEach(function(city, cIndex){
            sc.cityList.push({
              name: city.n,
              code: city.c,
              index: cIndex
            });
          });
        }
      };

      sc.getDistrictOpts = function getDistrictOpts(){
        sc.districtList = [];

        if ( typeof sc.provinceIndex !== 'number' || typeof sc.cityIndex !== 'number') {return;}

        var selectedDist = [];       
            selectedDist = N.Lib.Address[sc.provinceIndex]['s'][sc.cityIndex]['s'];
        
        selectedDist.forEach(function(dist, dIndex){
          sc.districtList.push({
            name: dist.n,
            code: dist.c,
            index: dIndex
          });
        });

      };

      // Grab existing ngModel value, if any
      ngModelCtrl.$render = function(){
        var cityCode = ngModelCtrl.$modelValue;

        var provinces = N.Lib.Address;
        var provinceCode = ~~(cityCode / 10000) * 10000;

        if (sc.provinceList.length === 0){
          sc.renderProvinceOpts();
        }

        for (var i = 0; i < provinces.length; i++){
          if (provinces[i].c === provinceCode){
            sc.selectProvince = i;
            sc.provinceIndex = i;

            sc.cityDisabled = false;
            sc.refreshCities();

            var cities = provinces[i].s;

            for (var j = 0; j < cities.length; j++){
              if (cities[j].c === cityCode){
                sc.selectCity = j;
                sc.cityIndex = j;
                return;
              }
            }

            return;
          }
        }
      };

      sc.renderProvinceOpts();
    }
  };

  return directiveDefObj;
}]);

app.directive('selectDistrict', ['ycsApi', function(ycsApi){
  // Example
  // <select-district ng-model="certainDistrictCode"></select-district>

  var directiveDefObj = {
    name: 'init',
    require: '?ngModel',
    restrict: 'EA',
    templateUrl: 'tpl/util/select-district.html',
    scope: true,
    replace: true,
    link: function(sc, iElm, iAttrs, ngModelCtrl) {

      sc.provinceList = [];
      sc.cityList = [];
      sc.districtList = [];
      sc.provinceIndex = null;
      sc.cityIndex = null;
      sc.districtIndex = null;
      sc.cityDisabled = true;
      sc.districtDisabled = true;

      sc.$watch('selectDistrict', function(districtIndex) {
        if (!sc.districtList || sc.districtList.length === 0) { return; }

        if (typeof districtIndex === 'number'){
          sc.districtCode = sc.districtList[districtIndex].code;
          sc.districtIndex = districtIndex;
          
          ngModelCtrl.$setViewValue(sc.districtCode);
        }
      });

      sc.inputName = '';
      iAttrs.$observe('inputName', function(targetInputName){
        sc.inputName = targetInputName;
      });

      // Init: grab province options
      sc.renderProvinceOpts = function renderProvinceOpts(data){
        sc.provinceList = [];

        N.Lib.Address.forEach(function(province, pIndex){
          sc.provinceList.push({
            name: province.n,
            code: province.c,
            index: pIndex
          });
        });
      };

      // Province select on-change
      sc.refreshCities = function refreshCities(){
        sc.selectCity = null;
        sc.cityIndex = null;
        sc.cityDisabled = true;
        sc.districtDisabled = true;
        sc.provinceIndex = sc.selectProvince;
        sc.renderCityOpts(sc.provinceIndex);

        sc.districtCode = sc.provinceList[sc.selectProvince].code;
        ngModelCtrl.$setViewValue(sc.districtCode);
      };

      sc.refreshDistricts = function refreshDistricts () {
        sc.selectDistrict = null;
        sc.districtDisabled = true;
        sc.districtIndex = null;
        sc.districtCode = null;
        sc.cityIndex = sc.selectCity;
        sc.getDistrictOpts();

        sc.districtCode = sc.cityList[sc.selectCity].code;
        ngModelCtrl.$setViewValue(sc.districtCode);
      };

      // Render city options
      sc.renderCityOpts = function renderCityOpts(provinceIndex){
        var selectedCities = [];
            selectedCities = N.Lib.Address[provinceIndex].s;

        sc.cityList = [];

        if (selectedCities.length > 0) {
          sc.cityDisabled = false;

          selectedCities.forEach(function(city, cIndex){
            sc.cityList.push({
              name: city.n,
              code: city.c,
              index: cIndex
            });
          });
        }
      };

      // Render district options
      sc.getDistrictOpts = function getDistrictOpts(){
        sc.districtList = [];

        if ( typeof sc.provinceIndex !== 'number' || typeof sc.cityIndex !== 'number') {return;}

        var selectedDist = [];       
            selectedDist = N.Lib.Address[sc.provinceIndex]['s'][sc.cityIndex]['s'];

        if (selectedDist.length > 0) {
          sc.districtDisabled = false;

          selectedDist.forEach(function(dist, dIndex){
            sc.districtList.push({
              name: dist.n,
              code: dist.c,
              index: dIndex
            });
          });
        }
      };

      // Grab existing ngModel value, if any
      ngModelCtrl.$render = function(){
        var districtCode = ngModelCtrl.$modelValue;

        // If Model value is not valid, clear all current selection
        if (isNaN(districtCode)){
          sc.selectProvince = null;
          sc.selectCity = null;
          sc.selectDistrict = null;

          sc.cityDisabled = true;
          sc.districtDisabled = true;

          delete sc.districtCode;
          return;
        }

        var provinces = N.Lib.Address;
        var provinceCode = ~~(districtCode / 10000) * 10000;
        var cityCode = ~~(districtCode / 100) * 100;

        var provinceOnly = (districtCode % 10000 === 0),
            cityOnly = (districtCode % 100 === 0);

        if (sc.provinceList.length === 0){
          sc.renderProvinceOpts();
        }

        for (var i = 0; i < provinces.length; i++){
          if (provinces[i].c === provinceCode){
            sc.selectProvince = i;
            sc.provinceIndex = i;

            sc.cityDisabled = false;
            sc.refreshCities();

            if (provinceOnly){ return; }

            var cities = provinces[i].s;

            for (var j = 0; j < cities.length; j++){
              if (cities[j].c === cityCode){
                sc.selectCity = j;
                sc.cityIndex = j;

                sc.districtDisabled = false;
                sc.refreshDistricts(sc.cityIndex);

                if (cityOnly) {return;}

                var districts = cities[j].s;

                for (var k = 0; k < districts.length; k++){
                  if (districts[k].c === districtCode){
                    sc.selectDistrict = k;
                    sc.districtIndex = k;

                    return;
                  }
                }

                return;
              }
            }

            return;
          }
        }
      };

      sc.renderProvinceOpts();
    }
  };

  return directiveDefObj;
}]);

app.directive('districtCheckboxes', ['ycsApi', function(ycsApi){
  // Example
  // <district-checkboxes city="someCityCode" ng-model="arrayFormVar" check-all="trueOrFalse"></district-checkboxes>
  // Whereas `someCityCode` should be numberic input like `440100`
  // And `arrayFormVar` should be an array containing distric codes like `[440114, 440117, 440118]`
  // If `check-all` equals "true", all boxes will set to checked by default

  var directiveDefObj = {
    name: 'init',
    require: '?ngModel',
    restrict: 'EA',
    templateUrl: 'tpl/util/district-checkboxes.html',
    scope: true,
    replace: true,
    link: function(sc, iElm, iAttrs, ngModelCtrl) {
      sc.districtList = [];
      sc.selectedDistricts = [];

      sc.city = null;
      iAttrs.$observe('city', function(currentCityCode){
        sc.city = currentCityCode;
        sc.getDistOpts(currentCityCode);
      });

      sc.checkAll = function checkAll(){
        sc.selectedDistricts = [];
        sc.districtList.forEach(function(dist){
          sc.selectedDistricts.push(dist.code);
        });

        ngModelCtrl.$setViewValue(sc.selectedDistricts);
      };

      sc.checkIfSelected = function checkIfSelected(inputCode){
        return sc.selectedDistricts.indexOf(inputCode) === -1 ? false : true;
      };

      sc.toggleSelection = function toggleSelection(dist) {
        var selectedIndex = sc.selectedDistricts.indexOf(dist.code);
        if (selectedIndex === -1){
          sc.selectedDistricts.push(dist.code);
        } else {
          sc.selectedDistricts.splice(selectedIndex, 1);
        }

        ngModelCtrl.$setViewValue(sc.selectedDistricts);
      };

      sc.getDistOpts = function getDistOpts(cityCode){
        cityCode = Number(cityCode);

        var provinceCode = ~~(cityCode / 10000) * 10000;
        sc.province = provinceCode;
        var provinces = N.Lib.Address;

        sc.districtList = [];

        for (var i = 0; i < provinces.length; i++){
          if (provinces[i].c === provinceCode){

            var cities = provinces[i].s;

            for (var j = 0; j < cities.length; j++){

              if (cities[j].c === cityCode){

                var districts = cities[j].s;

                for (var k = 0; k < districts.length; k++){
                  sc.districtList.push({
                    name: districts[k].n,
                    code: districts[k].c,
                    index: k
                  });
                }
              }
            }
          }
        }

        // If need to check all boxes by default
        if (iAttrs.checkAll === 'true'){
          sc.checkAll();
        }
      };

      // Grab existing ngModel value, if any
      ngModelCtrl.$render = function(){
        sc.selectedDistricts = ngModelCtrl.$modelValue;
      };

    }
  };

  return directiveDefObj;
}]);

})(window.angular, window.Neo);