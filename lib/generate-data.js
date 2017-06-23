"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generate;

var _helper = require("@utils/helper");

var _generator = require("./generator");

var generator = _interopRequireWildcard(_generator);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var mockData = {};
var generateBoundary = false;
function generate(type, ast, opts) {
  //console.log(type, JSON.stringify(ast, void 0 ,4), 'original-ast');
  var ret = type.split(".");
  if (ret.length > 1) {
    ast = ast.include[ret[0]];
  }

  var structItems = getStruct(ret.slice(1).join("."), ast).struct;

  mockData = opts.mockData;
  generateBoundary = !!opts.boundary;
  return (0, _helper.extend)(constructorData(structItems, ast), opts.commonData || {});
}

function constructorData(structItems, ast) {
  return structItems.reduce(function (ret, item, idx) {
    if (typeof item.type === 'string') {
      var result = doGenerate(item.name, item.type);
      if (result === -1) {
        var items = void 0;
        var _result = item.type.split(".");
        var innerAst = ast;
        //console.log("------", item.type,"||" , ast, 123123, "----");
        if (_result.length > 1) {
          var _ret = findModel(_result[0], ast);
          var model = _ret.model;
          if (model && model.struct) {
            items = model.struct[_result[1]];
          }
          //console.log("---ret---", ret, "||", items, "---ret---")
          innerAst = _ret.model;
        } else {
          items = innerAst.struct[item.type];
        }
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
          if (generateResult === -1) {
            var data = getStruct(valueType, ast);
            var _items = data.struct;
            //console.log("---list", valueType, "||", ast, "list---");
            ast = data.ast;
            for (var i = 0, len = Math.round(Math.random() * 20); i < len; i++) {
              _result2.push(constructorData(_items, ast));
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
    case "i32":
      return generator.numberGenerator(generateBoundary);
    case "i64":
      if (/date/i.test(name) || /time/i.test(name)) {
        return generator.timeGenerator(generateBoundary);
      } else {
        return generator.i64Generator(generateBoundary);
      }
    case "string":
      if (/name/i.test(name)) {
        return generator.chineseGenerator(generateBoundary);
      } else {
        return generator.lettersGenerator(generateBoundary);
      }
    case "double":
      return generator.doubleGenerator(generateBoundary);
    case "bool":
      return generator.boolGenerator(generateBoundary);
    default:
      return -1;
  }
}