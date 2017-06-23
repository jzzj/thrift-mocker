'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var ThriftFileParsingError = function (_Error) {
  _inherits(ThriftFileParsingError, _Error);

  function ThriftFileParsingError(message) {
    _classCallCheck(this, ThriftFileParsingError);

    var _this = _possibleConstructorReturn(this, (ThriftFileParsingError.__proto__ || Object.getPrototypeOf(ThriftFileParsingError)).call(this, message));

    _this.name = 'THRIFT_FILE_PARSING_ERROR';
    return _this;
  }

  return ThriftFileParsingError;
}(Error);

var fs = require('fs');

module.exports = function parser(file) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var buffer = fs.readFileSync(file, { encoding: "utf-8" });

  buffer = new Buffer(buffer);

  var readAnyOne = function readAnyOne() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var beginning = offset;
    for (var i = 0; i < args.length; i++) {
      try {
        return args[i]();
      } catch (ignore) {
        offset = beginning;
        continue;
      }
    }
    offset = beginning;
    throw 'Unexcepted Token';
  };

  var readUntilThrow = function readUntilThrow(transaction, key) {
    var receiver = key ? {} : [];
    var beginning = void 0;
    for (;;) {
      try {
        beginning = offset;
        var result = transaction();
        key ? receiver[result[key]] = result : receiver.push(result);
      } catch (ignore) {
        offset = beginning;
        return receiver;
      }
    }
  };

  var readKeyword = function readKeyword(word) {
    for (var i = 0; i < word.length; i++) {
      if (buffer[offset + i] !== word.charCodeAt(i)) {
        throw 'Unexpected token "' + word + '"';
      }
    }
    offset += word.length;
    readSpace();
    return word;
  };

  var readCharCode = function readCharCode(code) {
    if (buffer[offset] !== code) throw 'Unexpected charCode';
    offset++;
    readSpace();
    return code;
  };

  var readNoop = function readNoop() {};

  var readCommentMultiple = function readCommentMultiple() {
    var i = 0;
    if (buffer[offset + i++] !== 47 || buffer[offset + i++] !== 42) return false;
    do {
      while (offset + i < buffer.length && buffer[offset + i++] !== 42) {}
    } while (offset + i < buffer.length && buffer[offset + i] !== 47);
    offset += i + 1;
    return true;
  };

  var readCommentSharp = function readCommentSharp() {
    var i = 0;
    if (buffer[offset + i++] !== 35) return false;
    while (buffer[offset + i] !== 10 && buffer[offset + i] !== 13) {
      offset++;
    }offset += i;
    return true;
  };

  var readCommentDoubleSlash = function readCommentDoubleSlash() {
    var i = 0;
    if (buffer[offset + i++] !== 47 || buffer[offset + i++] !== 47) return false;
    while (buffer[offset + i] !== 10 && buffer[offset + i] !== 13) {
      offset++;
    }offset += i;
    return true;
  };

  var readSpace = function readSpace() {
    for (;;) {
      var byte = buffer[offset];
      if (byte === 13 || byte === 10 || byte === 32 || byte === 9) {
        offset++;
      } else {
        if (!readCommentMultiple() && !readCommentSharp() && !readCommentDoubleSlash()) return;
      }
    }
  };

  var readComma = function readComma() {
    if (buffer[offset] === 44 || buffer[offset] === 59) {
      // , or ;
      offset++;
      readSpace();
      return ',';
    }
  };

  var readTypedef = function readTypedef() {
    var subject = readKeyword('typedef');
    var type = readType();
    var name = readName();
    return { subject: subject, type: type, name: name };
  };

  var readType = function readType() {
    return readAnyOne(readTypeMap, readTypeList, readTypeNormal);
  };

  var readTypeMap = function readTypeMap() {
    var name = readName();
    readCharCode(60); // <
    var keyType = readType();
    readComma();
    var valueType = readType();
    valueType = readProps(valueType);
    readCharCode(62); // >
    return { name: name, keyType: keyType, valueType: valueType };
  };

  var readTypeList = function readTypeList() {
    var name = readName();
    readCharCode(60); // <
    var valueType = readType();
    valueType = readProps(valueType);
    readCharCode(62); // >
    return { name: name, valueType: valueType };
  };

  var readTypeNormal = function readTypeNormal() {
    return readName();
  };

  var readName = function readName() {
    var i = 0;
    var result = [];
    var byte = buffer[offset];
    while (byte >= 97 && byte <= 122 || // a-z
    byte === 95 || // _
    byte >= 65 && byte <= 90 || // A-Z
    byte >= 48 && byte <= 57 // 0-9
    ) {
      byte = buffer[offset + ++i];
    }if (i === 0) throw 'Unexpected token';
    var value = buffer.toString('utf8', offset, offset += i);
    readSpace();
    return value;
  };

  var readNumberValue = function readNumberValue() {
    var result = [];
    for (;;) {
      var byte = buffer[offset];
      if (byte >= 48 && byte <= 57 || byte === 45 || byte === 46) {
        offset++;
        result.push(byte);
      } else {
        if (result.length) {
          readSpace();
          return +String.fromCharCode.apply(String, result);
        } else {
          throw 'Unexpected token ' + String.fromCharCode(byte);
        }
      }
    }
  };

  var readBooleanValue = function readBooleanValue() {
    return JSON.parse(readAnyOne(function () {
      return readKeyword('true');
    }, function () {
      return readKeyword('false');
    }));
  };

  var readRefValue = function readRefValue() {
    var list = [readName()];
    readUntilThrow(function () {
      readCharCode(46); // .
      list.push(readName());
    });
    return { '=': list };
  };

  var readStringValue = function readStringValue() {
    var receiver = [];
    var start = void 0;
    for (;;) {
      var byte = buffer[offset++];
      if (receiver.length) {
        if (byte === start) {
          // " or '
          receiver.push(byte);
          readSpace();
          return new Function('return ' + String.fromCharCode.apply(String, receiver))();
        } else if (byte === 92) {
          // \
          receiver.push(byte);
          offset++;
          receiver.push(buffer[offset++]);
        } else {
          receiver.push(byte);
        }
      } else {
        if (byte === 34 || byte === 39) {
          // " or '
          start = byte;
          receiver.push(byte);
        } else {
          throw 'Unexpected token ILLEGAL';
        }
      }
    }
  };

  var readListValue = function readListValue() {
    readCharCode(91); // [
    var list = readUntilThrow(function () {
      var value = readValue();
      readComma();
      return value;
    });
    readCharCode(93); // ]
    return list;
  };

  var readMapValue = function readMapValue() {
    readCharCode(123); // {
    var list = readUntilThrow(function () {
      var key = readValue();
      readCharCode(58); // :
      var value = readValue();
      readComma();
      return { key: key, value: value };
    });
    readCharCode(125); // }
    return list;
  };

  var readValue = function readValue() {
    return readAnyOne(readNumberValue, readStringValue, readBooleanValue, readListValue, readMapValue, readRefValue);
  };

  var readConst = function readConst() {
    var subject = readKeyword('const');
    var type = readType();
    var name = readName();
    var value = readAssign();
    return { subject: subject, type: type, name: name, value: value };
  };

  var readEnum = function readEnum() {
    var subject = readKeyword('enum');
    var name = readName();
    var items = readEnumBlock();
    return { subject: subject, name: name, items: items };
  };

  var readEnumBlock = function readEnumBlock() {
    readCharCode(123); // {
    var receiver = readUntilThrow(readEnumItem);
    readCharCode(125); // }
    return receiver;
  };

  var readEnumItem = function readEnumItem() {
    var name = readName();
    var value = readAssign();
    readComma();
    return { name: name, value: value };
  };

  var readAssign = function readAssign() {
    var beginning = offset;
    try {
      readCharCode(61); // =
      return readValue();
    } catch (ignore) {
      offset = beginning;
    }
  };

  var readStruct = function readStruct() {
    var subject = readKeyword('struct');
    var name = readName();
    var items = readStructBlock();
    return { subject: subject, name: name, items: items };
  };

  var readStructBlock = function readStructBlock() {
    readCharCode(123); // {
    var receiver = readUntilThrow(readStructItem);
    readCharCode(125); // }
    return receiver;
  };

  var readProps = function readProps(parent) {
    try {
      readCharCode(46);
      var propName = readName();
      return readProps(parent + "." + propName);
    } catch (e) {
      return parent;
    }
  };

  var readStructItem = function readStructItem() {
    var id = readNumberValue();
    readCharCode(58); // :
    var option = readAnyOne(function () {
      return readKeyword('required');
    }, function () {
      return readKeyword('optional');
    }, readNoop);
    var type = readType();
    type = readProps(type);
    //console.log(buffer.slice(offset, offset + 100)+"", "-----");
    var name = readName();
    var defaultValue = readAssign();
    readComma();
    var result = { id: id, type: type, name: name };
    if (option !== void 0) result.option = option;
    if (defaultValue !== void 0) result.defaultValue = defaultValue;
    return result;
  };

  var readException = function readException() {
    var subject = readKeyword('exception');
    var name = readName();
    var items = readStructBlock();
    return { subject: subject, name: name, items: items };
  };

  var readService = function readService() {
    var subject = readKeyword('service');
    var name = readName();
    var extendsName = null;
    try {
      extendsName = readExtends();
    } catch (e) {
      //console.log(e, 123123);
    }
    var items = readServiceBlock();
    return { subject: subject, name: name, items: items, extendsName: extendsName };
  };

  var readExtends = function readExtends() {

    var subject = readKeyword('extends');
    //console.log(buffer.slice(offset, offset+50) +"");
    readSpace();
    return readParent();
  };

  var readParent = function readParent() {
    var name = readName();
    return readProps(name);
  };

  var readNamespace = function readNamespace() {
    var subject = readKeyword('namespace');
    var name = readName();
    var serviceName = readRefValue()['='].join('.');
    return { subject: subject, name: name, serviceName: serviceName };
  };

  var readServiceBlock = function readServiceBlock() {
    readCharCode(123); // {
    var receiver = readUntilThrow(readServiceItem, 'name');
    readCharCode(125); // }
    return receiver;
  };

  var readOneway = function readOneway() {
    return readKeyword('oneway');
  };

  var readServiceItem = function readServiceItem() {
    var oneway = !!readAnyOne(readOneway, readNoop);
    var type = readType();

    type = readProps(type);
    //console.log(buffer.slice(offset, offset + 50)+"", "-----");
    var name = readName();
    var args = readServiceArgs();
    var throws = readServiceThrow();
    readComma();
    return { type: type, name: name, args: args, throws: throws, oneway: oneway };
  };

  var readServiceArgs = function readServiceArgs() {
    readCharCode(40); // (
    var receiver = readUntilThrow(readStructItem);
    readCharCode(41); // )
    readSpace();
    return receiver;
  };

  var readServiceThrow = function readServiceThrow() {
    var beginning = offset;
    try {
      readKeyword('throws');
      return readServiceArgs();
    } catch (ignore) {
      offset = beginning;
      return [];
    }
  };

  var readInclude = function readInclude() {
    var subject = readKeyword('include');
    //readSpace();
    var name = readStringValue();
    var filepath = require("path").resolve(file.replace(/^(.*\/)(.*)$/, '$1'), name);
    //var content = readFileSync(name, {encoding: "utf-8"});

    return { subject: subject, ast: parser(filepath), name: name.replace(/.thrift/, '') };
  };

  var readSubject = function readSubject() {
    return readAnyOne(readInclude, readTypedef, readConst, readEnum, readStruct, readException, readService, readNamespace);
  };

  var readThrift = function readThrift() {
    readSpace();
    var storage = {};
    for (;;) {
      try {
        var block = readSubject();
        var subject = block.subject,
            name = block.name,
            extendsName = block.extendsName;

        if (!storage[subject]) storage[subject] = {};
        delete block.subject;
        delete block.name;
        delete block.extendsName;

        switch (subject) {
          case 'exception':
          case 'service':
          case 'struct':
            storage[subject][name] = block.items;
            break;
          case 'include':
            storage[subject][name] = block.ast;
            break;

          default:
            storage[subject][name] = block;
        }
        if (extendsName) {
          storage[subject][name].extends = extendsName;
        }
      } catch (message) {
        console.error('\x1B[31m' + buffer.slice(offset, offset + 50) + '\x1B[0m'); // eslint-disable-line
        throw new ThriftFileParsingError(message);
      } finally {
        if (buffer.length === offset) break;
      }
    }
    return storage;
  };

  return readThrift();
};