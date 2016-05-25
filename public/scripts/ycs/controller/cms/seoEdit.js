(function(angular, UE){

'use strict';

var app = angular.module('backendApp');

app.controller('seoEditCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', '$state', '$filter', '$sce', function (sc, ycsUtil, ycsApi, Notification, $modal, $state, $filter, $sce) {
	sc.sourceListOpts = [];
  sc.isSureToPost = false;
  sc.editTime = false;

  sc.uploadBtnDisabled = false;

  sc.backToList = function backToList(){
    $state.go('cms.seofeed');
  };

  sc._ueditor = {
    ueditorConfig: {
      enableContextMenu: false,
      maximumWords: 20000
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

  sc.imageUploaded = function imageUploaded(data) {
    sc.qData.image = data;
    ycsUtil.disableButton(sc, false);
  };

  sc.uploadImage = function uploadImage(file) {
    ycsUtil.uploadImage(file, 'infotxt', sc.imageUploaded, sc);
  };

  sc.$on('imageSelected', function (event, file){
    sc.$apply(function () {
      sc.uploadImage(file);
      ycsUtil.disableButton(sc, true);
    });
  });

  sc.deleteImage = function deleteImage(){
    delete sc.qData.image;
  };

  sc.clearTime = function clearTime(){
    delete sc.qData.postTime;
    sc.editPostTime(false);
  };

  sc.updateTime = function updateTime(){
    sc.qData.postTime = new Date();
  };

	sc.getSourceList = function getSourceList(){
  	var ajaxUrl = 'admin/info/sourceList';
  	var qData = {};
  	ycsApi.post(ajaxUrl, qData, sc.renderSourceList);
	};  

	sc.renderSourceList = function renderSourceList(data){
    sc.sourceList = data.re;

		var tempArray = [];

	  sc.sourceList.forEach(function(item){
	  	tempArray.push({
	  		value: item.id,
	  		label: item.name
	  	});
	  });

  	sc.sourceListOpts = tempArray;
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

  sc.getExistingData = function getExistingData(code){
    code = code || sc.articleId;

    // Is new
    if (!code || code === 'new') {
      sc.fillExistingData();
      return;

    // Is edit
    } else {
      var ajaxUrl = 'admin/article/getDetail4Seo';
      var qData = {
        id: sc.articleId
      };
      ycsApi.post(ajaxUrl, qData, sc.fillExistingData);
    }
  };  

  sc.fillExistingData = function fillExistingData(data){
    if (!data || !data.re) {
      sc.qData = {};
    } else {
      sc.qData = data.re.article;
    }

    sc.qData.tagsInput = [];

    if(sc.articleId !== 'new'){
      sc._ueditor.ueditorContent = sc.qData.content;

      if (sc.qData.tag && sc.qData.tag.length > 0){
        var tempList = ycsUtil.spliter(sc.qData.tag, ',');

        tempList.forEach(function(tag){
          if (tag.length > 0){
            sc.qData.tagsInput.push(tag);
          }
        });
      }

      if (sc.qData.image && sc.qData.image.length > 0){
        sc.qData.image = sc.qData.image[0];
      }

      if (sc.qData.status !== 4){
        sc.editTime = false;
      }

    }

  };

  sc.changePostStatus = function changePostStatus(status){
    sc.isSureToPost = status;
  };

  sc.editPostTime = function editPostTime(status) {
    if (status){
      sc.qData.postTime = new Date();
    }
    sc.editTime = status;
  };

  sc.statusChanged = function statusChanged(){
    Notification.success('文章状态已更新！');

    sc.getExistingData();
  };

  sc.changeStatus = function changeStatus(num, detail){
    var ajaxUrl = 'admin/article/updateArticle4Seo';
    var qData = angular.copy(detail, {});

    qData.status = num;

    qData.tag = detail.tagsInput.join(',');

    qData.content = sc._ueditor.ueditorContent;

    qData.id = Number(sc.articleId);

    if(detail.image && detail.image > 0){
      qData.image = detail.image.join(',');
    }

    if (Number(num) === 4){
      qData.isrealtime = 0;
    }

    ycsApi.post(ajaxUrl, qData, sc.statusChanged);
  };

  sc.articleDeleted = function articleDeleted(){
    Notification.success('文章已删除！');
    $state.go('cms.seofeed');
  };

  sc.deleteArticle = function deleteArticle(id){
    var ajaxUrl = 'admin/article/batchDel4Seo';
    var qData = {
      ids: Number(id)
    };

    ycsApi.post(ajaxUrl, qData, sc.articleDeleted);
  };

  sc.dataSaved = function dataSaved(backToList, data){
    Notification.success('文章保存成功！');

    sc.getExistingData();

    if (backToList){
      sc.backToList();
    }
  };

  sc.save = function save(detail, backToList){
  	var ajaxUrl;
    var qData = detail;

    if( sc.articleId === 'new'){
      ajaxUrl = 'admin/article/addArticle';
      qData.status = 0;
      qData.isrealtime = 0;
    
    } else {
      ajaxUrl = 'admin/article/updateArticle4Seo';
      qData.id = Number(sc.articleId);

      // isrealtime: 不用更新的时候不用传这个字段，传0代表当前时间；传1同时需要传发布时间

      if (detail.postTime) {
        qData.isrealtime = 1;
        qData.released = $filter('date')(detail.postTime, 'yyyy-MM-dd HH:mm:ss');
      } else {
        // qData.isrealtime = 0;
        delete qData.isrealtime;
        delete qData.released;
      }
    }

    if(detail.image && detail.image > 0){
      qData.image = detail.image.join(',');
    }
    
    qData.tag = detail.tagsInput.join(',');

    qData.content = sc._ueditor.ueditorContent;

    ycsApi.post(ajaxUrl, qData, sc.dataSaved.bind(this, backToList));
  };

  sc.getExistingData();

  sc.getSourceList();

}]);

})(window.angular, window.UE);