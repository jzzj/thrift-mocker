"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = typecheck;
function check(type, value, model) {
  if (typeof type === 'string') {
    switch (type) {
      case "i16":
      case "i32":
      case "i64":
      case "double":
        return typeof value === 'number' && Number.isFinite(value) && !isNaN(value);
      case "string":
        return typeof value === 'string';
      case "bool":
        return typeof vlaue === 'boolean';
      default:
        var struct = getStruct(type, model);
        if (!struct) {
          throw new Error(type + ' struct not found in Model! please check!');
        }
        // did not check the inner struct!
        return value instanceof struct;
    }
  } else {
    if ((typeof value === "undefined" ? "undefined" : _typeof(value)) !== 'object') {
      return false;
    }
    var valueType = type.valueType;
    for (var i in value) {
      if (check(valueType, value[i], model) === false) {
        return false;
      }
    }
    return true;
  }
}

function getStruct(type, models) {
  for (var i = 0; i < models.length; i++) {
    var struct = new Function(type.split(".")[0], "return " + type)(models[i]);
    if (struct) {
      return struct;
    }
  }
  throw new Error(type + ' struct not found in Model! please check!');
}

function typecheck(args, api, model) {
  for (var i = 0, len = args.length; i < len; i++) {
    var type = api[i].type;
    if (!check(type, args[i], model)) {
      throw new Error("Argument type not match! expect " + (type && type.name || type) + " and received " + args[i] + "[" + _typeof(args[i]) + "]");
    }
  }
}
module.exports = exports["default"];