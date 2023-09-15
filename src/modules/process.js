/* eslint-disable no-console */
const { createIR } = require('./create-ir');
const { cancelIR } = require('./cancel-ir');
const { checkStatusIR } = require('./check-status-ir');
const { sortStringsNumerically } = require('../utils/utils');

const process = (options) => {
  return Promise.resolve(options) //
    .then(printStartBanner)
    .then(createRequestPlaceholder)
    .then(executeOperations)
    .then(printReport)
    .then(printFinishBanner);
};

async function createRequestPlaceholder(prco) {
  const { operation, inspectionItems } = prco.options;
  const isCreateOperation = operation === 'create';

  if (isCreateOperation) {
    return prco;
  }

  prco.inspectionIds = inspectionItems.map((item) => item.split(',')[0] ?? '').sort(sortStringsNumerically);

  prco.inspectionIds.forEach((inspectionId) => {
    const request = inspectionItems.filter((r) => r.startsWith(inspectionId)).join('');
    const path = request.split(',')[1] ?? '';
    prco.responses[inspectionId] = {
      inspectionId,
      path: path,
    };
  });

  return prco;
}

async function executeOperations(prco) {
  const operation = prco.options.operation;
  const isCreateOperation = operation === 'create';

  if (isCreateOperation) {
    await createIR(prco);
  } else {
    const promises = Object.keys(prco.responses).map((inspectionId) => {
      if (operation === 'check-status') {
        return checkStatusIR({ prco, inspectionId });
      }

      if (operation === 'cancel') {
        return cancelIR({ prco, inspectionId });
      }
    });

    await Promise.all(promises);
  }

  return prco;
}

function printStartBanner(options) {
  const { operation, vendor, environment, inspectionItems } = options;

  let report = `
Starting process:
operation: ${operation}
vendor: ${vendor}
environment: ${environment}
`;

  const isCreateOperation = operation === 'create';
  if (!isCreateOperation) {
    const sortedInspectionIds = inspectionItems
      .sort(sortStringsNumerically)
      .map((request) => request.split(',')[0])
      .join(', ');

    report += `inspection ids: ${sortedInspectionIds}`;
  }

  console.log(report);

  return {
    options,
    responses: {},
    inspectionIds: [],
  };
}

function printReport(prco) {
  prco.inspectionIds.forEach((inspectionId) => {
    const record = prco.responses[inspectionId];
    if (record?.report) {
      console.log(record.report);
    }
  });

  return prco;
}

function printFinishBanner() {
  console.log(`\n\nFinished process\n\n`);
}

module.exports = {
  process,
};
