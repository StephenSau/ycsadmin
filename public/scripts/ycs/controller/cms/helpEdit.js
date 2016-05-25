(function(angular, UE){

'use strict';

var app = angular.module('backendApp');

app.controller('helpEditCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', '$state', '$filter', '$sce', function (sc, ycsUtil, ycsApi, Notification, $modal, $state, $filter, $sce) {
	sc.sourceListOpts = [];

  sc.backToList = function backToList(){
    $state.go('cms.help');
  };

  sc.categoryListOpts = [
    {value: 10, label: '购买指南'},
    {value: 20, label: '订单相关'},
    {value: 30, label: '支付相关'},
    {value: 40, label: '服务及售后'},
    {value: 50, label: '账户管理'},
    {value: 60, label: '壹财税特色'},
    {value: 70, label: '服务商帮助'},
    {value: 80, label: '壹财税资讯'}
  ];

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
    code = code || sc.helpId;

    // Is new
    if (!code || code === 'new') {
      sc.fillExistingData();
      return;

    // Is edit
    } else {
      var ajaxUrl = 'admin/help/qryHelpArticleById';
      var qData = {
        id: sc.helpId
      };
      ycsApi.post(ajaxUrl, qData, sc.fillExistingData);
    }
  };  

  sc.fillExistingData = function fillExistingData(data){
    if (!data || !data.re) {
      sc.qData = {};
    } else {
      sc.qData = data.re;
    }

    sc.qData.tagsInput = [];
    
    if(sc.helpId !== 'new'){
      sc._ueditor.ueditorContent = sc.qData.content;

      if (sc.qData.tag && sc.qData.tag.length > 0){
        var tempList = ycsUtil.spliter(sc.qData.tag, ',');

        tempList.forEach(function(tag){
          if (tag.length > 0){
            sc.qData.tagsInput.push(tag);
          }
        });
      }

    }

  };

  sc.statusChanged = function statusChanged(){
    Notification.success('帮助状态已更新！');
    sc.getExistingData();
  };

  sc.changeStatus = function changeStatus(num, detail){
    var ajaxUrl = 'admin/help/editHelpArticle';
    var qData = angular.copy(detail, {});

    qData.status = Number(num);

    qData.tag = detail.tagsInput.join(',');

    qData.content = sc._ueditor.ueditorContent;

    ycsApi.post(ajaxUrl, qData, sc.statusChanged);
  };

  sc.dataSaved = function dataSaved(backToList, data){
    Notification.success('帮助保存成功！');

    sc.getExistingData();

    if (backToList){
      sc.backToList();
    }
  };

  sc.save = function save(detail, backToList){
  	var ajaxUrl;
    var qData = detail;

    if( sc.helpId === 'new'){
      ajaxUrl = 'admin/help/addHelpArticle';
      qData.status = 0;
    } else {
      ajaxUrl = 'admin/help/editHelpArticle';
      qData.id = Number(sc.helpId);
    }
    
    qData.tag = detail.tagsInput.join(',');

    qData.content = sc._ueditor.ueditorContent;

    ycsApi.post(ajaxUrl, qData, sc.dataSaved.bind(this, backToList));
  };

  sc.getExistingData();

}]);

})(window.angular, window.UE);