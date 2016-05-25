(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('helpCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal) {
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
        sc.toggleSelection(row.entity.id);
      });
      gridApi.selection.on.rowSelectionChangedBatch(sc,function(rows){
        rows.forEach(function(item){
          sc.toggleSelection(item.entity.id);
        });
      });
    },
    columnDefs: [
      {
        field: 'id',
        displayName: 'ID',
        width: 100,
        type: 'number',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'id',
        displayName: '操作',
        width: 80,
        enableHiding: false,
        enableSorting: false,
        enableFiltering: false,
        enableColumnMenu: false,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        cellTemplate: '<div class="ui-grid-cell-contents"><a ui-sref="cms.help.edit({helpId: COL_FIELD})">编辑</a></div>'
        //cellTemplate: '<div class="ui-grid-cell-contents"><a ui-sref="cms.help.edit({helpId: COL_FIELD})">编辑</a>　<a>预览</a></div>'
      },
      {
        field: 'title',
        displayName: '帮助标题',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'category',
        displayName: '帮助分类',
        filter: {
          placeholder: '搜索...'
        },
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
        width: 100,
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ { value: '0', label: '未完成编辑' }, { value: '4', label: '显示中'}, { value: '6', label: '已隐藏' }, { value: '8', label: '已删除' }]
        },
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableHiding: false,
        cellTemplate:'<div class="ui-grid-cell-contents"><span class="draft" ng-if="COL_FIELD === 0">未完成编辑</span><span class="show" ng-if="COL_FIELD === 4">显示中</span><span class="is-hidden" ng-if="COL_FIELD === 6">已隐藏</span><span class="deleted" ng-if="COL_FIELD === 8">已删除</span></div>'
      },
      {
        field: 'visits',
        displayName: '阅读',
        type: 'number',
        width: 120,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'useful',
        displayName: '有帮助',
        type: 'number',
        width: 100,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'useless',
        displayName: '没有帮助',
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

  sc.clearAll = function clearAll (){
    sc.gridApi.selection.clearSelectedRows();
    sc.tempArray = [];
    sc.isEditStatus = false;
  };

  sc.startToEditStatus = function startToEditStatus(){
    sc.isEditStatus = true;
  };

  sc.editStatus = function editStatus (num){
    var ajaxUrl = 'admin/help/editBatchHelpArticle';
    var qData = {
      ids: sc.tempArray.join(','),
      status: Number(num),
      tag: ''
    };

    ycsApi.post(ajaxUrl, qData, sc.getExistingData);
  };

  sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;

    var ajaxUrl = 'admin/help/qryHelpList';
    var qData = {
      pageSize: 999999
    };
    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  };  

  sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.helplists;
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
            ajaxUrl: 'admin/help/editBatchHelpArticle',
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

})(window.angular);