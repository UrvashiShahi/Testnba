const jsonCircular = require('circular-json');
const fs = require('fs');
const path = require('path');
const RestUtil = require('../utils/rest');
const SoapUtil = require('../utils/soap');
const log = require('../utils/logger');
const activityParser = require('../parsers/activity.parser');

let policyholderSoapEnvTemplate;
fs.readFile(`${path.join(__dirname, '../templates')}/NBA_PolicyHolder_Template`, 'utf8', async (err, data) => {
  if (err) {
    log.logger.error(`Error when reading file: ${err}`);
  }
  policyholderSoapEnvTemplate = data;
});

const connectionErrorMessage = [];

/*
    Date            Author          Description
    21-Oct-2019     Deloitte        Retrieve policyholder's ongoing interaction status from MC
                                    based on accountId in decoded inargument and token
    
    */
const retrievePolicyHolder = async (decoded, token) => {
  if (!policyholderSoapEnvTemplate) {
    throw new Error('Error retrievePolicyHolder : Unable to find xml template');
  }
  let xml;
  xml = policyholderSoapEnvTemplate;
  xml = xml.replace('[token]', token);
  xml = xml.replace('[accountId]', decoded.accountId);
  const soapRequest = {
    url: `${process.env.SOAP_BASE_URI}Service.asmx`,
    soapAction: 'Retrieve',
    body: xml
  };

  const soapRespBody = await SoapUtil.post(soapRequest);
  const accountDeMapping = new Map();

  if(soapRespBody.RetrieveResponseMsg !== undefined){
    if(soapRespBody.RetrieveResponseMsg.Results !== undefined){
      if(soapRespBody.RetrieveResponseMsg.Results.Properties !== undefined){
        const property = soapRespBody.RetrieveResponseMsg.Results.Properties.Property;
        for (let i = 0; i < property.length; i += 1) {
          accountDeMapping.set(property[i].Name, property[i].Value);
        }
      }
    }
    else{
      log.logger.info('Soap Request did not return any record');
    }
  }
  else{
    log.logger.info('Soap Request Property Undefined');
  }
  return accountDeMapping;
};

const getSuggestedProducts = async (accountDeMapping, decodedArgs, token) => {
  var bodyStringRequest = {
    decisionId: decodedArgs.decisionId,
    platform: process.env.PLATFORM,
    audienceList: [{
      customerId: decodedArgs.clientId,
      microSegment: decodedArgs.microSegment,
      isOngoing: accountDeMapping.get('NBA_Ongoing_Interaction__c'),
      crmId: decodedArgs.crmId
    }
    ],
    campaign: {
      campaignId: decodedArgs.campaignId,
      campaignName: decodedArgs.campaignName,
      campaignType: decodedArgs.campaignType,
      campaignProductType: decodedArgs.campaignProductType.split(';'),
      overrideContactFramwork: decodedArgs.overrideFramework
    }
  };

  var header = {
    'Content-Type': 'application/json',
    'Content-Length': bodyStringRequest.length
    //'X-IBM-Client-Id' : process.env.IBM_CLIENT_ID
  };

  var mcRequest = {
    body: bodyStringRequest,
    headers: header,
    url: process.env.WS_URL

  };
  try {
    const { response, body } = await RestUtil.post(mcRequest);
    if (body) {
      const jsonValue = JSON.parse(body);
      connectionErrorMessage.length = 0;
      if (jsonValue.status !== process.env.WS_STATUS_OK) {
        log.logger.info(`connectionErrorMessage - > ${body}`);
        connectionErrorMessage[0] = `${jsonValue.status}-${jsonValue.message}`;
      }
    }
    return body;
  }
  catch (exception) {
    throw new Error(exception);
  }
};

// to be refined
const updateJourneyKO = async (body, token, decodedArgs) => {
  const jsonValue = JSON.parse(body);
  let error = process.env.Error;
  if (connectionErrorMessage.length > 0) {
    jsonValue.status = error;
    for (let i = 0; i < connectionErrorMessage.length; i += 1) {
      if (connectionErrorMessage[i] !== undefined) {
        jsonValue.message = connectionErrorMessage[i];
      }
      log.logger.info(`MESSAGE VALUE - > ${jsonValue.message}`);
    }
  }
  else if (connectionErrorMessage.length === 0) {

    if (jsonValue.hasOwnProperty("offerProducts") !== true || jsonValue.offerProducts.length < 1) {
      jsonValue.koStatus = process.env.KO_STATUS_YES;
    }

    if (jsonValue.koStatus === process.env.KO_STATUS_NO && jsonValue.offerProducts.length >= 1) {
      log.logger.info(`offer Products${jsonValue.offerProducts}`);
      if(jsonValue.offerProducts.length > 1){
        const offerProductsSorted = jsonValue.offerProducts.slice(0);
        offerProductsSorted.sort((a, b) => a.productRank - b.productRank);
        for (let i = 0; i < offerProductsSorted.length; i += 1) {
          jsonValue.offerProducts[i].productName = offerProductsSorted[i].productName;
          jsonValue.offerProducts[i].productCode = offerProductsSorted[i].productCode;
          jsonValue.offerProducts[i].productType = offerProductsSorted[i].productType;
        }
      }
    }
  }

  const bodyStringInsertRowDE = activityParser.getBodyStringInsertRowDE(jsonValue, decodedArgs, error);

  const upsertDEReqHeader = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
  const journeyKORequest = {
    body: bodyStringInsertRowDE,
    headers: upsertDEReqHeader,
    url: `${process.env.REST_BASE_URI}hub/v1/dataevents/key:${process.env.DATA_EXTENSION_KEY}/rowset`
  };
  log.logger.info(`<execute>Journey KO Request=>${JSON.stringify(journeyKORequest)}`);
  //log.logger.info(`<execute>Journey KO Result Req Body=>${JSON.stringify(bodyStringInsertRowDE)}`);
  try {
    const { insertDEResponse, insertDEBody } = await RestUtil.post(journeyKORequest);
    return insertDEBody;
  }
  catch (exception) {
    throw new Error(exception);
  }
};

class ActivityService {
  static async save(req) {
    try {
      const payload = { value: 'save===>' };
      return payload;
    }
    catch (exception) {
      log.logger.error(`ActivityService save error: ${exception}`);
      throw exception;
    }
  }

  static async publish(req) {
    try {
      const payload = { value: 'publish===>' };
      return payload;
    }
    catch (exception) {
      log.logger.error(`ActivityService publish error: ${exception}`);
      throw exception;
    }
  }

  static async validate(req) {
    try {
      const payload = { value: 'validate===>' };
      return payload;
    }
    catch (exception) {
      log.logger.error(`ActivityService validate error: ${exception}`);
      throw exception;
    }
  }

  static async stop(req) {
    try {
      const payload = { value: 'stop===>' };
      return payload;
    }
    catch (exception) {
      log.logger.error(`ActivityService stop error: ${exception}`);
      throw exception;
    }
  }

  static async execute(req) {
    try {
      log.logger.info(`ActivityService execute => ${JSON.stringify(req.decoded)}`);
      const decodedArgs = req.decoded.inArguments[0];
      const accountDeMapping = await retrievePolicyHolder(decodedArgs, req.access_token);
      const getProductInfoBody = await
      getSuggestedProducts(accountDeMapping, decodedArgs, req.access_token);
      return await updateJourneyKO(getProductInfoBody, req.access_token, decodedArgs);
    }
    catch (exception) {
      log.logger.error(`ActivityService execute error: ${exception}`);
      throw exception;
    }
  }
}

module.exports = ActivityService;
