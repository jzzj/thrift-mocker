# thrift-mocker

# Easy to mock data based on thrift, no hard code data anymore!

You will not need to wirte mock-data any more, All data generate automatically by this mocker.  


## Usage
```js
import ThriftMocker from 'thrift-mocker';

const thriftMocker = new ThriftMocker({
  service: "@path/to/your/file.thrift",
  models: [require("@path/to/your/model.thrift"), require("@path/to/your/another-model.thrift")],   // more than one model thrift file.
  mockData: {
    // if you really want to mock some specify method, go here! like the following:
    getSomeDataMethod: {
      // your data...
    }
  },
  commonData: {
    // some common data struct
    code: 200,
    message: "success"
  },
  strictMode: true, // default false, will not check i64 for a number if strictMode is not true
  boundary: false, // generate data maybe really long, null, empty string, etc.
  cache: true,  // if not cache, will generate different data at each time. Your choice.
  serviceName: "YourSeviceName" // If your thrift service has more than one service, you have to indicate the service you need!
  treatArgumentsAsObject: true, // You can call your thrift method as Service.someMethod({arg1: value1, arg2: value2}); thrift definition like: string someMethod(1:someType arg1,2:someType arg2);
  typeLoose: true	    // will not check if your arguments are the exactly same as your thrift type, object type will accpet!
});

const result = await thriftMocker.exec('Reserved argument!', methodName, ...args);
```

## Generator
In most application, your data have vast type of data, such as: img, url, text, number, price, percent, person name, goods name, etc.
In such cases, you may want to make your data more reality ( even I don't think it's necessary ), you could change the generator by youself.    
I promise I will provide a better way, maybe like an AI, to generate more reality data. Of course, in the future!
