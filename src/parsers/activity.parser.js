const getBodyStringInsertRowDE = (jsonValue, decodedArgs, error) => {
  const pkValue = `${decodedArgs.decisionId}-${decodedArgs.journeyStepCode}`;
  return [{
    keys: {
      pK: pkValue
    },

    values: {
      customerId: decodedArgs.clientId,
      PersonContactId: decodedArgs.contactId,
      CampaignId: decodedArgs.campaignId,
      journeyStepCode: decodedArgs.journeyStepCode,
      microSegment: decodedArgs.microSegment,
      CampaignAudienceId: decodedArgs.decisionId,
      Product1Name: (jsonValue.status !== error && jsonValue.offerProducts.length >= 1) ? jsonValue.offerProducts[0].productName : '',
      Product1Code: (jsonValue.status !== error && jsonValue.offerProducts.length >= 1) ? jsonValue.offerProducts[0].productCode : '',
      Product1Type: (jsonValue.status !== error && jsonValue.offerProducts.length >= 1) ? jsonValue.offerProducts[0].productType : '',
      Product2Name: (jsonValue.status !== error && jsonValue.offerProducts.length >= 2) ? jsonValue.offerProducts[1].productName : '',
      Product2Code: (jsonValue.status !== error && jsonValue.offerProducts.length >= 2) ? jsonValue.offerProducts[1].productCode : '',
      Product2Type: (jsonValue.status !== error && jsonValue.offerProducts.length >= 2) ? jsonValue.offerProducts[1].productType : '',
      koStatus: jsonValue.koStatus,
      Status: jsonValue.status,
      Message: jsonValue.message,
      channelMismatch: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.channelMismatch : ''),
      corporateClients: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.corporateClients : ''),
      underTrust: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.underTrust : ''),
      servicedBy: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.servicedBy : ''),
      customerStatus: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.customerStatus : ''),
      agentStatus: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.agentStatus : ''),
      controlGroup: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.controlGroup : ''),
      underBankruptcy: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.underBankruptcy : ''),
      foreignAddress: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.foreignAddress : ''),
      foreignMobileNumber: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.foreignMobileNumber : ''),
      phladeceased: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.phladeceased : ''),
      claimStatus: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.claimStatus : ''),
      claimType: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.claimType : ''),
      subClaimType: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.subClaimType : ''),
      failedTotalSumAssuredTest: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.failedTotalSumAssuredTest : ''),
      exclusionCodeImposed: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.exclusionCodeImposed : ''),
      extraMorality: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.extraMorality : ''),
      isSubstandard: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.isSubstandard : ''),
      amlwatchList: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.amlwatchList : ''),
      underwritingKOs: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.underwritingKOs : ''),
      existingProductsKOs: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.existingProductsKOs : ''),
      salesPersonKOs: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.salesPersonKOs : '')
    }
  }];
};

module.exports = { getBodyStringInsertRowDE };
