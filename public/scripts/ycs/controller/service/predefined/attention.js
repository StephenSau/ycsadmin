(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('attentionCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, Notification, $modal) {
  sc.loadingGrid = true;

  sc.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    flatEntityAccess: true,
    onRegisterApi: function(gridApi){
      sc.gridApi = gridApi;
    },
    columnDefs: [
      {
        field: 'id',
        displayName: '操作',
        width: 80,
        enableHiding: false,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.editData(COL_FIELD, \'edit\')">编辑</a></div>',
        enableSorting: false,
        enableFiltering: false
      },
      {
        field: 'name',
        displayName: '注意事项标题',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'description',
        displayName: '注意事项正文',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false,
        enableSorting: false
      },
      {
        field: 'tag',
        displayName: '标签',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'sort',
        displayName: '排序',
        width: 100,
        type: 'number',
        enableHiding: false,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableFiltering: false
      }
    ]
  };

  sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.tabList;
    sc.loadingGrid = false;
  };

  sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;

    var ajaxUrl = 'admin/specdefine/specdefineList';
    var qData = { pid : 5};
    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  };  

  sc.openModal = function openModal (id, func, data) {
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/predefinded/editWithTag.html',
      size: 'lg',
      controller: 'attentionModalCtrl',
      backdrop: 'static',
      resolve: {
        predefInfo: function() {
          return {
            id: id,
            func: func,
            data: data.re || {}
          };
        }
      }
    });

    modalInstance.result.then(function (predefInfo){
      sc.getExistingData();
    });
  };  

  sc.editData = function editData (id, func) {
    if (func === 'edit'){
      var ajaxUrl = 'admin/specdefine/specdefineById';
      var qData = {specdefineid: id};

      ycsApi.post(ajaxUrl, qData, sc.openModal.bind(this, id, func));

    } else {
      sc.openModal(null, 'add', {});
    }
  };

  sc.getExistingData();

}]);


// Modal: 注意事项
app.controller('attentionModalCtrl', ['$scope', 'predefInfo', '$modalInstance', 'ycsApi', 'ycsUtil', 'Notification', '$filter', function(sc, predefInfo, $modalInstance, ycsApi, ycsUtil, Notification, $filter){
  sc.predefInfo = predefInfo;

  sc.isEdit = false;
  sc.title = 'attention';

  sc.tagList = [];

  if ( predefInfo.func === 'add' ){
    sc.detail = {};
    sc.detail.tagsInput = [];

  } else {
    sc.isEdit = true;
    sc.detail = angular.extend({}, predefInfo.data);

    sc.detail.tagsInput = [];

    if (sc.detail.tag && sc.detail.tag.length > 0){

      var tempList = ycsUtil.spliter(sc.detail.tag, ',');

      tempList.forEach(function(tag){
        if (tag.length > 0){
          sc.detail.tagsInput.push({text: tag});
        }
      });
    }
  }

  // ‘排序’预处理，避免和预留字段冲突
  sc.detail.itemSort = angular.isNumber(sc.detail.sort) && sc.detail.sort > 0 ? sc.detail.sort : 0;

  sc.dataSaved = function dataSaved(){
    Notification.success('保存成功！');
    $modalInstance.close(predefInfo);
  };

  sc.loadTags = function loadTags(query){
    return $filter('filter')(sc.tagList, {$: query});
  };

  sc.renderTagList = function renderTagList(data){
    sc.tagList = [];

    if (data.re && data.re.tags && data.re.tags.length > 0){
      data.re.tags.forEach(function(tag){
        sc.tagList.push({
          text: tag
        });
      });
    }
  };

  sc.getAllTags = function getAllTags(){
    var ajaxUrl = 'admin/tag/getAllTag';
    var qData = {};

    ycsApi.post(ajaxUrl, qData, sc.renderTagList);
  };

  sc.save = function save(detail){
    var ajaxUrl;
    var qData = detail;

    if ( !sc.isEdit ) {
      ajaxUrl = 'admin/specdefine/addSpecdefine';

    } else {
      ajaxUrl = 'admin/specdefine/editSpecdefine';
      qData.specdefineid = sc.detail.id;
    }

    qData.tag = '';

    detail.tagsInput.forEach(function(tag, tIndex){
      qData.tag += ((tIndex > 0 ? ',' : '') + tag.text);
    });

    qData.pid = 5;
    qData.type = 0;

    qData.sort = angular.isNumber(detail.itemSort) && detail.itemSort > 0 ? detail.itemSort : 0;

    ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

  sc.getAllTags();

}]);

})(window.angular);