const parser = require("./parser");
const typecheck = require("./typecheck");
const generate = require("./generate-data");
const fs = require('fs');

let cache = {};

export default function(options){
  if(!options || typeof options !== 'object'){
    throw new Error("Argument required!");
  }
  if(!options.service){
    throw new Error("Thrift service file is required!");
  }
  if(!fs.existsSync(options.service)){
    throw new Error("Thrift service file not found, please check!");
  }
  const ast = parser(options.service);
  
  const services = Object.keys(ast.service);
  if(services && services.length > 1 && !options.serviceName){
    throw new Error("Service file should only contains one service! please check!");
  }
  options.models = Array.isArray(options.models) ? options.models : [options.models];
  const service = options.serviceName ? ast.service[options.serviceName] : ast.service[services[0]];

  return {
    exec(Service, methodName, ...args){
      const method = service[methodName];
      if(!method){
        throw new Error(methodName + " not found in Service! please check!");
      }
      if(args.length !== method.args.length){
        throw new Error("Arguments length not match! expect "+method.args.length+" and received "+args.length+"!");
      }
      typecheck(args, method.args, options.models);
      return new Promise((resolve, reject)=>{
        try{
          const data = generate(method.type, ast, {
            mockData: options.mockData && options.mockData[methodName] || {},
            commonData: options.commonData
          });
          if(options.cache){
            const cacheKey = methodName+JSON.stringify(args);
            if(cache[cacheKey]){
              resolve(cache[cacheKey]);
            }else{
              cache[cacheKey] = data;
            }
          }
          resolve(data);
        }catch(e){
          reject(e);
        }
      });
    }
  }
}