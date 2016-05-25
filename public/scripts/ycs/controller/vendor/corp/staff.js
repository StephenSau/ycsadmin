(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('staffCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal) {
  sc.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    rowHeight: 65,
    onRegisterApi: function(gridApi){
      sc.gridApi = gridApi;
    },
		columnDefs: [
      {
        field: 'username',
        displayName: '用户名',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'sn',
        displayName: '人员编号',
        width: 120,
        type: 'number',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'realname',
        displayName: '真实姓名',
        width: 80,
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'head',
        displayName: '真实照片',
        width: 70,
        enableColumnMenu: false,
        cellTemplate: '<div class="ui-grid-cell-contents"><div class="head" style="background:url({{COL_FIELD}})"></div></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableFiltering: false,
        enableSorting: false,
        enableHiding: false
      },
      {
        field: 'id',
        displayName: '编辑',
        width: 70,
        enableColumnMenu: false,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.editData(row.entity.id)">编辑</a></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableFiltering: false,
        enableHiding: false
      },
      // {
      //   field: 'status',
      //   displayName: '人员状态',
      //   width: 100,
      //   filter: {
      //     type: uiGridConstants.filter.SELECT,
      //     selectOptions: [ { value: '0', label: '不提供服务' }, { value: '1', label: '提供服务' }]
      //   },
      //   cellClass:'text-center',
      //   headerCellClass: 'text-center',
      //   cellTemplate: '<div class="ui-grid-cell-contents"><span class="is-true" ng-if="COL_FIELD === 1">提供服务</span><span class="is-false" ng-if="COL_FIELD === 0">不提供服务</span></div>',
      //   enableHiding: false
      // },
      {
        field: 'address',
        displayName: '所在区域',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'title',
        displayName: '职务头衔',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'mobile',
        displayName: '联系手机',
        type: 'number',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'email',
        displayName: '电子邮箱',
        filter: {
          placeholder: '搜索...'
        },
        enableHiding: false
      },
      {
        field: 'grade',
        displayName: '级别',
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ { value: '0', label: '普通' }, { value: '1', label: '专家' }, { value: '2', label: '高级专家' }]
        },
        cellTemplate: '<div class="ui-grid-cell-contents"><span ng-if="COL_FIELD === 0">普通</span><span ng-if="COL_FIELD === 1">专家</span><span ng-if="COL_FIELD === 2">高级专家</span></div>',
        enableHiding: false
      },
      {
        field: '_field',
        displayName: '专业领域',
        filter: {
          type: uiGridConstants.filter.SELECT,
          selectOptions: [ 
            { value: '工商', label: '工商' },
            { value: '财务会计', label: '财务会计' },
            { value: '审计', label: '审计' },
            { value: '税务', label: '税务' },
            { value: '法律', label: '法律' },
            { value: '资产评估', label: '资产评估' },
            { value: '许可证', label: '许可证' },
            { value: '商标专利', label: '商标专利' },
            { value: '人力资源', label: '人力资源' }
          ]
        },
        enableHiding: false
      },
      {
        field: 'id',
        displayName: '删除',
        width: 70,
        enableColumnMenu: false,
        cellTemplate: '<div class="ui-grid-cell-contents"><a class="link-delete" ng-click="grid.appScope.deleteStaff(COL_FIELD)" ng-if="row.entity.username !== \'admin\'">删除</a><span ng-if="row.entity.username === \'admin\'" title="不能删除管理员账户">—</span></div>',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableFiltering: false,
        enableHiding: false
      }
    ]
	};

  sc.shapeFieldCol = function shapeFieldCol(){
    var rows = sc.gridOptions.data;

    if (rows.length === 0){ return; }

    rows.forEach(function(row){
      var fieldArray = row.field.join(',');
      var _field = [];
      _field.push(fieldArray);
      row._field = _field.join('\n');
    });
  };

	sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.persons;
    sc.shapeFieldCol();
  };

  sc.deleteSaved = function deleteSaved(){
    Notification.error('人员已删除');
    sc.getExistingData();
  };

  sc.deleteStaff = function deleteStaff(id){
    var ajaxUrl = 'admin/servicer/deletePerson';
    var qData = { 
      id: Number(id)
    };

    ycsApi.post(ajaxUrl, qData, sc.deleteSaved);
  };

  sc.getExistingData = function getExistingData(){
    var ajaxUrl = 'admin/servicer/qryPersonLists';
    var qData = { 
      id: Number(sc.vendorId),
      pageSize: 999999
    };

    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  };

  sc.editData = function editData (id) {
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/vendor/editStaff.html',
      size: 'xl',
      backdrop: 'static',
      controller: 'editStaffModalCtrl',
      resolve: {
        staffInfo: function() {
          return {
            id: id,
            servicerid: sc.vendorId
          };
        }
      }
    });

    modalInstance.result.then(function (staffInfo){
      sc.getExistingData();
    });
  };


  sc.addStaff = function addStaff(){
    sc.isEdit = true;
  };

  sc.getExistingData();
}]);

