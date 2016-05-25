(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('feedCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal) {
  sc.tempArray = [];

  sc.loadingGrid = true;

  sc.uploadBtnDisabled = false;

  sc.csv = {};

  sc.toggleSelection = function toggleSelection(id) {
    var selectedIndex = sc.tempArray.indexOf(id);
    if (selectedIndex === -1){
      sc.tempArray.push(id);
    } else {
      sc.tempArray.splice(selectedIndex, 1);
    }
  };

  sc.gridOptions = {
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
        field: 'title',
        displayName: '文章标题',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'webname',
        displayName: '采集网站',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'sourcename',
        displayName: '来源',
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
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ { value: '0', label: '未入库' }, { value: '1', label: '已入库' }, { value: '4', label: '已删除'}]
        },
        width: 100,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableHiding: false,
        cellTemplate:'<div class="ui-grid-cell-contents"><span class="intact" ng-if="COL_FIELD === 0">未入库</span><span class="imported" ng-if="COL_FIELD === 1">已入库</span><span class="deleted" ng-if="COL_FIELD === 4">已删除</span></div>'
      },
      {
        field: 'created',
        displayName: '导入时间',
        width: 150,
        headerCellClass: 'text-center',
        cellClass:'text-center time',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'tag',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false,
        displayName: '原文关键字/标签',
      }
      // {
      //   field: 'id',
      //   displayName: '操作',
      //   cellTemplate: '<div class="ui-grid-cell-contents"><a>查看采集结果</a></div>'
      // }
    ]
  };

  sc.addToDatabase = function addToDatabase(){
    var ajaxUrl = 'admin/gather/storage';
    var qData = {
      ids : sc.tempArray.join(',')
    };

    ycsApi.post(ajaxUrl, qData, sc.getExistingData);
  };

  sc.deleteData = function deleteData(){
    var ajaxUrl = 'admin/gather/delete';
    var qData = {
      ids : sc.tempArray.join(',')
    };

    ycsApi.post(ajaxUrl, qData, sc.getExistingData);
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

  sc.csvImportErr = function csvImportErr(errObj) {
    ycsUtil.disableButton(sc, false);

    if (errObj && errObj.errormsg && errObj.errorcode){
      Notification.error({message: errObj.errormsg, title: 'ERROR: '+ errObj.errorcode, delay: 5000});
    } else {
      Notification.error({message: 'ERROR: '+ errObj.errormsg, delay: 5000});
    }
  };

  sc.importCSV = function importCSV(file){
    var ajaxUrl = 'admin/csv/importArticle';
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

  sc.selectAll = function selectAll() {
    sc.gridApi.selection.selectAllRows();
  };

  sc.clearAll = function clearAll (){
    sc.gridApi.selection.clearSelectedRows();
    sc.tempArray = [];
  };

  sc.reverseSelection = function reverseSelection (){
    sc.gridApi.selection.toggleRowSelection();
    sc.gridOptions.data.forEach(function(item){
      sc.gridApi.selection.toggleRowSelection(item);
    });
  };

  sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.article;
    sc.gridApi.selection.clearSelectedRows();

    sc.loadingGrid = false;
  };

  sc.getExistingData = function getExistingData(){
    var ajaxUrl = 'admin/gather/getArticleList';
    var qData = {};
    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);

    sc.loadingGrid = true;
  };  

  sc.getExistingData();

}]);

})(window.angular);