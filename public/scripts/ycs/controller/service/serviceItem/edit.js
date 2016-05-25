(function(angular){

'use strict';

var app = angular.module('backendApp');

var unitNames = {
  11: '次',
  12: '个',
  5: '年',
  4: '半年',
  3: '季度',
  2: '月',
  1: '日'
};

app.controller('serviceItemEditCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', '$filter', '$state', function (sc, ycsUtil, ycsApi, Notification, $modal, $filter, $state) {

  sc.animationsEnabled = true;

  sc.isAddNew = false;

  sc.noRegion = false;	// 暂无区域版本

  sc.isEditing = false;

  // 载入服务步骤模板
  sc.stepsTemplate = [
		// 0 办证流程
		{
			title: '办证流程',
			steps: [
				{
					sort: 1,
					name: '筹办申请'
				},
				{
					sort: 2,
					name: '相关部门材料受理'
				},
				{
					sort: 3,
					name: '审核'
				},
				{
					sort: 4,
					name: '审批完成'
				},
				{
					sort: 5,
					name: '办结'
				}
			]
		}
	];

  sc.regionUnitOpts = [
  	{value: 11, label: '元/次'},
  	{value: 12, label: '元/个'},
  	{value: 5, label: '元/年'},
  	{value: 4, label: '元/半年'},
  	{value: 3, label: '元/季度'},
  	{value: 2, label: '元/月'},
  	{value: 1, label: '元/日'},
  	{value: 99, label: '元起'}
  ];

  sc.backToList = function backToList() {
  	$state.go('service.item');
  };

  sc.fillExistingData = function fillExistingData(data){
  	if (!data || !data.re) {return;}

  	sc.qData = data.re;

  	sc.qData.tagsInput = [];

  	if (sc.qData.tag && sc.qData.tag.length > 0){
  		var tempList = ycsUtil.spliter(sc.qData.tag, ',');

      tempList.forEach(function(tag){
        if (tag.length > 0){
          sc.qData.tagsInput.push({text: tag});
        }
      }); 
  	}
  };

  sc.fillSpecsBlock = function fillSpecsBlock(specsIds, data) {
		sc.currentRegion.globalSpecs = [];

		var tempList = data.re.tabList;

		tempList.forEach(function(globalSpec){
			if (specsIds.indexOf(globalSpec.id) !== -1){
				sc.currentRegion.globalSpecs.push(globalSpec);
			}
		});
  };

  // Get global spec list
	sc.getSpecs = function getSpecs(specsIds) {
		var ajaxUrl = 'admin/specdefine/specdefineList';
		var qData = {pid: 1};
		ycsApi.post(ajaxUrl, qData, sc.fillSpecsBlock.bind(this, specsIds));
	};

  sc.fillCurrentRegionalData = function fillCurrentRegionalData(data){
  	// currentRegion Version
  	sc.currentRegion = data.re[0];
		sc.currentRegion.specs = [];
		sc.currentRegion.selectedSpecOpts = {};

  	// Preprocess

  	// - 所需步骤
  	if (sc.currentRegion.stepdetail && sc.currentRegion.stepdetail.length > 2){
	  	sc.currentRegion.serviceSteps = ycsUtil.spliter(sc.currentRegion.stepdetail, ',');
  	} else {
			sc.currentRegion.serviceSteps = [];
  	}

  	// - 需满足条件
  	if (sc.currentRegion.conditions && sc.currentRegion.conditions.length > 2){
  		var tempRequirements = ycsUtil.spliter(sc.currentRegion.conditions, '|');
  		var requirementsArray;
  		sc.currentRegion.requirements = [];

  		tempRequirements.forEach(function (item) {
  			requirementsArray = ycsUtil.spliter(item, ',');

  			sc.currentRegion.requirements.push({
  				text: requirementsArray[1],
  				id: Number(requirementsArray[0])
  			});
  		});

  	} else {
	  	sc.currentRegion.requirements = [];
  	}

  	// - 需提供材料
  	if (sc.currentRegion.documents && sc.currentRegion.documents.length > 2){
  		var tempDocs = ycsUtil.spliter(sc.currentRegion.documents, '|');
  		var docsArray;
  		sc.currentRegion.docs = [];

  		tempDocs.forEach(function (item) {
  			docsArray = ycsUtil.spliter(item, ',');

  			sc.currentRegion.docs.push({
  				text: docsArray[1],
  				id: Number(docsArray[0])
  			});
  		});
  	} else {
  		sc.currentRegion.docs = [];
  	}

  	// - 支持的服务规格
  	if (sc.currentRegion.option.length > 0 ){
  		sc.currentRegion.option.forEach(function (spec) {
  			sc.currentRegion.specs.push(spec.ssdid);

  			sc.currentRegion.selectedSpecOpts[spec.ssdid] = {};
  			sc.currentRegion.selectedSpecOpts[spec.ssdid].selected = [];

  			if (spec.cutOptions && spec.cutOptions.length > 0){
	  			spec.cutOptions.forEach(function(specCutOpt){
	  				sc.currentRegion.selectedSpecOpts[spec.ssdid].selected.push(specCutOpt.name);
	  				sc.currentRegion.selectedSpecOpts[spec.ssdid][specCutOpt.name] = specCutOpt;
	  			});
  			}
  		});

  		if (sc.currentRegion.specs.length > 0) {
  			sc.getSpecs(sc.currentRegion.specs);
  		}
  	}
  };

  // 获取服务项基本详情
  sc.getItemData = function getItemData(code){
  	code = code || sc.itemId;

  	if (!code || code === 'new') {
  		sc.isAddNew = true;
  		sc.qData = {};
  		return;
  	}

  	var ajaxUrl = 'admin/serviceItem/serviceDetailItem';

  	var qData = {
  		service_itemid: code
  	};

  	ycsApi.post(ajaxUrl, qData, sc.fillExistingData);
  };

	// 获取服务项区域版本详情
  sc.getRegionData = function getRegionData(itemId, regionId, needsRefresh){
  	
  	if (sc.isEditing){
  		// DO NOT refresh the page when user is editing the regional form
  		return;
  	}

  	if (sc.qData.regionalList.length === 0 && !needsRefresh){
  		sc.noRegion = true;
  	} else {
  		sc.noRegion = false;

	  	var ajaxUrl = 'admin/serviceItem/serviceDetailRegional';

	  	var qData = {
	  		service_itemid: itemId
	  	};

	  	if (regionId !== undefined && regionId !== null){
	  		qData.service_itemdetailid = regionId;
	  	}

	  	ycsApi.post(ajaxUrl, qData, sc.fillCurrentRegionalData);
  	}

  };

  sc.switchRegion = function switchRegion(regionId) {
  	sc.currentRegion = [];
  	sc.getRegionData(sc.itemId, regionId);
  };

  sc.cloneExistingRegionData = function cloneExistingRegionData(newAreaInfo, data) {
  	data.re[0].city = newAreaInfo.districtCode;
  	data.re[0].nickname = newAreaInfo.nickname;

  	delete data.re[0].service_itemdetailid;

  	// Save the cloned version immediately
  	sc.saveRegionVersion(data.re[0]);

  	// sc.fillCurrentRegionalData(data);
  };

	sc.addAreaVersion = function addAreaVersion (addDefaultVersion) {
		sc.isEditing = true;
	  
		if (addDefaultVersion){
			sc.currentRegion = {
				city: 0,
				nickname: '全国',
				requirements: [],
				docs: [],
				specs: [],
				serviceSteps: [],
				stepDetail: [],
				option: []
			};

			sc.noRegion = false;
			return;
		}

	  var modalInstance = $modal.open({
	    animation: true,
	    templateUrl: 'tpl/modal/addAreas.html',
	    size: 'md',
	    controller:'selectAreaCtrl',
	    backdrop: 'static',
	    resolve: {
	    	areaInfo: function(){
	    		return {
	    			districtCode: null,
	    			nickname: ''
	    		};
	    	}
	    }
	  });

 		modalInstance.result.then(function (areaInfo){
	  	var ajaxUrl = 'admin/serviceItem/serviceDetailRegional';
	  	var qData = {
	  		service_itemid: sc.qData.service_itemid
	  	};

	  	ycsApi.post(ajaxUrl, qData, sc.cloneExistingRegionData.bind(this, areaInfo));
    });
	};	

	sc.editRequirement = function editRequirement () {
	  var modalInstance = $modal.open({
	    animation: true,
	    templateUrl: 'tpl/modal/neededCondition.html',
	    size: 'xl',
	    controller: 'editRequirementDetail',
	    backdrop: 'static',
	    resolve: {
				requirementDetail: function() {
					return {
		        currentSelected: sc.currentRegion.requirements
					};
				}
      }
	  });

	  modalInstance.result.then(function (requirementDetail){
 			sc.currentRegion.requirements = requirementDetail.currentSelected;
    });
	};

	sc.editDocument = function editDocument () {
	  var modalInstance = $modal.open({
	    animation: true,
	    templateUrl: 'tpl/modal/neededDocs.html',
	    size: 'xl',
	    controller: 'editDocsDetail',
	    backdrop: 'static',
	    resolve: {
				documentsDetail: function() {
					return {
		        currentSelected: sc.currentRegion.docs
					};
				}
      }
	  });

	  modalInstance.result.then(function (documentsDetail){
 			sc.currentRegion.docs = documentsDetail.currentSelected;
    });
	};

	sc.editSpecs = function editSpecs () {
		var isBlankBefore = !sc.currentRegion.specs || (sc.currentRegion.specs && sc.currentRegion.specs.length < 1);

		sc.oldRegionSpecs = isBlankBefore ? {} : angular.extend({}, sc.currentRegion);
		sc.before = isBlankBefore ? [] : angular.extend([], sc.currentRegion.specs);

	  var modalInstance = $modal.open({
	    animation: true,
	    templateUrl: 'tpl/modal/supportedSpecs.html',
	    size: 'lg',
	    controller: 'editSpecsDetail',
	    backdrop: 'static',
	    resolve: {
				specsDetail: function() {
					return {
		        currentSelected: sc.currentRegion.specs
					};
				}
      }
	  });

 		modalInstance.result.then(function (specsDetail){
 			if (isBlankBefore){
 				sc.currentRegion.globalSpecs = specsDetail.options;
 				
 				sc.currentRegion.selectedSpecOpts = {};

 				// Init for `ifSelected`
 				specsDetail.options.forEach(function(option){
 					sc.currentRegion.selectedSpecOpts[option.ssdid] = {};
 					sc.currentRegion.selectedSpecOpts[option.ssdid].selected = [];
 				});

	 			sc.currentRegion.option = angular.extend([], specsDetail.options);
	 			// sc.currentRegion.selectedSpecOpts = angular.extend([], specsDetail.options);

 			} else {
 			
 				var tempSpecList = [];

 				if (sc.before && sc.before.length > 0){
 					
 					// Preserved items
 					sc.oldRegionSpecs.globalSpecs.forEach(function (globalSpecBefore) {
 						if (sc.before.indexOf(globalSpecBefore.id) !== -1){
 							tempSpecList.push(globalSpecBefore);
 						}
 					});

					// Newly added items
					specsDetail.options.forEach(function (newSpecList) {
						if (sc.before.indexOf(newSpecList.id) === -1) {
							tempSpecList.push(newSpecList);
							sc.currentRegion.selectedSpecOpts[newSpecList.ssdid] = {};
							sc.currentRegion.selectedSpecOpts[newSpecList.ssdid].selected = [];
						}
					});

					// Replace
					sc.currentRegion.globalSpecs = tempSpecList;
					sc.currentRegion.option = angular.extend([], tempSpecList);
 				}
 			
 			}

    });

	};

	sc.editSteps = function editSteps(stepIndex, isNewStep) {
	  var modalInstance = $modal.open({
	    animation: true,
	    controller: 'editServiceItemSteps',
	    templateUrl: 'tpl/modal/serviceItemSteps.html',
	    size: 'md',
	    backdrop: 'static',
			resolve: {
				stepsInformation: function() {
					return {
		        isNewStep: isNewStep,
		        stepIndex: !isNewStep ? stepIndex : sc.currentRegion.stepDetail.length,
		        stepsObject: sc.currentRegion.stepDetail,
		        info: {}
					};
				}
      }
	  });

 		modalInstance.result.then(function (stepsInformation){
 			sc.currentRegion.stepDetail[stepsInformation.stepIndex] = stepsInformation.info;
 			// update steps' short-form
 			sc.currentRegion.serviceSteps[stepsInformation.stepIndex] = stepsInformation.info.name;
    });
	};

	sc.delRequirement = function delRequirement (index) {
		sc.currentRegion.requirements.splice(index, 1);
	};

	sc.delDoc = function delDocuments (index) {
		sc.currentRegion.docs.splice(index, 1);
	};

	sc.delSteps = function delSteps (index) {
		sc.currentRegion.stepDetail.splice(index, 1);
		sc.currentRegion.serviceSteps.splice(index, 1);
	};

	sc.delSpecs = function delSpecs (index) {
		sc.currentRegion.globalSpecs.splice(index, 1);
		sc.currentRegion.option.splice(index, 1);
		// sc.currentRegion.selectedSpecOpts.splice(index, 1);

		// Update currentSelected
		sc.currentRegion.specs = [];

		if (sc.currentRegion.selectedSpecOpts && sc.currentRegion.selectedSpecOpts.length > 0){
			sc.currentRegion.selectedSpecOpts.forEach(function (remainSpecs){
				sc.currentRegion.specs.push(remainSpecs.ssdid);
			});
		}
	};

	sc.checkIfSelected = function checkIfSelected(ssdid, optName) {
		var selectedIndex = sc.currentRegion.selectedSpecOpts[ssdid].selected.indexOf(optName);
 		return (selectedIndex === -1) ? false : true;
	};

	sc.toggleOptSelection = function toggleOptSelection(ssdid, opt) {
		var selectedOpt = opt.name;
		var selectedIndex = sc.currentRegion.selectedSpecOpts[ssdid].selected.indexOf(selectedOpt);

    if (selectedIndex === -1){
      sc.currentRegion.selectedSpecOpts[ssdid].selected.push(selectedOpt);
      sc.currentRegion.selectedSpecOpts[ssdid][selectedOpt] = opt;
    } else {
      sc.currentRegion.selectedSpecOpts[ssdid].selected.splice(selectedIndex, 1);
      delete sc.currentRegion.selectedSpecOpts[ssdid][selectedOpt];
    }
	};

	sc.infoSaved = function infoSaved(data){
		Notification.success('基础信息保存成功');
		sc.backToList();
	};

	sc.currentRegionSaved = function currentRegionSaved(data){
		sc.noRegion = false;
		sc.isEditing = false;

		Notification.success('当前区域版本信息已保存');

		// Refresh Data
		sc.getRegionData(sc.itemId, sc.currentRegion.service_itemdetailid, true);
	};

	sc.saveInfo = function saveServiceItemBaseInfo(isAddNew){
		var ajaxUrl = isAddNew ? 'admin/serviceItem/addService' : 'admin/serviceItem/editService';

		var qData = sc.qData;

		qData.tag = '';

		qData.tagsInput.forEach(function(tag, tIndex){
      qData.tag += ((tIndex > 0 ? ',' : '') + tag.text);
    });

		ycsApi.post(ajaxUrl, qData, sc.infoSaved);
	};

	sc.saveRegionVersion = function saveRegionVersion(regionData){
		var ajaxUrl = 'admin/serviceItem/editServiceDetail';

		var qData = {};

		var hasError = false;

		qData.service_itemid = sc.qData.service_itemid;
		qData.name = sc.qData.name;

		// 价格单位
		regionData.unitname = unitNames[regionData.unit];

		// 需满足条件（Number）
		if (regionData.requirements && regionData.requirements.length > 0){
			var tempConditions = [];
			regionData.requirements.forEach(function(item){
				tempConditions.push(item.id);
			});
			var conditions = tempConditions.join(',');
			regionData.conditions = conditions;
		} else {
			regionData.conditions = '';
		}


		// 需要提供的材料（Number）
		if (regionData.docs && regionData.docs.length > 0){
			var tempDocuments = [];
			regionData.docs.forEach(function(item){
				tempDocuments.push(item.id);
			});

			var documents = tempDocuments.join(',');
			regionData.documents = documents;

		} else {
			regionData.documents = '';
		}

		// 更新（已选择的）服务规格

		// - 只加入已选择的子规格值
		var newCutOptions = {};

		if (sc.currentRegion.selectedSpecOpts && Object.keys(sc.currentRegion.selectedSpecOpts).length > 0){
			Object.keys(sc.currentRegion.selectedSpecOpts).forEach(function(ssdid){
				var currentSpec = sc.currentRegion.selectedSpecOpts[ssdid];

				var cutOption = [];
				currentSpec.selected.forEach(function(selectedKey){
					cutOption.push(currentSpec[selectedKey]);
				});

				newCutOptions[ssdid] = cutOption;
			});
		}

		// - 去重与清空
		if (regionData.option && regionData.option.length > 0) {
			var finalSpecOptions = [];

			regionData.option.forEach(function(option){
				// Fallback
				if (!option.ssdid && option.id){ option.ssdid = option.id;}
				if (!option.id && option.ssdid){ option.id = option.ssdid;}

				option.cutOptions = newCutOptions[option.ssdid || option.id];

				var partial = [];
				if (option.cutOptions && option.cutOptions.length > 0){
					option.cutOptions.forEach(function(cutOption, cIndex){
						partial.push([cIndex, cutOption.name, cutOption.price, cutOption.unit].join(','));
					});
					option.options = partial.join('|');
					finalSpecOptions.push(option);

				} else {
					Notification.warning({title: '注意', message: '您在“' + option.name + '”中未选择任何规格值，该服务规格添加失败。', delay: 10000});
				}
			});

			regionData.option = finalSpecOptions;
		}

		// 删除多余的`[]`，以防导致服务的bug
		if (regionData.option && regionData.option.length === 0) {
			delete regionData.option;
		}
		
		var stepdetail = '';

		// 服务步骤数量及排序
		if (regionData.stepDetail && regionData.stepDetail.length > 0){
			regionData.steps = regionData.stepDetail.length;

			// Update step #
			regionData.stepDetail.forEach(function(step, sIndex){
				step.sort = sIndex + 1;
				stepdetail += ((sIndex > 0 ? ',' : '') + step.name);
			});

		} else {
			regionData.steps = 0;
		}

		// 服务步骤（字符串）
		regionData.stepdetail = stepdetail;

		qData.regional = angular.toJson(regionData);

		ycsApi.post(ajaxUrl, qData, sc.currentRegionSaved);
	};

	// TAGS

  sc.loadTags = function loadTags(query){
    return $filter('filter')(sc.tagList, {$: query});
  };

  sc.renderTagList = function renderTagList(data){
    sc.tagList = [];

    if (data.re && data.re.sort && data.re.sort.length > 0){
      data.re.sort.forEach(function(tag){
        sc.tagList.push({
          text: tag.name
        });
      });
    }
  };

  sc.getAllTags = function getAllTags(){
    var ajaxUrl = 'admin/article/getTag';
    var qData = {};

    ycsApi.post(ajaxUrl, qData, sc.renderTagList);
  };

  // 步骤模板

  sc.addStepsTemplate = function addStepsTemplate(index){
  	var tplSteps = sc.stepsTemplate[index].steps;

  	tplSteps.forEach(function(step){
	  	sc.currentRegion.stepDetail.push(step);
  		sc.currentRegion.serviceSteps.push(step.name);
  	});
  };

	sc.getItemData();
  sc.getAllTags();

}]);

})(window.angular);