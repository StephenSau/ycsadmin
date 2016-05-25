(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('tagCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', '$rootScope', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal, $rootScope) {
	sc.loadingGrid = true;

  sc.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    flatEntityAccess: true,
		columnDefs: [
      {
        field: 'name',
        displayName: '标签',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'typeid',
        displayName: '类型',
        width: 120,
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ { value: 1, label: '分类标签' }, { value: 2, label: '扩展标签' }, { value: 3, label: '一般标签' }]
        },
        cellClass:'text-center',
        headerCellClass: 'text-center',
        cellTemplate: '<div class="ui-grid-cell-contents"><span class="" ng-if="COL_FIELD === 1">分类标签</span><span class="" ng-if="COL_FIELD === 2">扩展标签</span><span class="" ng-if="COL_FIELD === 3">一般标签</span></div>',
        enableHiding: false
      },
      {
        field: 'id',
        displayName: '编辑',
        width: 80,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableFiltering: false,
        enableHiding: false,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.editData(COL_FIELD, edit)">编辑</a></div>'
      },
      {
        field: 'username',
        displayName: '添加人',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },

      {
        field: 'tag',
        displayName: '统计',
        enableColumnMenu: false,
        enableFiltering: false,
        enableHiding: false,
        cellTemplate: '<div class="ui-grid-cell-contents">服务({{row.entity.services}}), 文章({{row.entity.articles}}), 帮助({{row.entity.helps}})</div>'
      },
      {
        field: 'visits',
        displayName: '相关页面浏览量',
        width: 150,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        type: 'number',
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'created',
        displayName: '添加日期',
        width: 150,
        headerCellClass: 'text-center',
        cellClass:'text-center time',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'id',
        displayName: '操作',
        width: 80,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableFiltering: false,
        enableHiding: false,
        cellTemplate: '<div class="ui-grid-cell-contents"><a class="link-delete" ng-click="grid.appScope.delData(COL_FIELD)">删除</a></div>'
      },
    ]
	};

	sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;
  	var ajaxUrl = 'admin/tag/getTagList';
  	var qData = {};
  	ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
	};	

	sc.editData = function editData (id, func) {
		var targetData;

    var _list =  angular.extend([], sc.gridOptions.data);

    for (var i = 0; i < _list.length; i++){
      if (_list[i].id === id){
        targetData = angular.extend({}, _list[i]);
        break;
      }
    }

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/system/editTag.html',
      size: 'md',
      backdrop: 'static',
      controller: 'tagModalCtrl',
      resolve: {
        tagInfo: function() {
          return {
            func: func,
            id: id,
            data: targetData
          };
        }
      }
    });

    modalInstance.result.then(function (tagInfo){
      sc.getExistingData();
    });
  };

	sc.delData = function delData(id){
		var ajaxUrl = 'admin/tag/deleteTag';
  	var qData = {
  		id : id
  	};
  	ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
	};

	sc.fillExitingData = function fillExitingData(data){
		sc.gridOptions.data = data.re.list;
		sc.gridOptions.data.forEach(function(row, index){
    	row.sequence = index;
  	});
    sc.loadingGrid = false;
  };

  sc.getExistingData();
}]);

app.controller('tagModalCtrl', ['$scope', 'tagInfo', '$modalInstance', 'ycsApi', 'Notification', function(sc, tagInfo, $modalInstance, ycsApi, Notification){
	sc.tagInfo = tagInfo;

	sc.isEdit = false;

  sc.detail = [];

	sc.typeUnitOpts = [
    {value: 1, label: '分类标签'},
    {value: 2, label: '扩展标签'},
    {value: 3, label: '一般标签'}
  ];

	sc.dataSaved = function dataSaved(){
		Notification.success('保存成功！');
		$modalInstance.close(tagInfo);
	};

  sc.save = function save(detail){
  	var ajaxUrl;
  	var qData = detail;

  	if ( !sc.isEdit ) {
  		ajaxUrl = 'admin/tag/addTag';

  	} else {
  		ajaxUrl = 'admin/tag/editTag';
  	}
  	
  	ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };

	sc.cancel = function cancel () {
		$modalInstance.dismiss('cancel');
	};

  if ( tagInfo.func !== 'add' ){
    sc.isEdit = true;
    sc.detail = angular.extend({}, tagInfo.data);
  }
}]);

})(window.angular);