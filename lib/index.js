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
  var ast = parser(options.service);

  var services = Object.keys(ast.service);
  if (services && services.length > 1 && !options.serviceName) {
    throw new Error("Service file should only contains one service! please check!");
  }
  options.models = Array.isArray(options.models) ? options.models : [options.models];
  var service = options.serviceName ? ast.service[options.serviceName] : ast.service[services[0]];

  return {
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
      typecheck(args, method.args, options.models);
      return new Promise(function (resolve, reject) {
        try {
          var data = generate(method.type, ast, {
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
};

var parser = require("./parser");
var typecheck = require("./typecheck");
var generate = require("./generate-data");
var fs = require('fs');

var cache = {};