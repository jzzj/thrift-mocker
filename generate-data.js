import { extend } from "@utils/helper";
import * as generator from './generator';

var mockData = {};
export default function generate(type, ast, opts){
  //console.log(type, JSON.stringify(ast, void 0 ,4), 'original-ast');
  var ret = type.split(".");
  if(ret.length > 1){
    ast = ast.include[ret[0]];
  }

  let structItems = getStruct(ret.slice(1).join("."), ast).struct;

  mockData = opts.mockData;
  return extend(constructorData(structItems, ast), opts.commonData || {});
}

function constructorData(structItems, ast){
  return structItems.reduce((ret, item, idx)=>{
    if(typeof item.type === 'string'){
      switch(item.type){
        case "i32":
        case "i64":
          ret[item.name] = Math.round(Math.random()*99999);
          break;
        case "string":
          ret[item.name] = generator.lettersGenerator();
          break;
        case "double":
          ret[item.name] = generator.doubleGenerator();
          break;
        case "bool":
          ret[item.name] = Math.random() > 0.5;
          break;
        default:
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
          break;
      }
    }else{
      const valueType = item.type.valueType;
      let result = [];
      switch(item.type.name){
        case "set":
        case "list":
          switch(valueType){
            case "i32":
            case "i64":
              ret[item.name] = [Math.round(Math.random()*99999)];
              break;
            case "double":
              ret[item.name] = [generator.doubleGenerator()];
              break;
            case "string":
              ret[item.name] = [generator.lettersGenerator()];
              break;
            case "bool":
              ret[item.name] = [Math.random() > 0.5];
              break;
            default:
              const data = getStruct(valueType, ast);
              const items = data.struct;
              //console.log("---list", valueType, "||", ast, "list---");
              ast = data.ast;
              for(let i=0, len=Math.round(Math.random()*20); i<len; i++){
                result.push(constructorData(items, ast));
              }
              ret[item.name] = result;
              break;
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
