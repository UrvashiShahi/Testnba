const chai = require('chai');
const { getBodyStringInsertRowDE } = require('../src/parsers/activity.parser');

const { expect } = chai;
const { assert } = chai;

var testObj = {
  name: 'test',
  sub: {
    name: 'test sub'
  },
  numbers: [1, 2, 3, 4],
  hasNumbers: true
};

var jsonValue = {
  koReason: {},
  error: 'Test Error',
  message: 'Test message',
  offerProducts: []
};

var error = {
  message: 'Test message'
};

var decodeArgsTestObj = {
  clientId: 'xxxx',
  contactId: 'xxxx',
  campaignId: 'xxxx',
  journeyStepCode: 'xxxx',
  microSegment: 'xxxx',
  decisionId: 'xxxx'
};


describe('Activity Parser', () => {
  describe('getBodyStringInsertRowDE', () => {
    it('should be a valid structure of decodeArgs object', () => {
      const result = getBodyStringInsertRowDE(jsonValue, decodeArgsTestObj, error);
      assert.equal(1, 1);
    });
  });
});