app.controller('editStaffModalCtrl', ['$scope', 'staffInfo', '$modalInstance', 'ycsApi', 'ycsUtil', 'Notification', '$filter', '$modal', function(sc, staffInfo, $modalInstance, ycsApi, ycsUtil, Notification, $filter, $modal){

  sc.staffInfo = staffInfo;

  sc.fieldArray = [];

  sc.uploadBtnDisabled = false;

  sc.qData = {};

  if(sc.staffInfo.id ==='new'){
    sc.qData.worklifeTime = new Date();
  }

  sc.certificateArray = [];   // for 专业资格
  sc.certList = [];           // for 证明材料

  sc.fieldOpts = [
    {value:'10', label: '工商'},
    {value:'20', label: '财务会计'},
    {value:'30', label: '审计'},
    {value:'40', label: '税务'},
    {value:'50', label: '法律'},
    {value:'60', label: '资产评估'},
    {value:'70', label: '许可证'},
    {value:'80', label: '商标专利'},
    {value:'90', label: '人力资源'}
  ];

  sc.certificateOpts = [
    {value:'11', label: '会计专业技术资格(中级)'},
    {value:'12', label: '会计专业技术资格(高级)'},
    {value:'13', label: '注册会计师(CPA)'},
    {value:'14', label: '特许公认会计师(ACC)'},
    {value:'15', label: '英国国际会计师(AIA)'},
    {value:'16', label: '英国特许管理会计师(CIM)'},
    {value:'17', label: '英国财务会计师(IFA)'},
    {value:'18', label: '美国注册管理会计师(CMA)'},
    {value:'19', label: '加拿大国际会计师(CGA)'},
    {value:'20', label: '澳大利亚注册会计师(ASCPA）'},
    {value:'41', label: '国际注册内部审计师(CIA)'},
    {value:'42', label: '国际注册信息系统审计师(CISA)'},
    {value:'61', label: '注册税务师(CTA)'},
    {value:'81', label: '注册资产评估师(CPV)'}
  ];

  sc.rankUnitOpts = [
    {value: '0', label: '普通'},
    {value: '1', label: '专家'},
    {value: '2', label: '高级专家'}
  ],

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };

  sc.checkIfSelected = function checkIfSelected(item) {
    return sc.fieldArray.indexOf(item) > -1;
  };

  sc.addStaffSaved = function addStaffSaved(data){
    Notification.success('人员信息添加成功！');
    $modalInstance.close();
  };

  sc.editStaffSaved = function editStaffSaved(data){
    Notification.success('人员信息编辑成功！');
    $modalInstance.close();
  };

  sc.checkFieldIfSelected = function checkFieldIfSelected(item) {
    return sc.fieldArray.indexOf(item) > -1;
  };

  sc.toggleFieldSelected = function toggleFieldSelected (item) {
    var itemIndex = sc.fieldArray.indexOf(item);
    if ( itemIndex === -1){
      sc.fieldArray.push(item);
    } else {
      sc.fieldArray.splice(itemIndex, 1);
    }
  };

  sc.checkCertificateIfSelected = function checkCertificateIfSelected(item) {
    return sc.certificateArray.indexOf(item) > -1;
  };

  sc.toggleCertificateSelected = function toggleCertificateSelected (item) {
    var itemIndex = sc.certificateArray.indexOf(item);
    if ( itemIndex === -1){
      sc.certificateArray.push(item);
    } else {
      sc.certificateArray.splice(itemIndex, 1);
    }
  };

  sc.fillExitingData = function fillExitingData(data){
    sc.qData = data.re;
    if(sc.qData.worklife.length > 0){
      sc.qData.worklifeTime = new Date(sc.qData.worklife);
    } else{
      sc.qData.worklifeTime = new Date();
    }
    sc.fieldArray = sc.qData.fieldList;
    sc.certificateArray = sc.qData.certificatesList;

    // 证明材料

    var tempList;

    if (sc.qData.filesList && sc.qData.filesList.length > 0){
      sc.qData.filesList.forEach(function(item){
        sc.certList.push({
          text: item.fileName,
          image: item.fileUrl
        });
      });
    }

  };


  // Portrait

  sc.imageUploaded = function imageUploaded(data) {
    sc.qData.head = data;
    ycsUtil.disableButton(sc, false);
  };

  sc.uploadImage = function uploadImage(file) {
    ycsUtil.uploadImage(file, 'propepo', sc.imageUploaded, sc);
  };

  sc.$on('imageSelected', function (event, file){
    sc.$apply(function () {
      sc.uploadImage(file);
      ycsUtil.disableButton(sc, true);
    });
  });

  sc.deletePortrait = function deletePortrait(){
    delete sc.qData.head;
  };

  // Certification Files

  sc.addImageWithTitle = function addImageWithTitle(){
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/addPicsWithTitle.html',
      size: 'lg',
      controller: 'addVendorStaffCertFilesModalCtrl',
      backdrop: 'static',
      resolve: {
        picsInfo: function() {
          return {
            targetTitle: '证明材料',
            image: '',
            imageText: ''
          };
        }
      }
    });

    modalInstance.result.then(function (picsInfo){
      var item = {
        text: picsInfo.imageText,
        image: picsInfo.image
      };

      sc.certList.push(item);
    });
  };

  sc.delPic = function delPic(index){
    sc.certList.splice(index, 1);
  };

  sc.getExistingData = function getExistingData(){
    var ajaxUrl = 'admin/servicer/qryPersonById';
    var qData = {
      id: sc.staffInfo.id
    };

    ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
  };  

  sc.save = function save(detail){
    var ajaxUrl;
    var qData = detail;

    qData.field = sc.fieldArray.join(',');

    qData.certificates = sc.certificateArray.join(',');

    qData.province = Math.round(qData.city / 10000) * 10000;
    qData.worklife = $filter('date')(qData.worklifeTime, 'yyyy-MM-dd');

    if(qData.grade === '0'){
      delete qData.worklife;
      delete qData.introduction;
    }

    // 证明材料

    var result;

    if (sc.certList.length > 0){
      result = '';
      sc.certList.forEach(function(cert, cIndex){
        result += (cIndex > 0 ? '|' : '') + (cert.text + ',' + cert.image);
      });

      qData.files = result;
    } else {
      qData.files = '';
    }

    if(sc.staffInfo.id !== 'new'){
      ajaxUrl = 'admin/servicer/updatePerson';
      ycsApi.post(ajaxUrl, qData, sc.editStaffSaved);
    } else {
      ajaxUrl = 'admin/servicer/addPerson';
      qData.id = Number(sc.staffInfo.servicerid);
      ycsApi.post(ajaxUrl, qData, sc.addStaffSaved);
    }
  };

  if(sc.staffInfo.id !== 'new'){
    sc.getExistingData();
  }

}]);


// Modal: 服务商-人员管理-证明材料
app.controller('addVendorStaffCertFilesModalCtrl', ['$scope', 'picsInfo', '$modalInstance', 'ycsApi', 'ycsUtil', 'Notification', function(sc, picsInfo, $modalInstance, ycsApi, ycsUtil, Notification){
  sc.picsInfo = picsInfo;

  sc.uploadBtnDisabled = false;

  sc.imageUploaded = function imageUploaded(data){
    sc.picsInfo.image = data;
    ycsUtil.disableButton(sc, false);
  };

  sc.uploadImage = function uploadImage(file){
    ycsUtil.uploadImage(file, 'serlicense', sc.imageUploaded);
  };

  sc.$on('imageSelected', function (event, file, target){
    sc.$apply(function () {
      sc.uploadImage(file);
      ycsUtil.disableButton(sc, true);
    });
  });

  sc.save = function save(picsInfo){
    $modalInstance.close(picsInfo);
  };

  sc.cancel = function cancel () {
    $modalInstance.dismiss('cancel');
  };
}]);


})(window.angular);