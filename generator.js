export default {
  chineseGenerator(){
    return Array.from(Array(randomRange(2, 8))).map(i=>String.fromCharCode(randomRange(19968, 20869))).join(""); //40869
  },

  phoneGenerator(){
    return "1" + Array.from(Array(randomRange(10, 10))).map(i=>randomRange(0,9)).join("");
  },

  lettersGenerator(){
    return Array.from(Array(randomRange(10, 20))).map(i=>String.fromCharCode(randomRange(65, 122))).join("") + 
           Array.from(Array(randomRange(0, 3))).map(i=>String.fromCharCode(randomRange(48, 58))).join("");
  },

  priceGenerator(){
    return randomRange(1, 10000);
  },

  doubleGenerator(){
    return randomRange(1, 1000000)/100;
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
  }

}

function randomRange(min, max){
  return Math.round(Math.random() * (max - min)) + min;
}