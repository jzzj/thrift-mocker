export default {
  chineseGenerator(){
    return wrapper(function(){
      return Array.apply(null, Array(randomRange(2, 8+ Math.pow(100, Number(this))))).map(i=>String.fromCharCode(randomRange(19968, 21869))).join(""); //40869
    }, ...arguments);
  },

  phoneGenerator(){
    return wrapper(function(){
      return "1" + Array.apply(null, Array(randomRange(10, 10))).map(i=>randomRange(0,9)).join("");
    }, ...arguments);
  },

  lettersGenerator(){
    return wrapper(function(){
      return Array.apply(null, Array(randomRange(10, 20 + Math.pow(100, Number(this))))).map(i=>String.fromCharCode(randomRange(65, 122))).join("") + 
           Array.apply(null, Array(randomRange(0, 3))).map(i=>String.fromCharCode(randomRange(48, 58))).join("");
    }, ...arguments);
  },

  numberGenerator(){
    return wrapper(function(){
      return randomRange(1, 100000 * Math.pow(100, Number(this)));
    }, ...arguments);
  },

  i64Generator(){
    return wrapper(function(){
      return randomRange(Math.pow(10, 4), Math.pow(10, 12));
    }, ...arguments);
  },

  priceGenerator(){
    return wrapper(function(){
      return randomRange(1, 10000 * Math.pow(100, Number(this)));
    }, ...arguments);
  },

  doubleGenerator(){
    return wrapper(function(){
      return randomRange(1, 1000000 * Math.pow(100, Number(this)))/100;
    }, ...arguments);
  },

  boolGenerator(){
    return Math.random() < 0.5;
  },

  urlGenerator(){

  },

  imageGenerator(){

  },

  enumGenerator(enums){
    return enums[randomRange(0, enums-1)];
  },

  timeGenerator(){
    return +new Date();
  }

}

function randomRange(min, max){
  return Math.round(Math.random() * (max - min)) + min;
}

function wrapper(func, isBoundary, ...rest){
  const condidates = [void 0, null];

  if(isBoundary){
    const useCondidates = Math.random() * 10 < 2;
    if(useCondidates){
      return condidates[Math.round(useCondidates)];
    }
  }
  return func.call(isBoundary, rest);
}