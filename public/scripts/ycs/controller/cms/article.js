(function(angular, BASE64){

'use strict';

var app = angular.module('backendApp');

app.controller('articleCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', '$state', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal, $state) {
	sc.tempArray = [];
  sc.isEditStatus = false;
  sc.loadingGrid = true;

  sc.toggleSelection = function toggleSelection(id) {
    var selectedIndex = sc.tempArray.indexOf(id);
    if (selectedIndex === -1){
      sc.tempArray.push(id);
    } else {
      sc.tempArray.splice(selectedIndex, 1);
    }
  };

  sc.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    flatEntityAccess: true,
    onRegisterApi: function(gridApi){
      sc.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged(sc,function(row){
        sc.toggleSelection(row.entity.articleid);
      });
      gridApi.selection.on.rowSelectionChangedBatch(sc,function(rows){
        rows.forEach(function(item){
          sc.toggleSelection(item.entity.articleid);
        });
      });
    },
		columnDefs: [
      {
        field: 'articleid',
        displayName: 'ID',
        width: 100,
        type: 'number',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'articleid',
        displayName: '操作',
        width: 80,
        enableHiding: false,
        enableSorting: false,
        enableFiltering: false,
        enableColumnMenu: false,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        cellTemplate: '<div class="ui-grid-cell-contents"><a ui-sref="cms.article.edit({articleId: COL_FIELD})">编辑</a></div>'
        // cellTemplate: '<div class="ui-grid-cell-contents"><a ui-sref="cms.article.edit({articleId: COL_FIELD})">编辑</a>　<a>预览</a></div>'
      },
      {
        field: 'title',
        displayName: '文章标题',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'authorname',
        displayName: '作者',
        width: 120,
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'source',
        displayName: '来源',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'sourceurl',
        displayName: '原始链接',
        width: 80,
        cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{COL_FIELD}}" target="_blank" ng-if="COL_FIELD"><i class="fa fa-link"></i></a></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'username',
        displayName: '编辑',
        width: 100,
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'status',
        displayName: '状态',
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ { value: '0', label: '未完成编辑' }, { value: '2', label: '未发布' }, { value: '4', label: '已发布'}, { value: '6', label: '已撤稿'}, { value: '8', label: '已删除'}]
        },
        width: 100,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableHiding: false,
        cellTemplate:'<div class="ui-grid-cell-contents"><span class="draft" ng-if="COL_FIELD === 0">未完成编辑</span><span class="unpublished" ng-if="COL_FIELD === 2">未发布</span><span class="published" ng-if="COL_FIELD === 4">已发布</span><span class="withdraw" ng-if="COL_FIELD === 6">已撤稿</span><span class="deleted" ng-if="COL_FIELD === 8">已删除</span></div>'
      },
      {
        field: 'visits',
        displayName: '阅读数',
        type: 'number',
        width: 100,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'modified',
        displayName: '最后更新时间',
        width: 150,
        headerCellClass: 'text-center',
        cellClass:'text-center time',
        filter:{
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'tag',
        displayName: '标签',
        filter:{
          placeholder: '搜索...'
        },
        enableHiding: false
      }
    ]
	};

  sc.formatNumber = function formatNumber(num){
    var number = Number(num);
    return number;
  };

  sc.clearAll = function clearAll (){
    sc.gridApi.selection.clearSelectedRows();
    sc.tempArray = [];
    sc.isEditStatus = false;
  };

  sc.startToEditStatus = function startToEditStatus(){
    sc.isEditStatus = true;
  };

  sc.statusChanged = function statusChanged(data){
    Notification.success('已修改');
    sc.getExistingData();
  };

  sc.editStatus = function editStatus (num){
    var ajaxUrl = 'admin/info/infoEditStatus';
    var qData = {
      infoid: sc.tempArray.join(','),
      status: Number(num)
    };

    ycsApi.post(ajaxUrl, qData, sc.statusChanged);
  };

	sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;

  	var ajaxUrl = 'admin/article/getArticleList';
  	var qData = {
      pageSize: 999999
    };
  	ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
	};  

	sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.articleList;
    sc.gridApi.selection.clearSelectedRows();
    sc.isEditStatus = false;
    sc.tempArray = [];
    sc.loadingGrid = false;
  };

  // NEW: Compound tag input
  sc.addTagsCompound = function addTagsCompound(){
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/addTags.html',
      size: 'lg',
      backdrop: 'static',
      controller: 'tagsCompoundCtrl',
      resolve: {
        tagsCmpInfo: function() {
          return {
            currentSelected: [],
            ids: sc.tempArray,
            ajaxUrl: 'admin/info/infoEditTag',
            isBulkEdit: true
          };
        }
      }
    });

    modalInstance.result.then(function (tagsCmpInfo){
      Notification.success('标签已更新');
      sc.getExistingData();
    });
  };

  sc.getExistingData();
}]);

})(window.angular, window.BASE64);