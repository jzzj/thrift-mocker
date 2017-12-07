"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generate;

var _helper = require("./utils/helper");

var _generator = require("./generator");

var _generator2 = _interopRequireDefault(_generator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UNMATCHED = {};
var mockData = {};
var generateBoundary = false;
function generate(type, ast, opts) {
  var ret = type.split(".");
  if (ret.length > 1) {
    ast = ast.include[ret[0]];
  }

  var result = constructorPrimitive(type);
  if (result !== UNMATCHED) {
    return result;
  }

  var structItems = getStruct(ret.slice(1).join(".") || (ret.length === 1 ? ret[0] : type), ast).struct;

  mockData = opts.mockData;
  generateBoundary = !!opts.boundary;
  return (0, _helper.extend)(constructorData(structItems, ast), opts.commonData || {});
}

function constructorPrimitive(type) {
  return doGenerate('', type);
}

function constructorData(structItems, ast) {
  return structItems.reduce(function (ret, item, idx) {
    if (typeof item.type === 'string') {
      var result = doGenerate(item.name, item.type);
      if (result === UNMATCHED) {
        var items = void 0;
        var _result = item.type.split(".");
        var innerAst = ast;
        if (_result.length > 1) {
          var _ret = findModel(_result[0], ast);
          var model = _ret.model;
          if (model && model.struct) {
            items = model.struct[_result[1]];
          }
          innerAst = _ret.model;
        } else {
          items = innerAst.struct[item.type];
        }
        extendModels(innerAst, ast);
        ret[item.name] = constructorData(items, innerAst);
      } else {
        ret[item.name] = result;
      }
    } else {
      var valueType = item.type.valueType;
      var _result2 = [];
      switch (item.type.name) {
        case "set":
        case "list":
          var generateResult = doGenerate(item.name, valueType);
          if (generateResult === UNMATCHED) {
            var data = getStruct(valueType, ast);
            var _items = data.struct;
            var _innerAst = data.ast;
            extendModels(_innerAst, ast);
            for (var i = 0, len = Math.round(Math.random() * 20); i < len; i++) {
              _result2.push(constructorData(_items, _innerAst));
            }
            ret[item.name] = _result2;
          } else {
            ret[item.name] = [generateResult];
          }
          break;
        case "map":
          // TODO, 未实现
          break;
      }
    }
    var mock = mockData[item.name];
    if (mock) {
      ret[item.name] = typeof mock === 'function' ? mock(idx) : mock;
    }
    return ret;
  }, {});
}

function getStruct(type, ast) {
  var ret = type.split(".");
  if (ret.length > 1) {
    ast = ast.include[ret[0]];
    return getStruct(ret.slice(1).join("."), ast);
  } else {
    return {
      struct: ast.struct[type],
      ast: ast
    };
  }
}

function extendModels(innerAst, outerAst) {
  if (innerAst && outerAst && outerAst.include) {
    innerAst.include = innerAst.include || {};
    for (var model in outerAst.include) {
      if (!innerAst.include[model]) {
        innerAst.include[model] = outerAst.include[model];
      }
    }
  }
}

function findModel(model, ast) {
  if (ast.include) {
    if (ast && ast.include && ast.include[model]) {
      return {
        model: ast.include[model],
        ast: ast
      };
    }
    for (var i in ast.include) {
      var ret = findModel(model, ast.include[i]);
      if (ret !== null) {
        return ret;
      }
    }
  }
  return null;
}

function doGenerate(name, type) {
  switch (type) {
    case "i16":
    case "i32":
      return _generator2.default.numberGenerator(generateBoundary);
    case "i64":
      if (/date/i.test(name) || /time/i.test(name)) {
        return _generator2.default.timeGenerator(generateBoundary);
      } else {
        return _generator2.default.i64Generator(generateBoundary);
      }
    case "string":
      if (/name/i.test(name)) {
        return _generator2.default.chineseGenerator(generateBoundary);
      } else {
        return _generator2.default.lettersGenerator(generateBoundary);
      }
    case "double":
      return _generator2.default.doubleGenerator(generateBoundary);
    case "bool":
    case "boolean":
      return _generator2.default.boolGenerator(generateBoundary);
    default:
      return UNMATCHED;
  }
}
module.exports = exports["default"];