(function(angular, N){

'use strict';

var app = angular.module('backendApp');

app.controller('userCorpInfoCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'uiGridConstants', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, uiGridConstants, Notification, $modal) {
  sc.qData = {};

  sc.peopleUnitOpts = [
    // {value: -1, label: '-'},
    {value: 0, label: '1-10'},
    {value: 1, label: '11-20'},
    {value: 2, label: '21-50'},
    {value: 3, label: '51-100'},
    {value: 4, label: '101-300'},
    {value: 5, label: '301-1000'},
    {value: 6, label: '1000-5000'},
    {value: 7, label: '5000-10000'},
    {value: 8, label: '10000以上'}
  ];

  if (!sc.qData.registedTime) {
    sc.qData.registedTime = new Date();
  }

  sc.chooseIndustry = function chooseIndustry(){
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/industryCategory.html',
      size: 'lg',
      controller: 'industryCategoryModalCtrl',
      backdrop: 'static',
      resolve: {
        industryInfo: function() {
          return {
            category: sc.qData.tmpCategory,
            industry: sc.qData.tmpIndustry,
            code: sc.qData.code
          };
        }
      }
    });

    modalInstance.result.then(function (industryInfo){
      sc.qData.tmpCategory = industryInfo.category;
      sc.qData.tmpIndustry = industryInfo.industry;
      sc.qData.code = industryInfo.code;
    });
  };
}]);

app.controller('industryCategoryModalCtrl', ['$scope', 'industryInfo', '$modalInstance', 'ycsApi', 'Notification', function(sc, industryInfo, $modalInstance, ycsApi, Notification){
  sc.industryInfo = industryInfo;

  sc.currentSelected = {};

  if (sc.industryInfo.code && sc.industryInfo.industry && sc.industryInfo.category) {
    sc.currentSelected = sc.industryInfo;
  }


  sc.checkIfSelected = function checkIfSelected(industrycode){
    return sc.industryInfo.code !== industrycode ? false : true;
  };

  sc.industries = [];

  sc.getExistingData = function getExistingData(){
    var industries = N.Lib.industryCategory;
    sc.industries = industries;
  };


  

  sc.toggleSelected = function toggleSelected(category, industry, code){
    sc.currentSelected.category = category;
    sc.currentSelected.industry = industry;
    sc.currentSelected.code = code;
  };

  sc.save = function save(){
    industryInfo = sc.currentSelected;
    $modalInstance.close(industryInfo);
  };

  sc.cancel = function cancel(){
    $modalInstance.dismiss('cancel');
  };

  sc.getExistingData();
  


}]);

})(window.angular, window.Neo);