const axios = require('axios');
const get = require('lodash/get');
const { templates } = require('../templates');
const { XMLParser } = require('fast-xml-parser');

const HTTP_CODE_OK = 200;
const HTTP_CODE_NOT_FOUND = 404;

const createIR = (props) => {
  return Promise.resolve(props) //
    .then(callCreateApi)
    .then(processResponse);
};

async function callCreateApi(prco) {
  const { vendor, jsonObj } = prco.options;
  let data;
  switch (vendor) {
    case 'verity':
      data = { ...jsonObj, api_key: prco.options.api_key };
      break;

    case 'oneguard':
      data = { ...jsonObj, UserName: prco.options.username, Password: prco.options.password };
      break;

    case 'wis':
      data = { ...jsonObj, Username: prco.options.username, Password: prco.options.password };
      break;
  }

  const { contentType, body } = templates[vendor].create(data);

  const axiosOptions = {
    method: 'POST',
    url: prco.options.url,
    data: body,
    headers: {
      ['Content-Type']: contentType,
    },
  };

  await axios(axiosOptions)
    .then(({ status, data }) => {
      prco.responses.newRecord = {
        payload: axiosOptions.data,
        responseStatus: status,
        responseData: data,
      };
    })
    .catch((error) => {
      const { status, data } = error.response;
      prco.responses.newRecord = {
        payload: axiosOptions.data,
        responseStatus: status,
        responseData: data,
      };
    });

  return prco;
}

async function processResponse(prco) {
  const status = getStatus(prco);

  if (status.not_found) {
    appendReport(prco, `\n---\nAPI not found\n`);
    appendReport(prco, collectReport(prco));

    return prco;
  }

  if (status.ok && status.missing_data) {
    appendReport(prco, `\n---\nMissing data\n`);
  }

  if (!status.ok) {
    appendReport(prco, `\n---\nServer error\n`);
  }

  appendReport(prco, collectReport(prco));

  return prco;
}

function getStatus(prco) {
  const record = prco.responses.newRecord;
  record.responseJson = collectJson(prco);
  const { responseStatus, responseJson } = record;
  const vendor = prco.options.vendor;

  const isVendor = {
    wis: vendor === 'wis',
    oneguard: vendor === 'oneguard',
    verity: vendor === 'verity',
  };

  const isOk = {
    verity: isVendor.verity && responseJson?.code === HTTP_CODE_OK,
    wis: isVendor.wis && responseStatus === HTTP_CODE_OK && !!responseJson,
    oneguard: isVendor.oneguard && !!responseJson,
  };

  const status = {
    ok: responseStatus === HTTP_CODE_OK && isOk[vendor],
    not_found: responseStatus === HTTP_CODE_NOT_FOUND,
    missing_data: responseJson === null,
  };

  return status;
}

function appendReport(prco, section) {
  const record = prco.responses.newRecord;
  if (record.report === undefined) {
    record.report = '';
  }
  record.report += section;
}

function collectJson(prco) {
  const vendor = prco.options.vendor;
  if (vendor === 'verity') {
    return prco.responses.newRecord.responseData;
  }

  const getJsonPath = () => {
    const prefixes = {
      wis: 'soap:Envelope.soap:Body.SendRequestBResponse.SendRequestBResult',
      oneguard: 'SOAP-ENV:Envelope.SOAP-ENV:Body.SendInspectionRequestTPAResponse.SendInspectionRequestTPAResult',
    };
    const prefix = prefixes[vendor] ?? '';

    return prefix;
  };

  const record = prco.responses.newRecord;

  // xml 2 json
  const parser = new XMLParser();
  const jsonObj = parser.parse(record.responseData);
  const jsonPath = getJsonPath();

  // extract section from json
  const json = get(jsonObj, jsonPath, null);

  return json;
}

function collectReport(prco) {
  prco.inspectionIds = ['newRecord'];
  const record = prco.responses.newRecord;
  const json = record.responseJson;
  const vendor = prco.options.vendor;

  const result = {
    verity: json.result,
    wis: json,
    oneguard: json,
  };

  let report = '\n\n---\n';
  report += `Created inspection request id: ${result[vendor]} `;
  report += `\n`;

  return report;
}

module.exports = {
  createIR,
};
