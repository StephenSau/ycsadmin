(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('categoryCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', 'uiGridTreeViewConstants', function (sc, ycsUtil, ycsApi, Notification, $modal, uiGridTreeViewConstants) {
	sc.loadingGrid = true;

  sc.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    flatEntityAccess: true,
    showTreeExpandNoChildren: false,
    treeRowHeaderAlwaysVisible: false,
    columnDefs : [
      {
        field: 'name',
        name: '分类名称',
        filter: {
          placeholder: '搜索...'
        },
        cellTemplate: '<div class="ui-grid-cell-contents" ng-class="{bold: row.entity.pid === -1}">{{COL_FIELD}}</div>',
        enableHiding: false
      },
      {
        field: 'code',
        type: 'number',
        name: '编码',
        width: 100,
        filter: {
          placeholder: '搜索...'
        },
        cellClass:'text-center',
        headerCellClass: 'text-center',
        cellTemplate: '<div class="ui-grid-cell-contents" ng-class="{bold: row.entity.pid === -1}">{{COL_FIELD}}</div>',
        enableHiding: false
      },
      {
        field: 'tag',
        name: '绑定标签',
        filter: {
          placeholder: '搜索...'
        },
        cellTemplate: '<div class="ui-grid-cell-contents"><span ng-if="row.entity.pid !== -1">{{COL_FIELD}}</span><span ng-if="row.entity.pid === -1">—</span></div>',
        enableHiding: false
      },
      {
        field: 'sort',
        type: 'number',
        name: '排序',
        width: 80,
        enableFiltering: false,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        cellTemplate: '<div class="ui-grid-cell-contents" ng-class="{bold: row.entity.pid === -1}">{{COL_FIELD}}</div>',
        enableHiding: false
      },
      {
        field: 'func',
        name: '操作',
        width: 200,
        enableColumnMenu: false,
        enableHiding: false,
        enableFiltering: false,
        headerCellClass: 'text-center',
        cellClass:'text-center',
        cellTemplate: '<div class="ui-grid-cell-contents func"><a ng-if="row.entity.pid === -1" ng-click="grid.appScope.editSubCategory(\'\', \'add\')">增加子类</a><a ng-if="row.entity.pid !== -1" ng-click="grid.appScope.editSubCategory(row.entity.id, \'edit\')">编辑</a><a ng-if="row.entity.pid === -1" ng-click="grid.appScope.editCategory(row.entity.id, edit)">编辑</a><a class="link-delete" ng-click="grid.appScope.delCategory(row.entity.id)">删除</a></div>'
      }
    ],
    onRegisterApi : function(gridApi){
      sc.gridApi = gridApi;
    }
	};

  sc.expandAll = function expandAll(){
    sc.gridApi.treeBase.expandAllRows();
  };

  sc.collapseAll = function collapseAllRows(){
    sc.gridApi.treeBase.collapseAllRows();
  };
 
  sc.toggleRow = function toggleRow( rowNum ){
    sc.gridApi.treeBase.toggleRowTreeState(sc.gridApi.grid.renderContainers.body.visibleRowCache[rowNum]);
  };
 
  sc.toggleExpandNoChildren = function toggleExpandNoChildren(){
    sc.gridOptions.showTreeExpandNoChildren = !sc.gridOptions.showTreeExpandNoChildren;
    sc.gridApi.grid.refresh();
  };

	sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;
  	var ajaxUrl = 'admin/tag/qryParentSubSvicCategory';
  	var qData = {};
  	ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
	};

  sc.editCategory = function editCategory (id, func) {
    var targetData;

    for (var i = 0; i < sc.allCateData.length; i++ ){
      if (sc.allCateData[i].id === id){
        targetData = angular.copy(sc.allCateData[i], []);
        break;
      }
    }

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/system/editCategory.html',
      size: 'md',
      controller: 'editCategoryModalCtrl',
      backdrop: 'static',
      resolve: {
        categoryInfo: function() {
          return {
            func: func,
            id: id,
            data: targetData
          };
        }
      }
    });

    modalInstance.result.then(function (categoryInfo){
      sc.getExistingData();
    });
  };

	sc.fillExitingData = function fillExitingData(data){
    var cateData = data.re.serviceParentSubCategoryList;

    var _cateData = [];

    sc.allCateData = [];

    for (var i = 0; i < cateData.length; i++){
      var base = 1000 + i * 1000;

      _cateData[base] = cateData[i];
      _cateData[base].$$treeLevel = 0;

      sc.allCateData.push(cateData[i]);

      var subList = cateData[i].subServiceList;

      for (var j = 0; j < subList.length; j++){
        var subBase = base + j + 1;
        _cateData[subBase] = subList[j];
        _cateData[subBase].$$treeLevel = 1;

        sc.allCateData.push(subList[j]);
      }
    }

    sc.tempArray = [];

    data.re.serviceParentSubCategoryList.forEach(function(detail, cIndex){
      sc.tempArray.push({
        value : detail.id,
        label : detail.name
      });
    });

    sc.gridOptions.data = _cateData;

    sc.loadingGrid = false;

    // console.dir(_cateData);
  };

  sc.editSubCategory = function editSubCategory(id, func){
    var targetData;

    for (var i = 0; i < sc.allCateData.length; i++ ){
      if (sc.allCateData[i].id === id){
        targetData = angular.copy(sc.allCateData[i], []);
        break;
      }
    }

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/system/editSubCategory.html',
      size: 'md',
      controller: 'editSubCategoryModalCtrl',
      backdrop: 'static',
      resolve: {
        subCategoryInfo: function() {
          return {
            func: func,
            data: targetData,
            nameOpts: sc.tempArray
          };
        }
      }
    });

    modalInstance.result.then(function (subCategoryInfo){
      sc.getExistingData();
    });
  };

  sc.expandAllRows = function expandAllRows() {
    sc.gridApi.expandable.expandAllRows();
  };

  sc.collapseAllRows = function collapseAllRows() {
    sc.gridApi.expandable.collapseAllRows();
  };

  sc.delCategory = function delCategory(id){
    var ajaxUrl = 'admin/tag/deleteServiceCategory';
    var qData = {
      ids : id
    };

    ycsApi.post(ajaxUrl, qData, sc.getExistingData);

  };

  sc.getExistingData();
}]);

