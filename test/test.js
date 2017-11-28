import assert from 'assert';
import should from 'should';
import ThriftMocker from '../lib/';
import path from 'path';
import { extend } from '../lib/utils/helper';

let thriftMocker;
let thriftTestService;

describe('Your tests go here!', function() {
    
    beforeEach(function(){
      thriftMocker = new ThriftMocker({
        service: path.resolve(__dirname, './service.thrift'),
        models: [require('./service_types')],
        strictMode: true,
        treatArgumentsAsObject: true,
        typeLoose: true
      });
      thriftTestService = new ThriftMocker({
        service: path.resolve(__dirname, './thrift/test1.thrift'),
        models: [require('./thrift/test1_types')],
        strictMode: true,
        treatArgumentsAsObject: true,
        typeLoose: true
      });
    });

    it('check type is ok', function(done) {
      thriftMocker.exec('Reserved argument', 'doTest', 1, '12')
        .then(result => {
          should(result).be.a.Number();
          done();
        }).catch(e => {
          assert(false, 'type is not ok!');
          done();
        });
    });

    it('check i64 is ok', function(done) {
      try {
        thriftMocker.exec('Reserved argument', 'doTest1', '43', '12');
      }catch(e){
        assert(e instanceof TypeError, 'not TypeError, error happened');
        done();
      }
    });

    it('check service.method(...) is ok', function(done) {
      thriftMocker.testModel({
        id: 1, 
        str: '12',
        model: {
          id: 2,
          name: 3
        }
      }).then(result => {
        should(result).be.a.String();
        done();
      }).catch(e => {
        assert(false, 'call method is not ok!');
        done();
      });
    });

    it.only('thriftTestService test', function(done) {
      done();
    })

    it('test case 2', function() {
      assert(extend({}, {a:1}).a === 1);
    });
});
