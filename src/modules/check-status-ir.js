import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { get } from 'lodash-es';
import { createFolder, downloadFile, hasExistingFolder, hasExistingPath, vendors } from '../utils';

const HTTP_CODE_OK = 200;
const HTTP_CODE_NOT_FOUND = 404;

export const checkStatusIR = ({ prco, inspectionId }) => {
  return Promise.resolve({ prco, inspectionId }) //
    .then(callCheckStatusApi)
    .then(processResponse)
    .then(downloadReport);
};

async function callCheckStatusApi(props) {
  const { prco, inspectionId } = props;
  const vendor = prco.options.vendor;

  const axiosOptions = {
    method: 'POST',
    url: prco.options.url,
    data: vendors[vendor].getBody(prco, inspectionId),
    headers: {
      ['Content-Type']: vendors[vendor].contentType,
    },
  };

  await axios(axiosOptions)
    .then(({ status, data }) => {
      prco.responses[inspectionId] = {
        ...prco.responses[inspectionId],
        payload: axiosOptions.data,
        responseStatus: status,
        responseData: data,
      };
    })
    .catch((error) => {
      const { status, data } = error.response;
      prco.responses[inspectionId] = {
        ...prco.responses[inspectionId],
        payload: axiosOptions.data,
        responseStatus: status,
        responseData: data,
      };
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

  if (status.missing_data) {
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
    verity: isVendor.verity && responseStatus === HTTP_CODE_OK,
    wis: isVendor.wis && responseStatus === HTTP_CODE_OK && !!responseJson?.RequestID,
    oneguard: isVendor.oneguard && !!responseJson?.request_id,
  };

  const status = {
    ok: responseStatus === HTTP_CODE_OK && isOk[vendor],
    not_found: responseStatus === HTTP_CODE_NOT_FOUND,
    missing_data: responseJson === null,
  };

  return status;
}

function collectJson(props) {
  const { prco, inspectionId } = props;
  const record = prco.responses[inspectionId];

  const vendor = prco.options.vendor;
  if (vendor === 'verity') {
    return record.responseData;
  }

  const getJsonPath = () => {
    const prefixes = {
      wis: 'soap:Envelope.soap:Body.CheckStatusResponse.CheckStatusResult.diffgr:diffgram.NewDataSet.tblInspectionRequest',
      oneguard: 'SOAP-ENV:Envelope.SOAP-ENV:Body.ns1:GetRequestResponse.RequestResponseResult',
    };
    const prefix = prefixes[vendor] ?? '';

    return prefix;
  };

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
  const record = prco.responses[inspectionId];
  const json = record.responseJson;
  const vendor = prco.options.vendor;

  const isWisReport = vendor === 'wis';
  const missingJson = !json || json === null || (!isWisReport && !json.status);

  if (missingJson) {
    return '';
  }

  const reportFormats = {
    wis: () => {
      const report = `
inspection_id: ${json.RequestID}
details: ${json.Details}
images: ${json.Images}
report_pdf: ${json.Report}`;

      return report.slice(1);
    },

    oneguard: () => {
      const report = `
inspection_id: ${inspectionId}
status: ${json.status}
state: ${json.state}
message: ${json.message}
report_pdf: ${json.report_pdf}`;

      return report.slice(1);
    },

    verity: () => {
      const report = `
inspection_id: ${inspectionId}
status: ${json.status}
details: ${json.details_url}
report_pdf: ${json.report_url}`;

      return report.slice(1);
    },
  };

  let report = '\n\n---\n';
  report += reportFormats[vendor]();
  report += `\n`;

  return report;
}

function appendReport(props, section) {
  const { inspectionId } = props;
  const record = props.prco.responses[inspectionId] ?? {};
  if (record.report === undefined) {
    record.report = '';
  }
  record.report += section;
}

function getTargetPath(props) {
  const { inspectionId } = props;
  const basePath = props.prco.options.report_folder;
  const requestPath = props.prco.responses[inspectionId]?.path;
  const targetFolder = `${basePath}${requestPath}`;

  return targetFolder;
}

function getReportPath(props) {
  const { inspectionId } = props;
  const targetFolder = getTargetPath(props);
  const reportPath = `/${inspectionId}/${inspectionId}.pdf`;
  const reportFile = `${targetFolder}${reportPath}`;

  return reportFile;
}

function downloadReport(props) {
  if (preparedForDownload(props)) {
    download(props);
    appendReport(props, `Download completed`);
  } else {
    appendReport(props, `Download skipped`);
  }
}

function preparedForDownload(props) {
  const { prco, inspectionId } = props;
  const record = prco.responses[inspectionId];
  const vendor = prco.options.vendor;

  const status = getStatus(props);

  if (status.not_found || status.missing_data) {
    return false;
  }

  const hasReportUrl = () => {
    const suffix = {
      wis: 'Report',
      oneguard: 'report_pdf',
      verity: 'report_url',
    };
    const vendorKey = suffix[vendor];
    const url = record?.responseJson[vendorKey];
    const hasReportUrl = !!url && url.startsWith('http');

    if (hasReportUrl) {
      return true;
    }

    appendReport(props, `Missing report url\n`);
    return false;
  };

  const hasTargetFolder = () => {
    const targetFolder = getTargetPath(props);
    const hasTargetFolder = hasExistingFolder(targetFolder);

    if (hasTargetFolder) {
      return true;
    }

    appendReport(props, `Missing target folder -- ${targetFolder}\n`);
    return false;
  };

  const hasExistingReportPdf = () => {
    const reportFile = getReportPath(props);
    const hasExistingReportPdf = hasExistingPath(reportFile);

    if (hasExistingReportPdf) {
      appendReport(props, `Report already exists -- ${reportFile}\n`);
      return true;
    }

    return false;
  };

  const prep = {
    hasReportUrl: hasReportUrl(),
    hasTargetFolder: hasTargetFolder(),
    hasExistingReportPdf: hasExistingReportPdf(),
  };

  const isPrepared = prep.hasReportUrl && prep.hasTargetFolder && !prep.hasExistingReportPdf;

  return isPrepared;
}

function download(props) {
  const { inspectionId } = props;
  const targetPath = getTargetPath(props);
  const reportFolder = `${targetPath}/${inspectionId}`;

  // create report folder if necessary
  Promise.resolve() //
    .then(() => {
      createFolder(reportFolder);
    })
    .catch((e) => {
      appendReport(props, `${e}\n${reportFolder}\n`);
    });

  const reportProp = {
    wis: 'Report',
    oneguard: 'report_pdf',
    verity: 'report_url',
  };
  const record = props.prco.responses[inspectionId] ?? {};
  const vendor = props.prco.options.vendor;
  const reportUrl = record?.responseJson[reportProp[vendor]] ?? '';
  const reportPath = getReportPath(props);

  // download pdf report
  Promise.resolve() //
    .then(() => {
      downloadFile(reportUrl, reportPath);
    })
    .catch((e) => {
      appendReport(props, `${e}\n${reportPath}\n`);
    });
}
