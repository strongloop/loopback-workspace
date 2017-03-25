// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Composite = require('../../../lib/datamodel/graph').Composite;
const expect = require('../../helpers/expect');

describe('Graph : Composite', function() {
  describe('contains()', function() {
    let phase, middleware;

    before(defineClasses);

    it('adds a placeholder for child nodes', function() {
      expect(phase.children).to.have.property('Middleware');
    });

    describe('add()', function() {
      it('adds a child node to the parent', function() {
        phase.add(middleware);
        expect(phase.children.Middleware).to.have.property('foo');
      });

      it('parent.child(childName) gets child', function() {
        expect(phase.middleware('foo')).to.eql(middleware);
      });
    });
    function defineClasses() {
      class Middleware extends Composite {
        constructor(graph, domain, id) {
          super(graph, domain, id);
        }
      }
      class Phase extends Composite {
        constructor(graph, domain, id) {
          super(graph, domain, id);
          this.contains(Middleware);
        }
      }
      middleware = new Middleware({}, 'model1', 'foo');
      phase = new Phase({}, 'model2', 'bar');
    }
  });
});
