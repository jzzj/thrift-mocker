"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var helper = {
  extend: function extend(src, data) {
    if ((typeof src === "undefined" ? "undefined" : _typeof(src)) !== "object") {
      throw new Error("require arguments to be object!");
    }
    if ((typeof data === "undefined" ? "undefined" : _typeof(data)) !== "object") {
      throw new Error("require arguments to be object!");
    }

    for (var key in data) {
      var cur = data[key];
      if (!Array.isArray(cur) && cur != null && _typeof(src[key]) === 'object' && (typeof cur === "undefined" ? "undefined" : _typeof(cur)) === 'object') {
        if (src[key] == null) {
          src[key] = {};
        }
        helper.extend(src[key], cur);
      } else {
        src[key] = cur;
      }
    }
    return src;
  },


  deepClone: function () {
    var arr = [];
    return function (src, data) {
      if ((typeof src === "undefined" ? "undefined" : _typeof(src)) !== "object") {
        throw new Error("require arguments to be object!");
      }
      if ((typeof data === "undefined" ? "undefined" : _typeof(data)) !== "object") {
        throw new Error("require arguments to be object!");
      }
      if (arr.indexOf(src) !== -1) {
        window.__objs = arr;
        throw new Error("Circular dependency detected");
      }
      if (arr.indexOf(data) !== -1) {
        window.__objs = arr;
        throw new Error("Circular dependency detected");
      }
      var srcIdx = arr.length;
      arr.push(src);
      var dataIdx = arr.length;
      arr.push(data);
      for (var key in data) {
        var temp = data[key];
        if (temp == null) {
          src[key] = null;
        } else if ((typeof temp === "undefined" ? "undefined" : _typeof(temp)) === 'object') {
          if (_typeof(src[key]) !== 'object') {
            src[key] = Array.isArray(temp) ? [] : {};
          }
          helper.deepClone(src[key], temp);
        } else {
          src[key] = temp;
        }
      }
      arr.splice(dataIdx, 1);
      arr.splice(srcIdx, 1);
      return src;
    };
  }(),

  flatten: function flatten(obj) {
    var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (parentKey, key) {
      return parentKey + "." + key;
    };
    var parentKey = arguments[2];
    var parent = arguments[3];

    for (var key in obj) {
      var temp = obj[key];
      if ((typeof temp === "undefined" ? "undefined" : _typeof(temp)) === 'object') {
        if (parent != null) {
          helper.flatten(temp, cb, cb(parentKey, key), parent); // append to root obj and fix key of prop.
        } else {
          helper.flattern(temp, cb, key, obj);
        }
        delete obj[key];
      } else if (parent != null) {
        var propKey = parentKey == null ? key : cb(parentKey, key);
        parent[propKey] = temp;
      }
    }
    return obj;
  },
  setValue: function setValue(obj, key, value) {
    var keys = key.split("."),
        len = keys.length;
    for (var i = 0; i < len; i++) {
      var tempKey = keys[i];
      var temp = obj[tempKey];
      if (i === len - 1) {
        obj[tempKey] = value;
      } else if ((typeof temp === "undefined" ? "undefined" : _typeof(temp)) === "object") {
        obj = temp;
      } else {
        obj = obj[tempKey] = {};
      }
    }
    return obj;
  },
  objectArrayFilter: function objectArrayFilter(key) {
    var result = [];
    var ids = [];

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    args.forEach(function (arr) {
      if (Array.isArray(arr)) {
        arr.forEach(function (item) {
          var id = item[key];
          if (ids.indexOf(id) === -1) {
            ids.push(id);
            result.push(item);
          }
        });
      }
    });
    return result;
  },
  arrayFlatten: function arrayFlatten(arr) {
    var result = [];
    var arrIdx = 0;
    for (var i = 0, len = arr.length; i < len; i++) {
      var tmp = arr[arrIdx];
      if (Array.isArray(tmp)) {
        result = result.concat(tmp);
        len += tmp.length - 1;
        i += tmp.length - 1;
      } else {
        result[i] = tmp;
      }
      arrIdx++;
    }
    return result;
  }
};

exports.default = helper;
module.exports = exports["default"];