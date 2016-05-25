(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('serviceCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal) {
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
        sc.toggleSelection(row.entity.serviceid);
      });
      gridApi.selection.on.rowSelectionChangedBatch(sc,function(rows){
        rows.forEach(function(item){
          sc.toggleSelection(item.entity.serviceid);
        });
      });
    },
    columnDefs: [
      {
        field: 'name',
        displayName: '服务名称',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'code',
        displayName: '服务编号',
        width: 120,
        type: 'number',
        filter: {
          placeholder: '搜索...'
        },
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableHiding: false
      },
      {
        field: 'serviceid',
        displayName: '操作',
        width: 100,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ui-sref="service.pack.edit({serviceId:COL_FIELD})">编辑</a></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableSorting: false,
        enableFiltering: false,
        enableHiding: false
      },
      {
        field: 'status',
        displayName: '是否上架',
        width: 100,
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ { value: '0', label: '否' }, { value: '1', label: '是' }]
        },
        cellTemplate: '<div class="ui-grid-cell-contents"><span class="is-true" ng-if="COL_FIELD === 1">是</span><span class="is-false" ng-if="COL_FIELD === 0">否</span></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableHiding: false
      },
      // //--- 目前接口索引很慢，而且返回的数据是错误的，暂时隐藏。
      // {
      //   field: 'serviceid',
      //   displayName: '区域',
      //   width: 80,
      //   cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.supportArea(COL_FIELD, row.entity.name)"><i class="fa fa-map-marker fa-lg"></i></a></div>',
      //   enableColumnMenu: false,
      //   cellClass:'text-center',
      //   headerCellClass: 'text-center',
      //   enableSorting: false,
      //   enableFiltering: false,
      //   enableHiding: false
      // },
      {
        field: 'tag',
        displayName: '标签',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'categorynames',
        displayName: '所在分类',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'serviceid',
        displayName: '统计数据',
        width: 100,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.checkParameter(COL_FIELD)"><i class="fa fa-bar-chart"></i></a></div>',
        enableColumnMenu: false,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableFiltering: false,
        enableSorting: false,
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

  sc.statusChanged = function statusChanged(data){
    Notification.success('已修改');
    sc.getExistingData();
  };

  sc.editStatus = function editStatus (num){
    var ajaxUrl = 'admin/service/modifyStatus';
    var qData = {
      serviceids: sc.tempArray.join(','),
      status: Number(num)
    };

    ycsApi.post(ajaxUrl, qData, sc.statusChanged);
  };

  sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;

    var ajaxUrl = 'admin/service/queryServiceList';
    var qData = {};
    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  };  

  sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.list;
    sc.gridApi.selection.clearSelectedRows();
    sc.isEditStatus = false;
    sc.tempArray = [];
    sc.loadingGrid = false;
  }; 

  // 统计数据（原“页面链接”）

  sc.checkParameter = function checkParameter (id) {
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/relativeParameter.html',
      size: 'md',
      controller: ['$scope', '$modalInstance', function(sc, $modalInstance){
        sc.ok = function ok () {
          $modalInstance.close();
        };      

        sc.close = function cancel () {
          $modalInstance.dismiss('cancel');
        };

        sc.getParameter = function getParameter () {
          var ajaxUrl = 'admin/service/queryServiceUrl';
          var qData = {
            serviceid : id
          };

          ycsApi.post(ajaxUrl, qData, sc.renderParameter);
        };

        sc.renderParameter = function renderParameter (data) {
          sc.detail = data.re;
        };

        sc.getParameter();
      }]
    });
  };

  sc.supportArea = function supportArea (id, name) {
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/supportArea.html',
      size: 'xl',
      controller: 'serviceSupportAreaModalCtrl',
      resolve: {
        supportAreas: function() {
          return {
            serviceid: id,
            servicename: name
          };
        }
      }
    });
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
            ajaxUrl: 'admin/service/modifyTags',
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

// Modal: 查看服务支持区域

app.controller('serviceSupportAreaModalCtrl', ['$scope', 'supportAreas', '$modalInstance', 'ycsApi', function(sc, supportAreas, $modalInstance, ycsApi){
  sc.supportAreas = supportAreas;
  sc.servicename = supportAreas.servicename;

  sc.isLoading = true;

  sc.detail = {};

  sc.ok = function ok () {
    $modalInstance.close(supportAreas);
  };

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

  sc.renderData = function renderData (data) {
    var list = [];

    sc.tempArea = data.re.provinces;

    sc.tempArea.forEach(function(province){
      var currentProvice = province.name;

      province.cities.forEach(function(city){
        var currentCity = city.cityname;

        var support = '';
        if (city.supportdistricts && city.supportdistricts.length > 0){
          city.supportdistricts.forEach(function(district, dIndex){
            support += ((dIndex > 0 ? ', ' : '') + district.districtname);
          });
        } else {
          support = '—';
        }

        var unsupport = '';
        if (city.unsupportdistricts && city.unsupportdistricts.length > 0){
          city.unsupportdistricts.forEach(function(district, dIndex){
            unsupport += ((dIndex > 0 ? ', ' : '') + district.districtname);
          });
        } else {
          unsupport = '—';
        }

        list.push({
          province: currentProvice,
          city: currentCity,
          districtStatus: {
            support: support,
            unsupport: unsupport
          }
        });

      });

    });

    sc.detail.list = list;

    sc.isLoading = false;
  };

  sc.getData = function getData () {
    var ajaxUrl = 'admin/service/queryServiceArea';
    var qData = {
      serviceid : sc.supportAreas.serviceid
    };

    ycsApi.post(ajaxUrl, qData, sc.renderData);
  };

  sc.getData();
}]);

})(window.angular);