import { extend } from "./utils/helper";
import * as generator from './generator';

var mockData = {};
var generateBoundary = false;
export default function generate(type, ast, opts){
  //console.log(type, JSON.stringify(ast, void 0 ,4), 'original-ast');
  var ret = type.split(".");
  if(ret.length > 1){
    ast = ast.include[ret[0]];
  }

  let structItems = getStruct(ret.slice(1).join("."), ast).struct;

  mockData = opts.mockData;
  generateBoundary = !!opts.boundary;
  return extend(constructorData(structItems, ast), opts.commonData || {});
}

function constructorData(structItems, ast){
  return structItems.reduce((ret, item, idx)=>{
    if(typeof item.type === 'string'){
      const result = doGenerate(item.name, item.type);
      if(result === -1){
        let items;
        let result = item.type.split(".");
        let innerAst = ast;
        //console.log("------", item.type,"||" , ast, 123123, "----");
        if(result.length > 1){
          let ret = findModel(result[0], ast);
          let model = ret.model;
          if(model && model.struct){
            items = model.struct[result[1]];
          }
          //console.log("---ret---", ret, "||", items, "---ret---")
          innerAst = ret.model;
        }else{
          items = innerAst.struct[item.type];
        }
        ret[item.name] = constructorData(items, innerAst);
      }else{
        ret[item.name] = result;
      }
    }else{
      const valueType = item.type.valueType;
      let result = [];
      switch(item.type.name){
        case "set":
        case "list":
          const generateResult = doGenerate(item.name, valueType);
          if(generateResult === -1){
            const data = getStruct(valueType, ast);
            const items = data.struct;
            //console.log("---list", valueType, "||", ast, "list---");
            ast = data.ast;
            for(let i=0, len=Math.round(Math.random()*20); i<len; i++){
              result.push(constructorData(items, ast));
            }
            ret[item.name] = result;
          }else{
            ret[item.name] = [generateResult];
          }
          break;
        case "map":
          // TODO, 未实现
          break;
      }
    }
    const mock = mockData[item.name];
    if(mock){
      ret[item.name] = typeof(mock) === 'function' ? mock(idx) : mock;
    }
    return ret;
  }, {})
}

function getStruct(type, ast){
  let ret = type.split(".");
  if(ret.length > 1){
    ast = ast.include[ret[0]];
    return getStruct(ret.slice(1).join("."), ast);
  }else{
    return {
      struct: ast.struct[type],
      ast
    };
  }
}

function findModel(model, ast){
  if(ast.include){
    if(ast && ast.include &&ast.include[model]){
      return {
        model: ast.include[model],
        ast
      };
    }
    for(let i in ast.include){
      const ret = findModel(model, ast.include[i]);
      if(ret !== null){
        return ret;
      }
    }
  }
  return null;
}

function doGenerate(name, type){
  switch(type){
    case "i32":
      return generator.numberGenerator(generateBoundary);
    case "i64":
      if(/date/i.test(name) || /time/i.test(name)){
        return generator.timeGenerator(generateBoundary);
      }else{
        return generator.i64Generator(generateBoundary);
      }
    case "string":
      if(/name/i.test(name)){
        return generator.chineseGenerator(generateBoundary);
      }else{
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
