(function(angular, N){

'use strict';

var app = angular.module('backendApp');

app.controller('tagsCompoundCtrl', ['$scope', 'tagsCmpInfo', 'ycsUtil', 'ycsApi', 'Notification', '$modalInstance', '$filter', function (sc, tagsCmpInfo, ycsUtil, ycsApi, Notification, $modalInstance, $filter) {
	sc.tagsCmpInfo = tagsCmpInfo;

	sc.isBulkEdit = tagsCmpInfo.isBulkEdit;

	sc.currentSelected = angular.copy(sc.tagsCmpInfo.currentSelected, []);
	sc.ajaxUrl = tagsCmpInfo.ajaxUrl;

	sc.sum = {
		category: 0,
		extend: 0,
		general: 0
	};

	sc.qData = {
		tagsInput: []
	};

  sc.loadTags = function loadTags(query){
    return $filter('filter')(sc.tagList, {$: query});
  };

  sc.renderTagList = function renderTagList(data){
    sc.tagList = [];

    if (data.re && data.re.tags && data.re.tags.length > 0){
      data.re.tags.forEach(function(tag){
        sc.tagList.push({
          text: tag
        });
      });
    }
  };

  sc.getAllTags = function getAllTags(){
    var ajaxUrl = 'admin/tag/getAllTag';
    var qData = {};

    ycsApi.post(ajaxUrl, qData, sc.renderTagList);
  };

  sc.updateSum = function updateSum(tag, isAdded){
    var cIndex = sc.tagCategoryArray.indexOf(tag),
    		eIndex = sc.tagExtendArray.indexOf(tag),
    		gIndex = sc.tagGeneralArray.indexOf(tag);

    if (isAdded) {
    	sc.sum.category += cIndex > -1 ? 1 : 0;
    	sc.sum.extend += eIndex > -1 ? 1 : 0;
    	sc.sum.general += gIndex > -1 ? 1 : 0;
    } else {
    	sc.sum.category += cIndex > -1 ? -1 : 0;
    	sc.sum.extend += eIndex > -1 ? -1 : 0;
    	sc.sum.general += gIndex > -1 ? -1 : 0;
    }

  };

	sc.toggleSelected = function toggleSelected(tag, skipRefresh){
		var tagIndex = sc.currentSelected.indexOf(tag);
		
		if (tagIndex === -1){
			sc.currentSelected.push(tag);
			sc.updateSum(tag, true);

			if (!skipRefresh){
				sc.qData.tagsInput.push({text: tag});
			}

		} else {
			sc.currentSelected.splice(tagIndex, 1);
			sc.updateSum(tag, false);

			if (!skipRefresh){
				sc.qData.tagsInput.forEach(function(tagObj, tIndex){
					if (tagObj.text === tag){
						sc.qData.tagsInput.splice(tIndex, 1);
						return;
					}
				});
			}
		}

	};

	sc.checkIfSelected = function checkIfSelected(tag){
		return sc.currentSelected.indexOf(tag) === -1 ? false : true;
	};

	// Tag removed from tagsInput
	sc.deleteTag = function deleteTag(removedTag){
		sc.toggleSelected(removedTag.text);
	};

	// Tag added from tagsInput
	sc.addedTag = function addedTag(newTag){
		sc.toggleSelected(newTag.text, true);
	};

	sc.fillDataList = function fillDataList(datum){
		var data = datum.re;

		sc.tagCategory = data.sort;			// 分类标签
		sc.tagExtend = data.extend;			// 扩展标签
		sc.tagGeneral = data.general;		// 一般标签

		sc.tagCategoryArray = [];
		sc.tagCategory.forEach(function(tag){
			sc.tagCategoryArray.push(tag.name);
		});

		sc.tagExtendArray = [];
		sc.tagExtend.forEach(function(tag){
			sc.tagExtendArray.push(tag.name);
		});

		sc.tagGeneralArray = [];
		sc.tagGeneral.forEach(function(tag){
			sc.tagGeneralArray.push(tag.name);
		});

		// Init existing tags

		if (sc.currentSelected.length > 0){
			sc.currentSelected.forEach(function(tag){
				sc.updateSum(tag, true);

				sc.qData.tagsInput.push({
					text: tag
				});
			});
		}
	};

	sc.fillExistingData = function fillExistingData(){
		sc.getTagListGroup();
		sc.getAllTags();
	};

	sc.getTagListGroup = function getTagListGroup(){
		var ajaxUrl = 'admin/article/getTag';
		var qData = {};

		ycsApi.post(ajaxUrl, qData, sc.fillDataList);
	};

	sc.dataSaved = function dataSaved(){
		$modalInstance.close(sc.tagsCmpInfo);
	};

	sc.save = function save(tagsInput){
		sc.tagsCmpInfo.currentSelected = sc.currentSelected;
		sc.dataSaved();
	};

	sc.bulkSave = function bulkSave(tagsInput){
		if (!sc.ajaxUrl || sc.ajaxUrl.length < 1) { return; }

		sc.tagsCmpInfo.currentSelected = sc.currentSelected;

    var ajaxUrl = sc.ajaxUrl;
    var qData = {
      infoid : sc.tagsCmpInfo.ids.join(','),			// 文章
      ids: sc.tagsCmpInfo.ids.join(','),					// 帮助
      serviceids: sc.tagsCmpInfo.ids.join(',')		// 服务
    };

    qData.tag = '';

    tagsInput.forEach(function(tag, tIndex){
      qData.tag += ((tIndex > 0 ? ',' : '') + tag.text);
    });

    ycsApi.post(ajaxUrl, qData, sc.dataSaved);
	};

	sc.cancel = function cancel () {
		$modalInstance.dismiss('cancel');
	};

	sc.fillExistingData();

}]);

})(window.angular, window.Neo);