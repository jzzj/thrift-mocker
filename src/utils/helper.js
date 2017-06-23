const helper = {
  extend(src, data){
    if(typeof src !== "object"){
      throw new Error("require arguments to be object!");
    }
    if(typeof data !== "object"){
      throw new Error("require arguments to be object!");
    }

    for(let key in data){
      let cur = data[key];
      if(!Array.isArray(cur) && cur != null && typeof src[key] === 'object' && typeof cur === 'object'){
        if(src[key] == null){
          src[key] = {};
        }
        helper.extend(src[key], cur);
      }else{
        src[key] = cur;
      }
    }
    return src;
  },

  deepClone: (function(){
    let arr = [];
    return function(src, data){
      if(typeof src !== "object"){
        throw new Error("require arguments to be object!");
      }
      if(typeof data !== "object"){
        throw new Error("require arguments to be object!");
      }
      if(arr.indexOf(src)!==-1){
        window.__objs = arr;
        throw new Error("Circular dependency detected");
      }
      if(arr.indexOf(data)!==-1){
        window.__objs = arr;
        throw new Error("Circular dependency detected");
      }
      const srcIdx = arr.length;
      arr.push(src);
      const dataIdx = arr.length;
      arr.push(data);
      for(let key in data){
        let temp = data[key];
        if(temp == null){
          src[key] = null;
        }else if(typeof temp==='object'){
          if(typeof src[key] !== 'object'){
            src[key] = Array.isArray(temp) ? [] : {};
          }
          helper.deepClone(src[key], temp);
        }else{
          src[key] = temp;
        }
      }
      arr.splice(dataIdx, 1);
      arr.splice(srcIdx, 1);
      return src;
    }
  })(),

  flatten(obj, cb=(parentKey, key)=>parentKey+"."+key, parentKey, parent){
    for(let key in obj){
      let temp = obj[key];
      if(typeof temp==='object'){
        if(parent != null){
          helper.flatten(temp, cb, cb(parentKey, key), parent);  // append to root obj and fix key of prop.
        }else{
          helper.flattern(temp, cb, key, obj);
        }
        delete obj[key];
      }else if(parent != null){
        let propKey = parentKey == null ? key : cb(parentKey, key);
        parent[propKey] = temp;
      }
    }
    return obj;
  },

  setValue(obj, key, value){
    const keys = key.split("."),
      len = keys.length;
    for(let i=0; i<len; i++){
      let tempKey = keys[i];
      let temp = obj[tempKey];
      if(i === len-1){
        obj[tempKey] = value;
      }else if(typeof temp==="object"){
        obj = temp;
      }else{
        obj = obj[tempKey] = {};
      }
    }
    return obj;
  },

  objectArrayFilter(key, ...args){
    let result = [];
    let ids = [];
    args.forEach(arr=>{
      if(Array.isArray(arr)){
        arr.forEach(item=>{
          const id = item[key];
          if(ids.indexOf(id)===-1){
            ids.push(id);
            result.push(item);
          }
        })
      }
    });
    return result;
  },

  arrayFlatten(arr){
    let result = [];
    let arrIdx = 0;
    for(let i=0, len=arr.length; i<len; i++){
      let tmp = arr[arrIdx];
      if(Array.isArray(tmp)){
        result = result.concat(tmp);
        len += tmp.length -1;
        i += tmp.length -1;
      }else{
        result[i] = tmp;
      }
      arrIdx++;
    }
    return result;
  }
};

export default helper;
