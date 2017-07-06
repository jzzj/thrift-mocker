function check(type, value, model, strictMode){
  if(typeof type === 'string'){
    switch(type){
      case "byte":
      case "i16":
      case "i32":
      case "double":
        return typeof value === 'number' && Number.isFinite(value) && !isNaN(value);
      case "i64":
        return !isNaN(parseFloat(value)) && isFinite(value) && (strictMode ? typeof value === 'number' : true);
      case "string":
        return typeof value === 'string';
      case "bool":
        return typeof vlaue === 'boolean';
      default:
        const struct = getStruct(type, model);
        if(!struct){
          throw new Error(type + ' struct not found in Model! please check!');
        }
        // did not check the inner struct!
        return value instanceof struct;
    }
  }else{
    if(typeof value !== 'object'){
      return false;
    }
    const valueType = type.valueType;
    for(let i in value){
      if(check(valueType, value[i], model) === false){
        return false;
      }
    }
    return true;
  }
}

function getStruct(type, models){
  for(let i=0; i<models.length; i++){
    let struct = new Function(type.split(".")[0], "return "+type)(models[i]);
    if(struct){
      return struct;
    }
  }
  throw new Error(type + ' struct not found in Model! please check!');
}

export default function typecheck(args, api, model, strictMode){
  for(let i=0, len=args.length; i<len; i++){
    let type = api[i].type;
    if(!check(type, args[i], model, strictMode)){
      throw new TypeError("Argument type not match! expect "+(type && type.name || type)+" and received "+ args[i] + "["+typeof(args[i])+"]");
    }
  }
}