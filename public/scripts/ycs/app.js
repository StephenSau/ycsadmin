(function(angular, N, CryptoJS){

'use strict';

var Util = N.Lib.Util;
var $ = N.$;

var ycsApp = angular.module('backendApp', ['ngCookies', 'ui.router', 'ui.bootstrap', 'ui-notification', 'ui.grid', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.expandable', 'ui.grid.selection', 'ui.grid.treeView', 'ngTagsInput', 'ng.ueditor', 'datetime', 'dndLists']);

var app = angular.module('backendApp');

var apiHost,
    fsHost,
    apiVer;

// LOCAL Dev and QA
if (document.URL.indexOf('local.ycs.com') > -1 || document.URL.indexOf('suadm.ycs.com') > -1){
  apiHost = 'http://api.ycs.com/';
  fsHost = 'fs.ycs.com';
  apiVer = '1.70';

} else if (document.URL.indexOf('local165.ycs.com') > -1 || document.URL.indexOf('adm165.ycs.com') > -1  || document.URL.indexOf('suadm165.ycs.com') > -1) {
  apiHost = 'http://api165.ycs.com/';
  fsHost = 'fs.ycs.com';
  apiVer = '1.65';

// PROD
} else if (document.URL.indexOf('1caishui.com') > -1 ) {
  apiHost = 'http://api.1caishui.com/';
  fsHost = 'fs.1caishui.com';
  apiVer = '1.65';

// Pre-PROD
} else {
  apiHost = 'http://api2.ycs.com:8080/';
  fsHost = 'fs.ycs.com';
  apiVer = 'api2';
}

// Global App Settings
app.constant('appSettings', {
  apiHost: apiHost,
  fsHost: fsHost,
  apiVer: apiVer,
  appVer: '1.65'
});

// The File Server Error Code
app.constant('fsErrorCode', {
  3101: '图片读取失败',
  3102: '文件规范配置已经存在',
  3103: '文件规范配置不存在',
  3104: '指定尺寸不存在',
  3105: '时间戳过期',
  3106: '不可信赖的客户端',
  3107: '图片像素超过限制',
  3108: '图片大小超过限制',
  3109: '图片类型不支持',
  3110: '拒绝处理请求',
  3111: '文件服务器未知错误',
  3112: '签名版本号错误'
});

app.run(['$templateCache', function($templateCache){

  // Custom (override) uiGrid header filter template
  $templateCache.put('ui-grid/ui-grid-filter',
    '<div class=\'ui-grid-filter-container\' ng-repeat=\'colFilter in col.filters\' ng-class=\'{"filtering": colFilter.term && colFilter.term.toString().length > 0, "ui-grid-filter-cancel-button-hidden" : colFilter.disableCancelFilterButton === true }\'><div ng-if=\'colFilter.type !== "select"\'><input type=\'text\' class=\'ui-grid-filter-input\' ng-model=\'colFilter.term\' ng-attr-placeholder=\'{{colFilter.placeholder || ""}}\'><div class=\'ui-grid-filter-button\' ng-click=\'colFilter.term = null\' ng-if=\'!colFilter.disableCancelFilterButton\'><i class=\'ui-grid-icon-cancel\' ng-show=\'colFilter.term !== undefined && colFilter.term !== null && colFilter.term !== ""\'>&nbsp;</i></div></div><div ng-if=\'colFilter.type === "select"\'><select class=\'ui-grid-filter-select\' ng-model=\'colFilter.term\' ng-attr-placeholder=\'{{colFilter.placeholder || ""}}\' ng-options=\'option.value as option.label for option in colFilter.selectOptions\'><option value=\'\'></option></select><div class=\'ui-grid-filter-button-select\' ng-click=\'colFilter.term = null\' ng-if=\'!colFilter.disableCancelFilterButton\'><i class=\'ui-grid-icon-cancel\' ng-show=\'colFilter.term !== undefined && colFilter.term != null\'>&nbsp;</i></div></div></div>'
  );

}]);

app.config(function($stateProvider, $urlRouterProvider, $rootScopeProvider, NotificationProvider, $httpProvider){

  $httpProvider.defaults.withCredentials = true;

  $urlRouterProvider
    .when('/service', '/service/pack')
    .when('/service/predefined', '/service/predefined/specs')
    .when('/system', '/system/tag')
    .when('/system/pages', '/system/pages/sliderHome')
    .when('/vendor', '/vendor/corp')
    .when('/cms', '/cms/article')
    .when('/ticket', '/ticket/manage')
    .when('/user', '/user/info')
    .when('/wechat', '/wechat/client-service')
    ;


  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: 'home.html'
    })

    // ===================
    // Service 服务管理
    // ===================
    
    .state('service', {
      url: '/service',
      views: {
        '': {},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-service.html'}
      }
    })

    // - Service 服务

    .state('service.pack', {
      url: '/pack',
      views: {
        '@': {templateUrl: 'tpl/service/service.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-service.html'}
      }
    })
    
    .state('service.pack.edit', {
      url: '/edit/:serviceId',
      views: {
        '@': {
          templateUrl: 'tpl/service/pack/edit.html',
          controller: function($scope, $stateParams) {
            $scope.serviceId = $stateParams.serviceId;
          }
        },
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-service.html'}
      }
    })

    .state('service.pack.supportRegion', {
      url: '/supportRegion/:serviceId',
      views: {
        '@': {
          templateUrl: 'tpl/service/pack/supportRegion.html',
          controller: function($scope, $stateParams) {
            $scope.serviceId = $stateParams.serviceId;
          }
        },
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-service.html'}
      }
    })

    // - Service Item 服务项

    .state('service.item', {
      url: '/service/item',
      views: {
        '@': {templateUrl: 'tpl/service/service-item.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-service.html'}
      }
    })

    .state('service.item.edit', {
      url: '/edit/:itemId',
      views: {
        '@': {
          templateUrl: 'tpl/service/serviceItem/edit.html',
          controller: function($scope, $stateParams) {
            $scope.itemId = $stateParams.itemId;
          }
        },
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-service.html'}
      }
    })


    // - Predefined 预定义项

    .state('service.predefined', {
      url: '/predefined',
      views: {
        '@': {templateUrl: 'tpl/service/predefined.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-service.html'},
        'predefinedDetail@': {templateUrl: 'tpl/service/predefined/specs.html'}
      },
    })

    // -- 服务项规格
    .state('service.predefined.specs', {
      url: '/specs',
      views: {
        '@': {templateUrl: 'tpl/service/predefined.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-service.html'},
        'predefinedDetail@service.predefined.specs': {templateUrl: 'tpl/service/predefined/specs.html'}
      },
    })

    // -- 需满足条件
    .state('service.predefined.requirement', {
      url: '/requirement',
      views: {
        '@': {templateUrl: 'tpl/service/predefined.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-service.html'},
        'predefinedDetail@service.predefined.requirement': {templateUrl: 'tpl/service/predefined/requirement.html'}
      },
    })

    // -- 需提供材料
    .state('service.predefined.material', {
      url: '/material',
      views: {
        '@': {templateUrl: 'tpl/service/predefined.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-service.html'},
        'predefinedDetail@service.predefined.material': {templateUrl: 'tpl/service/predefined/material.html'}
      },
    })

    // -- 发票类型
    .state('service.predefined.invoice', {
      url: '/invoice',
      views: {
        '@': {templateUrl: 'tpl/service/predefined.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-service.html'},
        'predefinedDetail@service.predefined.invoice': {templateUrl: 'tpl/service/predefined/invoice.html'}
      },
    })

    // -- 注意事项
    .state('service.predefined.attention', {
      url: '/attention',
      views: {
        '@': {templateUrl: 'tpl/service/predefined.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-service.html'},
        'predefinedDetail@service.predefined.attention': {templateUrl: 'tpl/service/predefined/attention.html'}
      },
    })

    // -- 常见问题
    .state('service.predefined.faq', {
      url: '/faq',
      views: {
        '@': {templateUrl: 'tpl/service/predefined.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-service.html'},
        'predefinedDetail@service.predefined.faq': {templateUrl: 'tpl/service/predefined/faq.html'}
      },
    })

    // ===================
    // Vendor 服务商管理
    // ===================

    .state('vendor', {
      url: '/vendor',
      views: {
        '': {},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-vendor.html'}
      }
    })

    .state('vendor.corp', {
      url: '/corp',
      views: {
        '@': {templateUrl: 'tpl/vendor/vendor.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-vendor.html'}
      }
    })

    .state('vendor.corp.edit', {
      url: '/edit/:vendorId',
      views: {
        '@': {
          templateUrl: 'tpl/vendor/corp/index.html',
          controller: function($scope, $stateParams) {
            $scope.vendorId = $stateParams.vendorId;
          }
        },
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-vendor.html'}
      }
    })

    // // To Be Deprecated
    // .state('vendor.corp.edit.defaultServiceItem', {
    //   url: '/defaultServiceItem',
    //   views: {
    //     '@': {
    //       templateUrl: 'tpl/vendor/corp/steps/defaultServiceItem.html',
    //       controller: function($scope, $stateParams) {
    //         $scope.vendorId = $stateParams.vendorId;
    //       }
    //     },
    //     'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-vendor.html'}
    //   }
    // })

    .state('vendor.corp.edit.modifyArea', {
      url: '/modifyArea',
      views: {
        '@': {
          templateUrl: 'tpl/vendor/corp/modifyArea.html',
          controller: function($scope, $stateParams) {
            $scope.srid = $stateParams.vendorId;
          }
        },
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-vendor.html'}
      }
    })

    .state('vendor.corp.rating', {
      url: '/rating',
      views: {
        '@': {
          templateUrl: 'tpl/vendor/rating.html',
        },
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-vendor.html'}
      }
    })

    .state('vendor.notification', {
      url: '/notification',
      views: {
        '@': {
          templateUrl: 'tpl/vendor/notification.html',
        },
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-vendor.html'}
      }
    })

    // ===================
    // System 系统管理
    // ===================

    .state('system', {
      url: '/system',
      views: {
        '': {},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-system.html'}
      }
    })

    // -- 标签管理
    .state('system.tag', {
      url: '/tag',
      views: {
        '@': {templateUrl: 'tpl/system/tag.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-system.html'}
      }
    })

    // -- 分类管理
    .state('system.category', {
      url: '/category',
      views: {
        '@': {templateUrl: 'tpl/system/category.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-system.html'}
      }
    })

    // -- 页面管理
    .state('system.pages', {
      url: '/pages',
      views: {
        '@': {templateUrl: 'tpl/system/pages.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-system.html'},
        'sliderDetail@': {templateUrl: 'tpl/system/pages/sliders.html'}
      }
    })

    // -- 首页轮转图
    .state('system.pages.sliderHome', {
      url: '/sliderHome',
      views: {
        '@': {templateUrl: 'tpl/system/pages.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-system.html'},
        'sliderDetail@system.pages.sliderHome': {templateUrl: 'tpl/system/pages/sliders.html'}
      }
    })

    // -- 资讯首页轮转图
    .state('system.pages.sliderNews', {
      url: '/sliderNews',
      views: {
        '@': {templateUrl: 'tpl/system/pages.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-system.html'},
        'sliderDetail@system.pages.sliderNews': {templateUrl: 'tpl/system/pages/sliders.html'}
      }
    })    

    // ===================
    // CMS 内容管理
    // ===================

    .state('cms', {
      url: '/cms',
      views: {
        '': {},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-cms.html'}
      }
    })

    // -- 文章管理
    .state('cms.article', {
      url: '/article',
      views: {
        '@': {templateUrl: 'tpl/cms/article.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-cms.html'}
      }
    })

    .state('cms.article.edit', {
      url: '/edit/:articleId',
      views: {
        '@': {
          templateUrl: 'tpl/cms/article/edit.html',
          controller: function($scope, $stateParams) {
            $scope.articleId = $stateParams.articleId;
          }
        },
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-cms.html'}
      }
    })

    // -- 采集管理
    .state('cms.feed', {
      url: '/feed',
      views: {
        '@': {templateUrl: 'tpl/cms/feed.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-cms.html'}
      }
    }) 

    // -- SEO采集管理
    .state('cms.seofeed', {
      url: '/seofeed',
      views: {
        '@': {templateUrl: 'tpl/cms/seofeed.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-cms.html'}
      }
    })

    .state('cms.seofeed.edit', {
      url: '/edit/:articleId',
      views: {
        '@': {
          templateUrl: 'tpl/cms/seo/edit.html',
          controller: function($scope, $stateParams) {
            $scope.articleId = $stateParams.articleId;
          }
        },
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-cms.html'}
      }
    })

    // -- 帮助管理
    .state('cms.help', {
      url: '/help',
      views: {
        '@': {templateUrl: 'tpl/cms/help.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-cms.html'}
      }
    })

    .state('cms.help.edit', {
      url: '/edit/:helpId',
      views: {
        '@': {
          templateUrl: 'tpl/cms/help/edit.html',
          controller: function($scope, $stateParams) {
            $scope.helpId = $stateParams.helpId;
          }
        },
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-cms.html'}
      }
    })

    // ===================
    // Ticket 工单管理
    // ===================

    .state('ticket', {
      url: '/ticket',
      views: {
        '': {},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-ticket.html'}
      }
    })

    .state('ticket.manage', {
      url: '/manage',
      views: {
        '@': {templateUrl: 'tpl/ticket/ticket.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-ticket.html'}
      }
    })

    .state('ticket.message', {
      url: '/message',
      views: {
        '@': {templateUrl: 'tpl/ticket/message-list.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-ticket.html'}
      }
    }) 

    // ===================
    // User 用户管理
    // ===================

    .state('user', {
      url: '/user',
      views: {
        '': {},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-user.html'}
      }
    })

    .state('user.info', {
      url: '/info',
      views: {
        '@': {templateUrl: 'tpl/user/user.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-user.html'}
      }
    })

    .state('user.add', {
      url: '/add',
      views: {
        '@': {
          templateUrl: 'tpl/user/add.html',
        },
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-user.html'}
      }
    })

    .state('user.notification', {
      url: '/notification',
      views: {
        '@': {
          templateUrl: 'tpl/user/notification.html',
        },
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-user.html'}
      }
    })

    // ===================
    // User 微信管理
    // ===================

    .state('wechat', {
      url: '/wechat',
      views: {
        '': {},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-wechat.html'}
      }
    })

    .state('wechat.client-service', {
      url: '/client-service',
      views: {
        '@': {templateUrl: 'tpl/wechat/wechat.html'},
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-wechat.html'}
      }
    })

    .state('wechat.add', {
      url: '/add',
      views: {
        '@': {
          templateUrl: 'tpl/wechat/add.html',
        },
        'sidebarLeft': {templateUrl: 'tpl/sidebar/sidebar-wechat.html'}
      }
    })

    ; // End of router


  $urlRouterProvider.otherwise('/home');

  NotificationProvider.setOptions({
    delay: 1500,
    startTop: 10,
    startLeft: 10,
    verticalSpacing: 20,
    horizontalSpacing: 20,
    positionX: 'right',
    positionY: 'bottom'
  });

});


var headerHeight = 41;

app.controller('winCtrl', ['$scope', 'ycsApi', 'appSettings', '$location', '$cookies', '$modal', '$timeout', '$rootScope', function(sc, ycsApi, appSettings, $location, $cookies, $modal, $timeout, $rootScope){

  sc.admin = {};

  sc.admin.username = 'unknown';

  sc.apiVer = appSettings.apiVer;
  sc.appVer = appSettings.appVer;

  sc.updateAdminInfo = function updateAdminInfo(){
    var adminObj = Util.Data.get('ycsAdminUser', 'local');
    if (adminObj){
      sc.admin.username = adminObj.username || 'unknown';
      sc.admin.adminId = adminObj.id;
      sc.admin.rank = adminObj.rank;
    }
  };

  sc.resizeHeight = function resizeHeight(){
    $('.fixed-win-height').css('height', Util.Win.h + 'px');
    $('.content-body-height').css('height', (Util.Win.h - headerHeight) + 'px');
  };

  // Global Logout
  sc.logout = function logout(){
    var ajaxUrl = 'admin/user/loginout';
    ycsApi.post(ajaxUrl, {});

    $timeout(function(){
      $cookies.remove('JSESSIONID');
      Util.Data.deleteStorage('ycsAdminUser', 'local');
      window.location.replace('../index.html');
    }, 500);
  };

  // Keep it here for now
  sc.goto = function gotoUrl(uri){
    var path = $location.absUrl();
    var dest = path + '/' + uri;
    window.location = dest;
  };

  sc.updateAdminInfo();

  sc.chgPwd = function chgPwd(adminId){
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'tpl/modal/chgAdminPsw.html',
      controller: 'chgAdminPswCtrl',
      size: 'md',
      keyboard: false,
      backdrop: 'static',
      resolve: {}
    });

    modalInstance.result.then(function (needsLogout) {
      sc.logout();
    });
  };

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    $timeout(function(){
      ycsApi.checkUserInfo();
    }, 500);
  });

}]);