app.controller('editCategoryModalCtrl', ['$scope', 'categoryInfo', '$modalInstance', 'ycsApi', 'Notification', function(sc, categoryInfo, $modalInstance, ycsApi, Notification){

  sc.categoryInfo = categoryInfo;

  sc.isEdit = false;

  if ( categoryInfo.func === 'add' ){
    sc.detail = [];

  } else {
    sc.isEdit = true;
    sc.detail = angular.extend({}, categoryInfo.data);
  }

  sc.dataSaved = function dataSaved(){
    Notification.success('保存成功！');
    $modalInstance.close(categoryInfo);
  };

  sc.save = function save(detail){
    var ajaxUrl;
    var qData = detail;

    if ( !sc.isEdit ) {
      ajaxUrl = 'admin/tag/addServiceCategory';

    } else {
      ajaxUrl = 'admin/tag/updateServiceCategory';
    }
    
    ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };
}]);

app.controller('editSubCategoryModalCtrl', ['$scope', 'subCategoryInfo', '$modalInstance', 'ycsApi', 'ycsUtil', 'Notification', '$filter', function(sc, subCategoryInfo, $modalInstance, ycsApi, ycsUtil, Notification, $filter){

  sc.subCategoryInfo = subCategoryInfo;

  sc.isEdit = false;

  if ( subCategoryInfo.func === 'add' ){
    sc.detail = [];

  } else {
    sc.isEdit = true;
    sc.detail = angular.extend({}, subCategoryInfo.data);
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

  sc.dataSaved = function dataSaved(){
    Notification.success('保存成功！');
    $modalInstance.close(subCategoryInfo);
  };

  sc.save = function save(detail){
    var ajaxUrl = 'admin/tag/updateServiceCategory';
    var qData = detail;

    qData.tag = '';

    qData.tagsInput.forEach(function(tag, tIndex){
      qData.tag += ((tIndex > 0 ? ',' : '') + tag.text);
    });
    
    ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
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

  sc.getAllTags();
}]);

})(window.angular);