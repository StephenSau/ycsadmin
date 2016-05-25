(function(angular){

'use strict';

var app = angular.module('backendApp');

// 增加区域版本

app.controller('selectAreaCtrl', ['$scope', 'areaInfo', '$modalInstance', 'ycsUtil', function(sc, areaInfo, $modalInstance, ycsUtil){
	sc.areaInfo = areaInfo;

	sc.ok = function ok () {
		areaInfo.nickname = ycsUtil.getAreaLabelByCode(areaInfo.districtCode);
		$modalInstance.close(areaInfo);
	};

	sc.cancel = function cancel () {
		$modalInstance.dismiss('cancel');
	};

}]);

// 服务步骤

app.controller('editServiceItemSteps', ['$scope', 'stepsInformation', '$modalInstance', function(sc, stepsInformation, $modalInstance){
	sc.stepIndex = stepsInformation.stepIndex;

	sc.save = function save(stepInfo){
		stepsInformation.info = stepInfo;
		$modalInstance.close(stepsInformation);
	};

	sc.cancel = function cancel () {
		$modalInstance.dismiss('cancel');
	};

	if (stepsInformation.isNewStep) {
		sc.stepInfo = {};
	} else {
		sc.stepInfo = stepsInformation.stepsObject[sc.stepIndex];
	}

	sc.stepInfo.sort = sc.stepIndex + 1;

}]);

// 需满足条件

app.controller('editRequirementDetail', ['$scope', 'ycsApi', 'requirementDetail', '$modalInstance', '$filter', function(sc, ycsApi, requirementDetail, $modalInstance, $filter){
	sc.requirementDetail = requirementDetail;
	sc.requirementDetail.texts = [];
	sc.requirementDetail.ids = [];

	sc.requirementDetail.currentSelected.forEach(function(item){
		sc.requirementDetail.texts.push(item.text);
		sc.requirementDetail.ids.push(item.id);
	});

	sc.reqList = [];
	sc.requirementSearch = null;

	sc.fillExitingData = function fillExitingData(data){
		sc._reqList = data.re.tabList;
		sc.reqList = angular.extend({}, sc._reqList);
	};

	sc.getRequirements = function  getRequirements() {
		var ajaxUrl = 'admin/specdefine/specdefineList';
		var qData = {pid: 2};
		ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
	};

	sc.checkIfSelected = function checkIfSelected(item) {
		return sc.requirementDetail.texts.indexOf(item) > -1;
	};

	sc.toggleSelected = function toggleSelected (item, id) {
		var itemIndex = sc.requirementDetail.texts.indexOf(item);
		var idsIndex = sc.requirementDetail.ids.indexOf(id);
		if ( itemIndex === -1){
			sc.requirementDetail.texts.push(item);
			sc.requirementDetail.ids.push(id);
		} else {
			sc.requirementDetail.texts.splice(itemIndex, 1);
			sc.requirementDetail.ids.splice(idsIndex, 1);
		}
	};

	sc.filterRequirement = function filterRequirement() {
		var query = sc.requirementSearch;
 		sc.reqList = $filter('filter')(sc._reqList, {name: query});
	};

	sc.delSelected = function delSelected(index){
		sc.requirementDetail.texts.splice(index, 1);
		sc.requirementDetail.ids.splice(index, 1);
	};

	sc.ok = function ok () {
		sc.requirementDetail.currentSelected = [];
		for (var i = 0;i < sc.requirementDetail.texts.length;i++){
			sc.requirementDetail.currentSelected.push({
				text: sc.requirementDetail.texts[i],
				id: sc.requirementDetail.ids[i]
			});
		}
		$modalInstance.close(sc.requirementDetail);
	};

	sc.cancel = function cancel () {
		$modalInstance.dismiss('cancel');
	};

	sc.getRequirements();

}]);

// 需提供材料

app.controller('editDocsDetail', ['$scope', 'ycsApi', 'documentsDetail', '$modalInstance', '$filter', function(sc, ycsApi, documentsDetail, $modalInstance, $filter){
	sc.documentsDetail = documentsDetail;
	sc.documentsDetail.texts = [];
	sc.documentsDetail.ids = [];

	sc.documentsDetail.currentSelected.forEach(function(item){
		sc.documentsDetail.texts.push(item.text);
		sc.documentsDetail.ids.push(item.id);
	});

	sc.docsSearch = null;

	sc.docsList = [];

	sc.fillExitingData = function fillExitingData(data){
		sc._docsList = data.re.tabList;
		sc.docsList = angular.extend({}, sc._docsList);
	};

	sc.getRequirements = function  getRequirements() {
		var ajaxUrl = 'admin/specdefine/specdefineList';
		var qData = {pid: 3};
		ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
	};

	sc.checkIfSelected = function checkIfSelected(item) {
		return sc.documentsDetail.texts.indexOf(item) > -1;
	};

	sc.toggleSelected = function toggleSelected (item, id) {
		var itemIndex = sc.documentsDetail.texts.indexOf(item);
		var idsIndex = sc.documentsDetail.ids.indexOf(id);
		if ( itemIndex === -1){
			sc.documentsDetail.texts.push(item);
			sc.documentsDetail.ids.push(id);
		} else {
			sc.documentsDetail.texts.splice(itemIndex, 1);
			sc.documentsDetail.ids.splice(idsIndex, 1);
		}
	};

	sc.filterDocs = function filterDocs() {
		var query = sc.docsSearch;
 		sc.docsList = $filter('filter')(sc._docsList, {name: query});
	};

	sc.delSelected = function delSelected(index){
		sc.documentsDetail.texts.splice(index, 1);
		sc.documentsDetail.ids.splice(index, 1);
	};

	sc.ok = function ok () {
		sc.documentsDetail.currentSelected = [];
		for (var i = 0;i < sc.documentsDetail.texts.length;i++){
			sc.documentsDetail.currentSelected.push({
				text: sc.documentsDetail.texts[i],
				id: sc.documentsDetail.ids[i]
			});
		}
		$modalInstance.close(sc.documentsDetail);
	};

	sc.cancel = function cancel () {
		$modalInstance.dismiss('cancel');
	};

	sc.getRequirements();

}]);

// 服务规格

app.controller('editSpecsDetail', ['$scope', 'ycsApi', 'specsDetail', '$modalInstance', function(sc, ycsApi, specsDetail, $modalInstance){
	sc.specsDetail = specsDetail;

	sc.specsDetail.options = [];

	sc.specsList = [];

	sc.fillExitingData = function fillExitingData(data){
		sc.specsList = data.re.tabList;
	};

	sc.getSpecs = function getSpecs() {
		var ajaxUrl = 'admin/specdefine/specdefineList';
		var qData = {pid: 1};
		ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
	};

	sc.checkIfSelected = function checkIfSelected(item) {
		return sc.specsDetail.currentSelected.indexOf(item) > -1;
	};

	sc.toggleSelected = function toggleSelected (itemId, item) {
		var itemIndex = sc.specsDetail.currentSelected.indexOf(itemId);
		if ( itemIndex === -1){
			sc.specsDetail.currentSelected.push(itemId);
		} else {
			sc.specsDetail.currentSelected.splice(itemIndex, 1);
		}
	};

	sc.ok = function ok () {

		sc.specsList.forEach(function (specs) {
			if ( sc.specsDetail.currentSelected.indexOf(specs.id) !== -1 ){
				specs.ssdid = specs.id;
				sc.specsDetail.options.push(specs);
			}
		});

		$modalInstance.close(sc.specsDetail);
	};

	sc.cancel = function cancel () {
		$modalInstance.dismiss('cancel');
	};

	sc.getSpecs();
}]);

})(window.angular);