app.directive('winResize', ['$window', function($window){
  var directiveDefObj = {
    name: 'watch',
    restrict: 'A',
    link: function($scope, iElm, iAttrs, controller) {
      var win = N.el($window);

      $scope.getWinMetrics = function getWinMetrics(){
        return {
          w: Util.Win.w,
          h: Util.Win.h
        };
      };

      $scope.$watch($scope.getWinMetrics, function(newValue, oldValue){
        $scope.resizeHeight();
      }, true);

      win.bind('resize', function(){
        $scope.$apply();
      });
    }
  };
  return directiveDefObj;
}]);

app.controller('chgAdminPswCtrl', ['$scope', 'ycsApi', '$modalInstance', function(sc, ycsApi, $modalInstance){
  sc.needsLogout = false;

  sc.cred = {};

  // sc.crypto = function crypto(info){
  //   var keyHex = CryptoJS.enc.Utf8.parse('progang');
  //   var result = CryptoJS.DES.encrypt(info, keyHex, {
  //     mode: CryptoJS.mode.ECB,
  //     padding: CryptoJS.pad.Pkcs7
  //   });
  //   return result.ciphertext.toString();
  // };

  sc.changeAdminCred = function changeAdminCred(credentials){
    var ajaxUrl = 'admin/updateUserPassword';

    var qData = {
      // oldPwd: sc.crypto(credentials.oldPwd),
      // newPwd: sc.crypto(credentials.newPwd)
      oldpassword: credentials.oldpassword,
      newpassword: credentials.newpassword,
      confirmpassword: credentials.confirmpassword
    };

    ycsApi.post(ajaxUrl, qData, sc.pswChanged);
  };

  sc.pswChanged = function pswChanged(data){
    if (data && data.status && data.status === '200'){
      sc.needsLogout = true;
    }
  };

  sc.toLogout = function toLogout(){
    $modalInstance.close(true);
    sc.closePswModal();
  };

  // Close Modal
  sc.closePswModal = function cancel() {
    $modalInstance.dismiss('cancel');
  };
}]);

})(window.angular, window.Neo, window.CryptoJS);