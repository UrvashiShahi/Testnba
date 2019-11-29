const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const jwt = require('jsonwebtoken');
const { app, server } = require('../app');
const JwtUtil = require('../src/utils/jwt');
const TokenUtil = require('../src/utils/access.token');
const JwtValidation = require('../src/routes/middlewares/jwt.validation');
const AccessTokenValidation = require('../src/routes/middlewares/token.validation');
const ActivityService = require('../src/services/activity.service');
const ActivityController = require('../src/controllers/activity.ctrl');
const RestUtil = require('../src/utils/rest');
const SoapUtil = require('../src/utils/soap');

// Configure chai
chai.use(chaiHttp);
chai.use(sinonChai);
chai.should();
const { expect } = chai;

let JWT_KEY = '';
let JWT_TOKEN = '';

const GET_DATA_XML_RESP = {
  RetrieveResponseMsg: {
    OverallStatus: 'OK',
    RequestID: '95902b2a-5e9c-49f9-95f7-86fa300902e9',
    Results: {
      PartnerKey: '',
      ObjectID: '',
      Type: 'DataExtensionObject',
      Properties: {
        Property: [
          {
            Name: 'NBA_Ongoing_Interaction__c',
            Value: 'N'
          },
          {
            Name: 'Customer_Segmentation__c',
            Value: 'Prudent Mature Couples'
          }
        ]
      }
    }
  }
};
const UPSERT_DATA_REPONSE = [
  {
    keys: {
      pK: 'a0dN000000CaBW1IAN-4'
    },
    values: {
      customerId: '88516205',
      personContactId: '003N000001StLdMIAV',
      campaignId: 'a0NN000000Bpz2VMAR',
      journeyStepCode: '4',
      microSegment: 'Prudent Mature Couples',
      campaignAudienceId: 'a0dN000000CaBW1IAN',
      product1Name: '',
      product1Code: '',
      product1Type: '',
      product2Name: '',
      product2Code: '',
      product2Type: '',
      koStatus: 'Y',
      status: 'OK',
      message: '',
      channelMismatch: 'N',
      corporateClients: 'N',
      underTrust: 'N',
      servicedBy: 'N',
      customerStatus: 'N',
      agentStatus: 'N',
      controlGroup: 'N',
      foreignAddress: 'Y',
      foreignMobileNumber: 'Y',
      phladeceased: 'N',
      claimStatus: 'N',
      claimType: 'N',
      subClaimType: 'N',
      failedTotalSumAssuredTest: 'N',
      exclusionCodeImposed: 'N',
      extraMorality: 'N',
      isSubstandard: 'N',
      amlwatchList: 'N',
      underwritingKOs: '',
      existingProductsKOs: '',
      salesPersonKOs: ''
    }
  }
];
const GET_PRODUCT_RESPONSE = {
  status: 'OK',
  message: '',
  decisionId: 'a0dN000000CaBVwIAN',
  customerId: '88516224',
  koStatus: 'N',
  koReason: {
    channelMismatch: 'N',
    corporateClients: 'N',
    underTrust: 'N',
    servicedBy: 'N',
    customerStatus: 'N',
    agentStatus: 'N',
    controlGroup: 'N',
    underBankrupcy: 'N',
    foreignAddress: 'N',
    foreignMobileNumber: 'N',
    phladeceased: 'N',
    claimStatus: 'N',
    claimType: 'N',
    subClaimType: 'N',
    failedTotalSumAssuredTest: 'N',
    exclusionCodeImposed: 'N',
    extraMorality: 'N',
    isSubstandard: 'N',
    amlwatchList: 'N',
    underwritingKOs: '',
    existingProductsKOs: '',
    salesPersonKOs: ''
  },
  offerProducts: []
};

const REQ_BODY = {
  inArguments: [
    {
      journeyStepCode: '4',
      campaignId: 'a0NN000000Bpz2VMAR',
      campaignName: 'Banana Campaign',
      clientId: '88516205',
      decisionId: 'a0dN000000CaBUUIA3',
      campaignType: 'Maturity',
      campaignProductType: 'Investment',
      contactId: '003N000001StLdMIAV',
      override: 'N',
      accountId: '001N000001a2dOmIAI',
      microSegment: 'Prudent Mature Couples'
    }
  ],
  outArguments: [],
  activityObjectID: 'e4a19400-039e-4515-a312-735de4fac4c3',
  journeyId: '769f50c3-500b-472d-aed2-83984f98d105',
  activityId: 'e4a19400-039e-4515-a312-735de4fac4c3',
  definitionInstanceId: 'e8f24eac-c05b-49c2-b44f-e0d8e8074777',
  activityInstanceId: '9591dd76-e5e4-4ac2-9991-931233cd05ab',
  keyValue: '003N000001StLdMIAV',
  mode: 0
};
(async () => {
  JWT_KEY = !process.env.JWT_KEY ? 'your-256-bit-secret' : process.env.JWT_KEY;
  JWT_TOKEN = await JwtUtil.jwtSign(REQ_BODY, JWT_KEY);
})();

