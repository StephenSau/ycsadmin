(function(angular, UE){

'use strict';

var app = angular.module('backendApp');

app.controller('serviceEditCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', '$filter', '$sce', '$state', function (sc, ycsUtil, ycsApi, Notification, $modal, $filter, $sce, $state) {

  sc.animationsEnabled = true;

  sc.qData = {};

  sc.backToList = function backToList(){
    $state.go('service.pack');
  };

  sc._ueditor = {
    ueditorConfig: {
      enableContextMenu: false
    },
    ueditorContent: '',
    ueditorHtml: ''
  };

  sc._ueditor.ready = function(editor){
    // Placeholder
  };

  sc._ueditor.updateHtml = function() {
    sc._ueditor.ueditorHtml = $sce.trustAsHtml(sc._ueditor.ueditorContent);
  };

  sc.editTags = function editTags(){
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/addTags.html',
      size: 'lg',
      backdrop: 'static',
      controller: 'tagsCompoundCtrl',
      resolve: {
        tagsCmpInfo: function() {
          return {
            currentSelected: sc.qData.tagsInput,
            isBulkEdit: false
          };
        }
      }
    });

    modalInstance.result.then(function (tagsCmpInfo){
      sc.qData.tagsInput = tagsCmpInfo.currentSelected;
    });
  };

  sc.fillExistingData = function fillExistingData(data){
  	if (!data || !data.re) {return;}

  	sc.qData = data.re;

    // 上架状态

    if (sc.serviceId === 'new'){
      sc.qData.status = 0;  // default to `不上架`
      sc.qData.serviceitem = [];
    }

    // TAGS

    sc.qData.tagsInput = [];

    if (sc.qData.tag && sc.qData.tag.length > 0){
      var tempList = ycsUtil.spliter(sc.qData.tag, ',');

      tempList.forEach(function(tag){
        if (tag.length > 0){
          sc.qData.tagsInput.push(tag);
        }
      });
    }

    // Current Service Item

  	sc.currentItem = sc.qData.serviceitem;

    sc.currentSelected = [];
    sc.currentSelectedNames = [];

    sc.newlyAdded = [];

  	sc.currentItem.forEach(function(serviceItem, itemIndex) {
  		sc.currentItem[itemIndex].si_opts = [];

      // 当前服务已包含的服务项
      sc.currentSelected.push(serviceItem.siid);
      sc.currentSelectedNames.push(serviceItem.siname);

  		var tempItems = ycsUtil.spliter(serviceItem.sioptions, '|');

  		// TEMP FIX FOR EXTRA `|`s
			tempItems.forEach(function(item){
				if (item.length > 0){
					sc.currentItem[itemIndex].si_opts.push(item);
				}
			});
  	});

    sc._ueditor.ueditorContent = sc.qData.description;
  };

  sc.removeItem = function removeItem(rowIndex, siid, siname) {
    sc.qData.serviceitem.splice(rowIndex, 1);

    var selectGroupIndex = sc.currentSelected.indexOf(siid);

    sc.currentSelected.splice(selectGroupIndex, 1);

    var selectNameIndex = sc.currentSelectedNames.indexOf(siname);

    sc.currentSelectedNames.splice(selectNameIndex, 1);
	};

  sc.getItemData = function getItemData(code){
  	code = code || sc.serviceId;

    // Is new
  	if (!code || code === 'new') {
      sc.fillExistingData({re:{}});
      return;

    // Is edit
    } else {
      var ajaxUrl = 'admin/service/queryServiceDetail';
      var qData = {
        serviceid: code
      };

      ycsApi.post(ajaxUrl, qData, sc.fillExistingData);
    }

  };	

	sc.editPics = function editPics () {
	  var modalInstance = $modal.open({
	    animation: true,
	    templateUrl: 'tpl/modal/addPics.html',
	    size: 'lg',
      controller: 'editPicModalCtrl',
      backdrop: 'static',
      resolve: {
        picsInfo: function() {
          return {
            serviceName: sc.qData.name,
            pics: angular.extend([], sc.qData.pics)
          };
        }
      }
	  });

    modalInstance.result.then(function (picsInfo){
      sc.qData.pics = picsInfo.pics;
    });
	};

  sc.serviceSaved = function serviceSaved(backToList, data){
    Notification.success('服务内容已成功保存！');

    if (backToList){
      sc.backToList();
    }
  };

  sc.save = function saveServicePack(detail, backToList){
		var ajaxUrl;
		var qData = detail;

		if ( sc.serviceId === 'new' ) {
			ajaxUrl = 'admin/service/addService';
		} else {
			ajaxUrl = 'admin/service/modifyService';
		}

    qData.tag = detail.tagsInput.join(',');

    qData.siids = sc.currentSelected.join(',');

    // Ueditor Content
    qData.description = sc._ueditor.ueditorContent;

		ycsApi.post(ajaxUrl, qData, sc.serviceSaved.bind(this, backToList));
	};

  sc.openServiceItemModal = function openServiceItemModal() {
    var before = angular.extend([], sc.currentSelectedNames);

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/serviceItemList.html',
      size: 'xl',
      controller: 'serviceItemModalCtrl',
      resolve: {
        selectedServiceItem: function() {
          return {
            currentSelected: sc.currentSelected,
            currentSelectedNames: sc.currentSelectedNames
          };
        }
      }
    });

    modalInstance.result.then(function (selectedServiceItem){
      var currentSelectedNames = selectedServiceItem.currentSelectedNames;
      var newNames = [];

      // Newly added
      currentSelectedNames.forEach(function(newName){
        if (before.indexOf(newName) === -1){
          sc.newlyAdded.push(newName);
        }
      });

      // Remove existing
      if (sc.qData.serviceitem && sc.qData.serviceitem.length < 1) {return;}

      var keep = [];
      var newBefore = [];

      sc.qData.serviceitem.forEach(function(oldItem){
        if (currentSelectedNames.indexOf(oldItem.siname) !== -1){
          keep.push(oldItem);
        }
      });

      sc.qData.serviceitem = keep;
    });
  };

	sc.getItemData();
}]);

