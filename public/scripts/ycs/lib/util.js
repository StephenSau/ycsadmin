(function(N){

'use strict';

var ng = window.angular;
var Util = {};

/*====================
  Get Window Metrics
  ====================*/

var windowMetrics = {
  get w() {return window.innerWidth;},
  get h() {return window.innerHeight;}
};


/*====================
  Object Sorting
  ====================*/


var obj = {

  getProperty: function getObjProperty(object, property){
    if (!object.hasOwnProperty(property)){
      return false;
    } else {
      return Object.getOwnPropertyDescriptor(object, property).value;
    }
  },

  sorting: function objectSorting(object, property, order){
    var isDesc = order.toLowerCase() === 'desc' ? true : false;

    object.sort(function(a,b){
      var aValue = Util.Obj.getProperty(a,property),
          bValue = Util.Obj.getProperty(b,property);

      if (aValue < bValue){
        return isDesc ? 1 : -1;
      } else if (aValue > bValue) {
        return isDesc ? -1 : 1;
      }
      return 0;
    });

    return object;
  }

};



/*====================
  Data Manager
  ====================*/

var dataManager = {

  // Check HTML5 Storage support
  support: function checkStorageSupport(){
    return (typeof(Storage) !== 'undefined');
  },

  // Set Storage Location, defaults to sessionStorage
  storeLoc: function parseHTML5StorageLocation(type){
    if (type && type === 'local'){
      return localStorage;
    } else {
      return sessionStorage;
    }
  },

  // Perform Storage
  store: function storeHTML5Data(key, data, type){
    var storageLoc = this.storeLoc(type);
    if (this.support){
      storageLoc[key] = JSON.stringify(data);
      storageLoc[key + '-updated'] = (new Date()).getTime();
    }
  },

  // Get Data
  get: function getStoredHTML5Data(key, type){
    var storageLoc = this.storeLoc(type);
    if (storageLoc[key]){
      return JSON.parse(storageLoc[key]);
    } else {
      return;
    }
  },

  deleteStorage: function deleteStoredHTML5Data(key, type){
    var storageLoc = this.storeLoc(type);
    if (storageLoc[key]){
      storageLoc.removeItem(key);
      if (storageLoc[key + '-updated']){
        storageLoc.removeItem(key + '-updated');
      }
    } else {
      return;
    }
  },

  // Parse a jQuery object's innerHTML into JSON
  htmlToJSON: function parseJQueryObjToJSON(jqObj, target){
    jqObj.forEach(function(child, childIdx) {
      target[childIdx] = child.outerHTML;
    });
  },

  // Parse a jQuery object's innerHTML into plain String
  htmlToString: function parseJQueryObjToSring(jqObj){
    var result = '';
    jqObj.forEach(function(child) {
      result += child.outerHTML;
    });
    return result;
  },

  // Parse object to JSON
  objToJSON: function parseJsObjToJSON(obj){
    var seen = [];
    var result = JSON.stringify(obj, function(key, val) {
      if (val !== null && typeof val === 'object') {
        if (seen.indexOf(val) >= 0)  {
          return;
        }
        seen.push(val);
      }
      return val;
    });
    return JSON.parse(result);
  }

};


var Transition = function(target, className, duration){
  var $target = ng.element(target).addClass(className);

  window.setTimeout(function(){
    $target.removeClass(className);
  }, (duration || 500));
};


Util = {
  Win: windowMetrics,
  Data: dataManager,
  Transition: Transition,
  Obj: obj
};

N.Lib.Util = Util;

N.el = ng.element;

N.$ = function(selector){
  return ng.element(document.querySelectorAll(selector));
};


}(window.Neo));