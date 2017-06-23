"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  chineseGenerator: function chineseGenerator() {
    return wrapper.apply(undefined, [function () {
      return Array.from(Array(randomRange(2, 8 + Math.pow(100, Number(this))))).map(function (i) {
        return String.fromCharCode(randomRange(19968, 21869));
      }).join(""); //40869
    }].concat(Array.prototype.slice.call(arguments)));
  },
  phoneGenerator: function phoneGenerator() {
    return wrapper.apply(undefined, [function () {
      return "1" + Array.from(Array(randomRange(10, 10))).map(function (i) {
        return randomRange(0, 9);
      }).join("");
    }].concat(Array.prototype.slice.call(arguments)));
  },
  lettersGenerator: function lettersGenerator() {
    return wrapper.apply(undefined, [function () {
      return Array.from(Array(randomRange(10, 20 + Math.pow(100, Number(this))))).map(function (i) {
        return String.fromCharCode(randomRange(65, 122));
      }).join("") + Array.from(Array(randomRange(0, 3))).map(function (i) {
        return String.fromCharCode(randomRange(48, 58));
      }).join("");
    }].concat(Array.prototype.slice.call(arguments)));
  },
  numberGenerator: function numberGenerator() {
    return wrapper.apply(undefined, [function () {
      return randomRange(1, 100000 * Math.pow(100, Number(this)));
    }].concat(Array.prototype.slice.call(arguments)));
  },
  i64Generator: function i64Generator() {
    return wrapper.apply(undefined, [function () {
      return randomRange(Math.pow(10, 4), Math.pow(10, 12));
    }].concat(Array.prototype.slice.call(arguments)));
  },
  priceGenerator: function priceGenerator() {
    return wrapper.apply(undefined, [function () {
      return randomRange(1, 10000 * Math.pow(100, Number(this)));
    }].concat(Array.prototype.slice.call(arguments)));
  },
  doubleGenerator: function doubleGenerator() {
    return wrapper.apply(undefined, [function () {
      return randomRange(1, 1000000 * Math.pow(100, Number(this))) / 100;
    }].concat(Array.prototype.slice.call(arguments)));
  },
  boolGenerator: function boolGenerator() {
    return Math.random() < 0.5;
  },
  urlGenerator: function urlGenerator() {},
  imageGenerator: function imageGenerator() {},
  enumGenerator: function enumGenerator(enums) {
    return enums[randomRange(0, enums - 1)];
  },
  timeGenerator: function timeGenerator() {
    return +new Date();
  }
};


function randomRange(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

function wrapper(func, isBoundary) {
  var condidates = [void 0, null];

  if (isBoundary) {
    var useCondidates = Math.random() * 10 < 2;
    if (useCondidates) {
      return condidates[Math.round(useCondidates)];
    }
  }

  for (var _len = arguments.length, rest = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    rest[_key - 2] = arguments[_key];
  }

  return func.call(isBoundary, rest);
}
module.exports = exports["default"];