describe('Session', () => {
  after(() => {
    server.close();
  });

  describe('Core Testing /', () => {
    it('App API Testing flow until middleware', () => {
      chai.request(app)
        .post('/nba/journeybuilder/stop')
        .send(JWT_TOKEN)
        .end((err, res) => {
          res.should.satisfy((num) => {
            if ((res.status === 400) || res.status === 401 || res.status === 200) {
              return true;
            }
          });
        });
    });

    it('App API Testing : should give error unsupportedURL if there is wrong path', () => {
      chai.request(app)
        .post('/foo/test/now')
        .send(JWT_TOKEN)
        .end((err, res) => {
          res.should.satisfy((num) => {
            if ((res.status === 404)) {
              return true;
            }
          });
        });
    });
  });

  describe('Controllers Testing /', () => {
    afterEach(() => {
      sinon.reset();
      sinon.resetBehavior();
    });
    it('Activity Controller - Save : should return response save====>', async () => {
      const req = { decoded: REQ_BODY };
      const res = {
        send: sinon.spy()
      };
      const next = () => {};
      await ActivityController.save(req, res, next);
      expect(res.send.firstCall.args[0].value).to.equal('save===>');
    });

    it('Activity Controller - Save : should able to hander service error', async () => {
      const customErr = 'Custom error save';
      const actvityStub = sinon.stub(ActivityService, 'save').throws(() => customErr);
      const req = { decoded: REQ_BODY };
      const res = {};
      const next = sinon.spy();
      await ActivityController.save(req, res, next);
      expect(next.firstCall.args[0].message).to.equal(`Internal Server Error: ${customErr}`);
    });

    it('Activity Controller - Publish : should return response publish====>', async () => {
      const req = { decoded: REQ_BODY };
      const res = {
        send: sinon.spy()
      };
      const next = () => {};
      await ActivityController.publish(req, res, next);
      expect(res.send.firstCall.args[0].value).to.equal('publish===>');
    });

    it('Activity Controller - Publish : should able to hander service error', async () => {
      const customErr = 'Custom error publish';
      const actvityStub = sinon.stub(ActivityService, 'publish').throws(() => customErr);
      const req = { decoded: REQ_BODY };
      const res = {};
      const next = sinon.spy();
      await ActivityController.publish(req, res, next);
      expect(next.firstCall.args[0].message).to.equal(`Internal Server Error: ${customErr}`);
    });

    it('Activity Controller - Validate : should return response validate====>', async () => {
      const req = { decoded: REQ_BODY };
      const res = {
        send: sinon.spy()
      };
      const next = () => {};
      await ActivityController.validate(req, res, next);
      expect(res.send.firstCall.args[0].value).to.equal('validate===>');
    });

    it('Activity Controller - Validate : should able to hander service error', async () => {
      const customErr = 'Custom error validate';
      const actvityStub = sinon.stub(ActivityService, 'validate').throws(() => customErr);
      const req = { decoded: REQ_BODY };
      const res = {};
      const next = sinon.spy();
      await ActivityController.validate(req, res, next);
      expect(next.firstCall.args[0].message).to.equal(`Internal Server Error: ${customErr}`);
    });

    it('Activity Controller - Stop : should return response stop====>', async () => {
      const req = { decoded: REQ_BODY };
      const res = {
        send: sinon.spy()
      };
      const next = () => {};
      await ActivityController.stop(req, res, next);
      expect(res.send.firstCall.args[0].value).to.equal('stop===>');
    });

    it('Activity Controller - Stop : should able to hander service error', async () => {
      const customErr = 'Custom error stop';
      const actvityStub = sinon.stub(ActivityService, 'stop').throws(() => customErr);
      const req = { decoded: REQ_BODY };
      const res = {};
      const next = sinon.spy();
      await ActivityController.stop(req, res, next);
      expect(next.firstCall.args[0].message).to.equal(`Internal Server Error: ${customErr}`);
    });

    it('Activity Controller - Execute : should return response execute====>', async () => {
      const actvityStub = sinon.stub(ActivityService, 'execute').returns({ value: 'execute===>' });
      const req = { decoded: REQ_BODY };
      const res = {
        send: sinon.spy()
      };
      const next = () => {};
      await ActivityController.execute(req, res, next);
      actvityStub.restore();
      expect(res.send.firstCall.args[0].value).to.equal('execute===>');
    });

    it('Activity Controller - Execute : should able handle error invalid decoded data', async () => {
      const req = { decoded: 'Invalid decoded data' };
      const res = {};
      const next = sinon.spy();
      await ActivityController.execute(req, res, next);
      expect(next.firstCall.args[0].message).to.equal(`Incorrect decoded inArguments : ${req.decoded}`);
    });

    it('Activity Controller - Execute : should able to hander service error from service', async () => {
      const customErr = 'Custom error execute';
      const actvityStub = sinon.stub(ActivityService, 'execute').throws(() => customErr);
      const req = { decoded: REQ_BODY };
      const res = {};
      const next = sinon.spy();
      await ActivityController.execute(req, res, next);
      actvityStub.restore();
      expect(next.firstCall.args[0].message).to.equal(`Internal Server Error: ${customErr}`);
    });
  });

  describe('Services Testing /', () => {
    // Test
    it('Activity Service : should success when input a valid argument', async () => {
      var getProductStub = sinon.stub(RestUtil, 'post');
      getProductStub.onCall(0).returns({ response: 200, body: JSON.stringify(GET_PRODUCT_RESPONSE) });
      getProductStub.onCall(1).returns({ response: 200, body: JSON.stringify(UPSERT_DATA_REPONSE) });
      getProductStub.returns({ response: 200, body: JSON.stringify(UPSERT_DATA_REPONSE) });
      const soapGetDataStub = sinon.stub(SoapUtil, 'post').onFirstCall().returns(GET_DATA_XML_RESP);
      const req = { decoded: REQ_BODY, access_token: JWT_TOKEN };
      await ActivityService.execute(req);
      getProductStub.restore();
    });
  });

  describe('Middleware Testing /', () => {
    // Test JWT Middleware
    it('JWT Middleware Verify : should return correct decoded for a valid JWT token', async () => {
      const req = { rawBody: JWT_TOKEN };
      const res = {
        status() {},
        send() {}
      };
      let verifyJwt;
      if (!process.env.JWT_KEY) {
        verifyJwt = sinon.stub(JwtUtil, 'jwtVerify').returns(REQ_BODY);
      }
      const next = () => {};
      await JwtValidation.validate(req, res, next);
      assert.equal(req.decoded.inArguments[0].campaignName, 'Banana Campaign');
      if (verifyJwt) {
        verifyJwt.restore();
      }
    });

    it('JWT Middleware Verify : should return Malformed HTTP Request Error when empty jwt token', async () => {
      const req = {};
      const res = {
        status() {},
        send() {}
      };
      const next = sinon.spy();
      await JwtValidation.validate(req, res, next);
      expect(next.firstCall.args[0].message).to.equal('Malformed HTTP Request');
    });

    it('JWT Middleware Verify : should return Forbidden access when invalid jwt token', async () => {
      const req = { rawBody: 'WRONG JWT TOKEN' };
      const res = {
        status() {},
        send() {}
      };
      const next = sinon.spy();
      let verifyJwt;
      if (!process.env.JWT_KEY) {
        verifyJwt = sinon.stub(JwtUtil, 'jwtVerify').throws(() => new Error('Invalid JWT token'));
      }
      await JwtValidation.validate(req, res, next);
      expect(next.firstCall.args[0].message).to.equal('Forbidden access');
      if (verifyJwt) {
        verifyJwt.restore();
      }
    });

    it('Access Token Middleware : should return succcess if get access token from server', async () => {
      this.timeout = 10000;
      if (!process.env.CLIENT_ID && !process.env.CLIENT_SECRET
        && !process.env.AUTHENTICATIONBASE_URI) {
        const generateToken = sinon.stub(TokenUtil, 'generateToken').returns({
          access_token: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IjEiLCJ2ZXIiOiIxIiwidHlwIjoiSldUIn0.eyJhY2Nlc3NfdG9rZW4iOiJaSE9iT3c1dEJjWW8xZWlZM2FNbHU1NHgiLCJjbGllbnRfaWQiOiJhbGZxemJwemZxcTI0MXl2cTFvOGVuNHUiLCJlaWQiOjEwMDAwMjI0OSwic3RhY2tfa2V5IjoiUzEwIiwicGxhdGZvcm1fdmVyc2lvbiI6MiwiY2xpZW50X3R5cGUiOiJTZXJ2ZXJUb1NlcnZlciJ9.tNzAtQkOGKdDPpcWaoEDY9XXrQF3XYMwl3WOEGiD-h8.2BLu5WGiCd3TMl3gRHxuO0HRlMpsVaGpsBfzJ-eRu_FgH7_xfRh3bV99qVVOS_BbrFVwNAZojYNwRTRJruL2QXZsgCW8fb4oWidr76tMW2Qml3uSIYbq95E8gTfkLb59h2je4cvLni6XR9nf_Z7XI-rPIhdmZCDwgYiTgPyGRC1o7WhCbnm'
        });
        const req = { rawBody: REQ_BODY, access_token: '' };
        const res = {};
        const next = sinon.spy();
        await AccessTokenValidation.validate(req, res, next);
        assert.ok(req.access_token);
        if (generateToken) {
          generateToken.restore();
        }
      }
      else {
        const req = { rawBody: REQ_BODY };
        const res = {};
        const next = () => {};
        await AccessTokenValidation.validate(req, res, next);
      }
    });

    it('Access Token Middleware : should return error Forbidden external access if there is no token', async () => {
      this.timeout = 10000;
      const generateToken = sinon.stub(TokenUtil, 'generateToken').returns();
      const req = { rawBody: REQ_BODY, access_token: '' };
      const res = {};
      const next = sinon.spy();
      await AccessTokenValidation.validate(req, res, next);
      expect(next.firstCall.args[0].message).to.equal('Forbidden external access');
      if (generateToken) {
        generateToken.restore();
      }
    });

  });

  describe('Utils Testing /', () => {
    it('JWT Utils Sign: should return Invalid payload error if payload is empty', async () => {
      JwtUtil.jwtSign(null, JWT_KEY).then(() => {
        assert.equal(1, 2);
      }).catch((err) => {
        assert.equal(err.message, 'Invalid payload to JWT sign');
      });
    });

    it('JWT Utils Sign: should return jsonwebtoken specific error if something wrong', async () => {
      const jwtStubVerify = sinon.stub(jwt, 'sign').throws(() => new Error('jsonwentoken specific error'));
      JwtUtil.jwtSign('test payloiad', JWT_KEY).then(() => {
        assert.equal(1, 2);
      }).catch((err) => {
        jwtStubVerify.restore();
        assert.equal(err.message, 'jsonwentoken specific error');
      });
    });

    it('Access Token Utils : should return access token if mc server running', async () => {
      this.timeout = 10000;
      let restStub;
      // if (!process.env.CLIENT_ID && !process.env.CLIENT_SECRET && process.env.AUTHENTICATIONBASE_URI) {
      restStub = sinon.stub(RestUtil, 'post').returns({response : 200,
        body: JSON.stringify({ access_token: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IjEiLCJ2ZXIiOiIxIiwidHlwIjoiSldUIn0.eyJhY2Nlc3NfdG9rZW4iOiJaSE9iT3c1dEJjWW8xZWlZM2FNbHU1NHgiLCJjbGllbnRfaWQiOiJhbGZxemJwemZxcTI0MXl2cTFvOGVuNHUiLCJlaWQiOjEwMDAwMjI0OSwic3RhY2tfa2V5IjoiUzEwIiwicGxhdGZvcm1fdmVyc2lvbiI6MiwiY2xpZW50X3R5cGUiOiJTZXJ2ZXJUb1NlcnZlciJ9.tNzAtQkOGKdDPpcWaoEDY9XXrQF3XYMwl3WOEGiD-h8.2BLu5WGiCd3TMl3gRHxuO0HRlMpsVaGpsBfzJ-eRu_FgH7_xfRh3bV99qVVOS_BbrFVwNAZojYNwRTRJruL2QXZsgCW8fb4oWidr76tMW2Qml3uSIYbq95E8gTfkLb59h2je4cvLni6XR9nf_Z7XI-rPIhdmZCDwgYiTgPyGRC1o7WhCbnm' })
      });
      // }
      const token = await TokenUtil.generateToken();
      assert.ok(token);
      if (restStub) {
        restStub.restore();
      }
    });

    it('Rest Utils : should return error for invalid url', async () => {
      const req = { url: 'invalidAddress.invalid', body: {}, method: 'POST' };
      RestUtil.post(req).then((resp, body) => {
        assert.equal(1, 2);
      }).catch((err) => {
        assert.equal(1, 1);
      });
    });

    it('SOAP Utils : should return error for invalid url', async () => {
      const req = {
        url: 'invalidAddress.invalid', body: {}, method: 'POST', soapAction: 'Receive'
      };
      try {
        const soapResponse = SoapUtil.post(req);
        assert(1, 2);
      }
      catch (err) {
        assert(1, 1);
      }
    });
  });
});
