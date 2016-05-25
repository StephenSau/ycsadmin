(function(angular){

'use strict';

var app = angular.module('backendApp');

// Textarea Template
var textAreaTemplate = '<div><form name="inputForm"><textarea ng-class="\'colt\' + col.uid" ui-grid-editor ng-model="MODEL_COL_FIELD"></form></div>';

app.controller('specsCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal) {
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
        enableSorting: false,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.editData(COL_FIELD, \'edit\')">编辑</a></div>',
        enableFiltering: false
      },
      {
      	field: 'name',
      	displayName: '规格名称',
        filter: {
          placeholder: '搜索...'
        },
      	enableHiding: false
      },
      {
      	field: 'description',
      	displayName: '相关描述',
        filter: {
          placeholder: '搜索...'
        },
      	enableHiding: false,
      	enableSorting: false,
      	editableCellTemplate: textAreaTemplate
      },
      {
      	field: '_options',
      	displayName: '规格值及价格调整',
        filter: {
          placeholder: '搜索...'
        },
        cellClass:'preserve-format',
      	enableHiding: false,
      	enableSorting: false
      },
      {
      	field: 'type',
      	displayName: '允许多选',
      	width: 100,
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ { value: 1, label: '否' }, { value: 2, label: '是' }]
        },
      	enableHiding: false,
      	cellClass:'text-center',
      	headerCellClass: 'text-center',
      	cellTemplate:'<div class="ui-grid-cell-contents"><span class="is-true" ng-if="COL_FIELD === 2">是</span><span class="is-false" ng-if="COL_FIELD === 1">否</span></div>'
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

  sc.shapeOptionsCol = function shapeOptionsCol(){
    var rows = sc.gridOptions.data;

    if (rows.length === 0){ return; }

    rows.forEach(function(row){
      var optsArray = row.options.split('|');
      var _options = [];
      optsArray.forEach(function(opt){
        _options.push(opt.substr(opt.indexOf(',') + 1));
      });
      row._options = _options.join('\n');
    });
  };

	sc.fillExitingData = function fillExitingData(data){
		sc.gridOptions.data = data.re.tabList;
    sc.shapeOptionsCol();
    sc.loadingGrid = false;
  };

  sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;

  	var ajaxUrl = 'admin/specdefine/specdefineList';
  	var qData = { pid : 1 };
  	ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
	};

  sc.openModal = function openModal (id, func, data) {
	  var modalInstance = $modal.open({
	    animation: true,
	    templateUrl: 'tpl/modal/predefinded/editWithOption.html',
	    size: 'xl',
	    controller: 'specsModalCtrl',
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


// Modal: 服务项规格
app.controller('specsModalCtrl', ['$scope', 'predefInfo', '$modalInstance', 'ycsApi', 'Notification', function(sc, predefInfo, $modalInstance, ycsApi, Notification){
	sc.predefInfo = predefInfo;

  sc.isEdit = false;

  var cutOptionsLength = 0;

  if (sc.predefInfo.data && sc.predefInfo.data.cutOptions){
    cutOptionsLength = sc.predefInfo.data.cutOptions.length - 1;
    sc.maxSort = Number(sc.predefInfo.data.cutOptions[cutOptionsLength].sort);
  } else {
    sc.maxSort = -1;
  }

	if ( predefInfo.func === 'add' ){
		sc.detail = {};
    sc.detail.cutOptions = [{}];

	} else {
		sc.isEdit = true;
		sc.detail = angular.extend({}, predefInfo.data);
	}

  sc.addOptions = function addOption() {
    sc.detail.cutOptions.push({});
  };

	// ‘排序’预处理，避免和预留字段冲突
  sc.detail.itemSort = angular.isNumber(sc.detail.sort) && sc.detail.sort > 0 ? sc.detail.sort : 0;

	sc.dataSaved = function dataSaved(){
		Notification.success('保存成功！');
		$modalInstance.close(predefInfo);
	};

	sc.delOption = function delOption(index){
		sc.detail.cutOptions.splice(index, 1);
	};

  sc.save = function save(detail){
  	var ajaxUrl;
  	var qData = detail;
  	var tmpArray = [];

  	if ( !sc.isEdit ) {
  		ajaxUrl = 'admin/specdefine/addSpecdefine';

  	} else {
  		ajaxUrl = 'admin/specdefine/editSpecdefine';
  	}

		qData.specdefineid = sc.detail.id;

  	qData.pid = 1;
    qData.sort = angular.isNumber(detail.itemSort) && detail.itemSort > 0 ? detail.itemSort : 0;

  	detail.cutOptions.forEach(function(cutOpt, cIndex){
  		if (cutOpt.name && cutOpt.name.length > 0 && cutOpt.unit && cutOpt.unit.length > 0){
        var sortNum;

        if (predefInfo.func === 'add'){
          sortNum = cIndex;
        } else {
          if (!cutOpt.sort && cutOpt.sort !== 0){
            sortNum = ++sc.maxSort;
          } else {
            sortNum = cutOpt.sort;
          }
        }

				tmpArray.push(sortNum + ',' + cutOpt.name.replace(/ /g, '') + ',' + (cutOpt.price || 0) + ',' + cutOpt.unit);
  		}
		});

		var result = ('' + tmpArray.join('|'));

		qData.options = result;

  	ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };

	sc.cancel = function cancel () {
		$modalInstance.dismiss('cancel');
	};

}]);

})(window.angular);