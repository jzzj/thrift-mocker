"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function (options) {
  if (!options || (typeof options === "undefined" ? "undefined" : _typeof(options)) !== 'object') {
    throw new Error("Argument required!");
  }
  if (!options.service) {
    throw new Error("Thrift service file is required!");
  }
  if (!fs.existsSync(options.service)) {
    throw new Error("Thrift service file not found, please check!");
  }
  var ast = (0, _parser2.default)(options.service);

  var services = Object.keys(ast.service);
  if (services && services.length > 1 && !options.serviceName) {
    throw new Error("Service file should only contains one service! please check!");
  }
  options.models = Array.isArray(options.models) ? options.models : [options.models];
  var service = options.serviceName ? ast.service[options.serviceName] : ast.service[services[0]];

  var mocker = {
    exec: function exec(Service, methodName) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      var method = service[methodName];
      if (!method) {
        throw new Error(methodName + " not found in Service! please check!");
      }
      if (args.length !== method.args.length) {
        throw new Error("Arguments length not match! expect " + method.args.length + " and received " + args.length + "!");
      }
      (0, _typecheck2.default)(args, method.args, options.models, !!options.strictMode, !!options.typeLoose);
      return new Promise(function (resolve, reject) {
        try {
          var data = (0, _generateData2.default)(method.type, ast, {
            mockData: options.mockData && options.mockData[methodName] || {},
            commonData: options.commonData,
            boundary: options.boundary
          });
          if (options.cache) {
            var cacheKey = methodName + JSON.stringify(args);
            if (cache[cacheKey]) {
              resolve(cache[cacheKey]);
            } else {
              cache[cacheKey] = data;
            }
          }
          resolve(data);
        } catch (e) {
          reject(e);
        }
      });
    }
  };

  var _loop = function _loop(key) {
    if (service.hasOwnProperty(key) && key !== 'exec') {
      mocker[key] = function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        if (options.treatArgumentsAsObject && args[0] instanceof Object) {
          var argsObject = args[0];
          var namingArgs = service[key].args;
          var finalArgs = [];
          for (var i = 0, len = namingArgs.length; i < len; i++) {
            var arg = argsObject[namingArgs[i].name];
            finalArgs.push(arg);
          }
          args = finalArgs;
        }
        console.log([null, key].concat(args));
        return mocker.exec.apply(mocker, [null, key].concat(args));
      };
    }
  };

  for (var key in service) {
    _loop(key);
  }
  return mocker;
};

var _parser = require("./parser");

var _parser2 = _interopRequireDefault(_parser);

var _typecheck = require("./typecheck");

var _typecheck2 = _interopRequireDefault(_typecheck);

var _generateData = require("./generate-data");

var _generateData2 = _interopRequireDefault(_generateData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');

var cache = {};

module.exports = exports["default"];