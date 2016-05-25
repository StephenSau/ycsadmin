(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('seofeedCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal) {
  sc.tempArray = [];
  sc.isEditStatus = false;
  sc.loadingGrid = true;

  sc.uploadBtnDisabled = false;

  sc.toggleSelection = function toggleSelection(id) {
    var selectedIndex = sc.tempArray.indexOf(id);
    if (selectedIndex === -1){
      sc.tempArray.push(id);
    } else {
      sc.tempArray.splice(selectedIndex, 1);
    }
  };

  sc.csv = {};

  sc.gridOptions = {
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
        cellTemplate: '<div class="ui-grid-cell-contents"><a ui-sref="cms.seofeed.edit({articleId: COL_FIELD})">编辑</a></div>'
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
        enableHiding: false,
        enableFiltering: false
      },
      {
        field: 'username',
        displayName: '操作人',
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
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableHiding: false,
        enableSorting: false,
        enableFiltering: false,
        cellTemplate:'<div class="ui-grid-cell-contents"><span class="imported" ng-if="COL_FIELD === 4">已发布</span><span class="deleted" ng-if="COL_FIELD === 8">已删除</span></div>'
      },
      {
        field: 'tag',
        displayName: '标签',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false,
      }
    ]
  };

  sc.csvImported = function csvImported(data){
    // 部分数据导入失败
    if (data.re && data.re.unImpRow && data.re.unImpRow.length > 0){
      var result = '';

      data.re.unImpRow.forEach(function(row){
        result += ('第' + row.rownum + '行 ' + row.title + '\\n');
      });

      Notification.warning({title: '部分数据未能成功导入', message: result, delay: 8000});
    
    // 全部成功导入
    } else {
      Notification.success('数据已成功导入！');
      ycsUtil.disableButton(sc, false);
    }

    sc.csv = {};

    sc.getExistingData();
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
    var ajaxUrl = 'admin/article/batchDel4Seo';
    var qData = {
      ids: sc.tempArray.join(',')
      //status: Number(num)
    };

    ycsApi.post(ajaxUrl, qData, sc.statusChanged);
  };

  sc.csvImportErr = function csvImportErr(errObj) {
    ycsUtil.disableButton(sc, false);

    if (errObj && errObj.errormsg && errObj.errorcode){
      Notification.error({message: errObj.errormsg, title: 'ERROR: '+ errObj.errorcode, delay: 5000});
    } else {
      Notification.error({message: 'ERROR: '+ errObj.errormsg, delay: 5000});
    }
  };

  sc.importCSV = function importCSV(file){
    var ajaxUrl = 'admin/csv/importArticle4Seo';
    var qData = {
      file: file
    };

    ycsApi.postForm(ajaxUrl, qData, sc.csvImported, sc.csvImportErr);
  };

  sc.$on('commonFileSelected', function (event, file){
    sc.$apply(function () {
      sc.importCSV(file);
      ycsUtil.disableButton(sc, true);
    });
  });

  sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.articleList;
    sc.gridApi.selection.clearSelectedRows();
    sc.isEditStatus = false;
    sc.tempArray = [];
    sc.loadingGrid = false;
  };

  sc.getExistingData = function getExistingData(){
    var ajaxUrl = 'admin/article/getArticleList4Seo';
    var qData = {
      pageSize : 999999,
    };
    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);

    sc.loadingGrid = true;
  };  

  sc.getExistingData();

}]);

})(window.angular);