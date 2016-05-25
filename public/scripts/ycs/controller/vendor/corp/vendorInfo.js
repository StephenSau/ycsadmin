(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('vendorInfoCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, Notification, $modal) {

  sc.certList = [];
  sc.photoList = [];

  sc.legalidcardUploadBtnDisabled = false;
  sc.licenceUploadBtnDisabled = false;
  sc.organizationUploadBtnDisabled = false;

  sc.fillExistingData = function fillExistingData(){
    var tempList;

    if (sc.qData.certificates && sc.qData.certificates.length > 0){
      tempList = ycsUtil.spliter(sc.qData.certificates, '|');
      tempList.forEach(function(item){
        if (item.length > 0){
          var itemBlock = ycsUtil.spliter(item, ',');
          sc.certList.push({
            text: itemBlock[0],
            image: itemBlock[1]
          });
        }
      });
    }

    if (sc.qData.photos && sc.qData.photos.length > 0){
      tempList = ycsUtil.spliter(sc.qData.photos, '|');
      tempList.forEach(function(item){
        if (item.length > 0){
          var itemBlock = ycsUtil.spliter(item, ',');
          sc.photoList.push({
            text: itemBlock[0],
            image: itemBlock[1]
          });
        }
      });
    }

  };

  sc.delPic = function delPic(index, type){
    if (type === 'certificate'){
      sc.certList.splice(index, 1);
    } else if (type === 'photo') {
      sc.photoList.splice(index, 1);
    }
    
  };

  sc.addImageWithTitle = function addImageWithTitle(target){
    var targetTitle;

    switch(target){
      case 'certificate':
        targetTitle = '资质证书';
        break;
      case 'photo':
        targetTitle = '实地环境';
        break;
      default:
        return;
    }

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/addPicsWithTitle.html',
      size: 'lg',
      controller: 'addVendorInfoImageWithTitleCtrl',
      backdrop: 'static',
      resolve: {
        picsInfo: function() {
          return {
            targetTitle: targetTitle,
            targetType: target,
            image: '',
            imageText: ''
          };
        }
      }
    });

    modalInstance.result.then(function (picsInfo){
      var item = {
        text: picsInfo.imageText,
        image: picsInfo.image
      };

      if (picsInfo.targetType === 'certificate'){
        sc.certList.push(item);
      } else if (picsInfo.targetType === 'photo'){
        sc.photoList.push(item);
      }

    });
  };

  sc.imageUploaded = function imageUploaded(targetId, data) {
    switch(targetId){
      case 'legalPersonId':
        sc.qData.legalidcard = data;
        ycsUtil.disableButton(sc, false, 'legalidcardUploadBtnDisabled');
        break;
      case 'corpLicence':
        sc.qData.licence = data;
        ycsUtil.disableButton(sc, false, 'licenceUploadBtnDisabled');
        break;
      case 'corpOrgCert':
        sc.qData.organization = data;
        ycsUtil.disableButton(sc, false, 'organizationUploadBtnDisabled');
        break;
      default:
        return;
    }
  };

  sc.uploadImage = function uploadImage(file, targetId) {
    ycsUtil.uploadImage(file, 'common', sc.imageUploaded.bind(this, targetId), sc);
  };

  sc.$on('imageSelected', function (event, file, target){
    sc.$apply(function () {
      sc.uploadImage(file, target.id);
      if(target.id === 'legalPersonId'){
        ycsUtil.disableButton(sc, true, 'legalidcardUploadBtnDisabled');
      } else if(target.id === 'corpLicence'){
        ycsUtil.disableButton(sc, true, 'licenceUploadBtnDisabled');
      } else if(target.id === 'corpOrgCert'){
        ycsUtil.disableButton(sc, true, 'organizationUploadBtnDisabled');
      }
    });
  });

  sc.dataSaved = function dataSaved(){
    Notification.success('服务商信息保存成功！');
    sc.getExistingData();
  };

  sc.save = function save(detail){
    var ajaxUrl = 'admin/servicer/modifyServicerLegalInfo';
    var qData = detail;

    var result;

    if (sc.certList.length > 0){
      result = '';
      sc.certList.forEach(function(cert, cIndex){
        result += (cIndex > 0 ? '|' : '') + (cert.text + ',' + cert.image);
      });

      qData.certificates = result;
    } else {
      qData.certificates = '';
    }

    if (sc.photoList.length > 0){
      result = '';
      sc.photoList.forEach(function(photo, cIndex){
        result += (cIndex > 0 ? '|' : '') + (photo.text + ',' + photo.image);
      });

      qData.photos = result;
    } else {
      qData.photos = '';
    }

    ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };

  sc.fillExistingData();

}]);


// Modal: 服务商-带标题的图片
app.controller('addVendorInfoImageWithTitleCtrl', ['$scope', 'picsInfo', '$modalInstance', 'ycsApi', 'ycsUtil', 'Notification', function(sc, picsInfo, $modalInstance, ycsApi, ycsUtil, Notification){
  sc.picsInfo = picsInfo;

  sc.uploadBtnDisabled = false;

  sc.imageUploaded = function imageUploaded(data){
    sc.picsInfo.image = data;
    ycsUtil.disableButton(sc, false);
  };

  sc.uploadImage = function uploadImage(file){
    ycsUtil.uploadImage(file, 'serlicense', sc.imageUploaded, sc);
  };

  sc.$on('imageSelected', function (event, file, target){
    sc.$apply(function () {
      sc.uploadImage(file);
      ycsUtil.disableButton(sc, true);
    });
  });

  sc.save = function save(picsInfo){
    $modalInstance.close(picsInfo);
  };

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };
}]);

})(window.angular);