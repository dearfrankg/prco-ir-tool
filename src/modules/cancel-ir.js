import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { get } from 'lodash-es';
import { templates } from '../templates';

const HTTP_CODE_OK = 200;
const HTTP_CODE_NOT_FOUND = 404;

export const cancelIR = (props) => {
  return Promise.resolve(props) //
    .then(callCancelApi)
    .then(processResponse);
};

async function callCancelApi(props) {
  const { prco, inspectionId } = props;
  const vendor = prco.options.vendor;

  let data;
  switch (vendor) {
    case 'verity':
      data = { api_key: prco.options.api_key, inspection_id: inspectionId };
      break;

    case 'oneguard':
      data = { Username: prco.options.username, Password: prco.options.password, request_id: inspectionId };
      break;

    case 'wis':
      data = { Username: prco.options.username, Password: prco.options.password, RequestID: inspectionId };
      break;
  }

  const { contentType, body } = templates[vendor].cancel(data);

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
      prco.responses[inspectionId] = {
        inspectionId,
        payload: axiosOptions.data,
        responseStatus: status,
        responseData: data,
      };

      return prco;
    })
    .catch((error) => {
      const { status, data } = error.response;
      prco.responses[inspectionId] = {
        inspectionId,
        payload: axiosOptions.data,
        responseStatus: status,
        responseData: data,
      };

      return prco;
    });

  return props;
}

async function processResponse(props) {
  const { inspectionId } = props;
  const status = getStatus(props);

  if (status.not_found) {
    appendReport(props, `\n---\nInspection id ${inspectionId} not found\n`);
    appendReport(props, collectReport(props));

    return props;
  }

  if (status.ok && status.missing_data) {
    appendReport(props, `\n---\nInspection id ${inspectionId} missing data\n`);
  }

  if (!status.ok) {
    appendReport(props, `\n---\nServer error for inspection id: ${inspectionId}\n`);
  }

  appendReport(props, collectReport(props));

  return props;
}

function getStatus(props) {
  const { prco, inspectionId } = props;
  const record = prco.responses[inspectionId];
  record.responseJson = collectJson(props);
  const { responseStatus, responseJson } = record;
  const vendor = prco.options.vendor;

  const isVendor = {
    wis: vendor === 'wis',
    oneguard: vendor === 'oneguard',
    verity: vendor === 'verity',
  };

  const isOk = {
    verity: isVendor.verity && responseJson?.code === HTTP_CODE_OK,
    wis: isVendor.wis && !!responseJson?.RequestID,
    oneguard: isVendor.oneguard && !!responseJson?.request_id,
  };

  const status = {
    ok: responseStatus === HTTP_CODE_OK && isOk[vendor],
    not_found: responseStatus === HTTP_CODE_NOT_FOUND,
    missing_data: responseJson === null,
  };

  return status;
}

function appendReport(props, section) {
  const { inspectionId } = props;
  const record = props.prco.responses[inspectionId] ?? {};
  if (record.report === undefined) {
    record.report = '';
  }
  record.report += section;
}

function collectJson(props) {
  const { prco, inspectionId } = props;

  const vendor = prco.options.vendor;
  if (vendor === 'verity') {
    return prco.responses[inspectionId].responseData;
  }

  const getJsonPath = () => {
    const prefixes = {
      wis: 'soap:Envelope.soap:Body.CheckStatusResponse.CheckStatusResult.diffgr:diffgram.NewDataSet.tblInspectionRequest',
      oneguard: 'SOAP-ENV:Envelope.SOAP-ENV:Body.ns1:CancelRequestResponse.RequestResponseResult',
    };
    const prefix = prefixes[vendor] ?? '';

    return prefix;
  };

  const record = prco.responses[inspectionId] ?? { responseData: '' };

  // xml 2 json
  const parser = new XMLParser();
  const jsonObj = parser.parse(record.responseData);
  const jsonPath = getJsonPath();

  // extract section from json
  const json = get(jsonObj, jsonPath, null);

  // remove report if missing images
  const isMissingWisImages = vendor === 'wis' && json !== null && !get(json, 'Images', '');

  if (isMissingWisImages) {
    delete json.Report;
  }

  return json;
}

function collectReport(props) {
  const { prco, inspectionId } = props;
  const vendor = prco.options.vendor;
  const record = prco.responses[inspectionId];
  const json = record.responseJson;

  const result = {
    verity: json?.result,
    wis: json?.RequestID,
    oneguard: json?.request_id,
  };

  const responseInspectionId = result[vendor];
  const hasValidInspectionId = !!responseInspectionId && !!responseInspectionId.toString().length;

  let report = '\n\n---\n';
  if (hasValidInspectionId) {
    report += `Cancelled inspection id: ${responseInspectionId}\n`;
  } else {
    report += `Missing inspection id ${inspectionId} from response\n`;
  }

  return report;
}