// 添加服务项

app.controller('serviceItemModalCtrl', ['$scope', 'selectedServiceItem', '$modalInstance', 'ycsApi', function(sc, selectedServiceItem, $modalInstance, ycsApi){
  sc.selectedServiceItem = selectedServiceItem.currentSelected;
  sc.currentSelectedNames = selectedServiceItem.currentSelectedNames;

  sc.serviceItemList = [];
  sc.currentCataIndex = 0;

  sc.renderServiceItemList = function renderServiceItemList (data){
    sc.serviceItemList = data.re;
  };

  sc.loadServiceItemList = function loadServiceItemList () {
    var ajaxUrl = 'admin/serviceItem/serviceAll';
    var qData = {};

    ycsApi.post(ajaxUrl, qData, sc.renderServiceItemList);
  };

  sc.switchCategory = function switchCategory (index) {
    sc.currentCataIndex = index;
  };

  sc.checkIfSelected = function checkIfSelected(siid) {
    return sc.selectedServiceItem.indexOf(siid) !== -1 ? true : false;
  };

  sc.toggleSelected = function toggleSelected(siid, name){
    var arrayIndex = sc.selectedServiceItem.indexOf(siid);

    if (arrayIndex === -1){
      sc.selectedServiceItem.push(siid);
    } else {
      sc.selectedServiceItem.splice(arrayIndex, 1);
    }

    var nameIndex = sc.currentSelectedNames.indexOf(name);

    if (nameIndex === -1){
      sc.currentSelectedNames.push(name);
    } else {
      sc.currentSelectedNames.splice(nameIndex, 1);
    }
  };

  sc.ok = function ok () {
    $modalInstance.close(selectedServiceItem);
  };

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

  sc.loadServiceItemList();

}]);

// Modal: 添加图片

app.controller('editPicModalCtrl', ['$scope', 'picsInfo', '$modalInstance', 'ycsApi', 'ycsUtil', 'Notification', '$timeout', '$interval', function(sc, picsInfo, $modalInstance, ycsApi, ycsUtil, Notification, $timeout, $interval){
  sc.picsInfo = picsInfo;

  sc.pics = sc.picsInfo.pics;

  sc.tempPics = sc.pics;

  sc.uploadBtnDisabled = false;

  sc.setToCover = function setToCover (index) {
    var cover = sc.tempPics.splice(index,1);
    cover = cover.toString();
    sc.tempPics.unshift(cover);
    sc.pics = sc.tempPics;
  };

  sc.delPic = function delPic(index){
    sc.tempPics.splice(index, 1);
  };

  sc.imageUploaded = function imageUploaded(data) {
    sc.pics.push(data);
    ycsUtil.disableButton(sc, false);
  };

  sc.uploadImage = function uploadImage(file) {
    ycsUtil.uploadImage(file, 'serviceicon', sc.imageUploaded, sc);
  };

  sc.$on('imageSelected', function (event, file){
    sc.$apply(function () {
      sc.uploadImage(file);
      ycsUtil.disableButton(sc, true);
    });
  });

  sc.save = function save(pics) {
    picsInfo.pics = pics;
    $modalInstance.close(picsInfo);
  };

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

}]);

})(window.angular, window.UE);