import assert from 'assert';
import should from 'should';
import ThriftMocker from '../lib/';
import path from 'path';
import { extend } from '../lib/utils/helper';

let thriftMocker;

describe('Your tests go here!', function() {
    
    beforeEach(function(){
      thriftMocker = new ThriftMocker({
        service: path.resolve(__dirname, './service.thrift'),
        models: [require('./service_types')],
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

    it('test case 2', function() {
      assert(extend({}, {a:1}).a === 1);
    });
});
