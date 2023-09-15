#!/usr/bin/env node
/* eslint-disable no-console */

const { getOptions } = require('../utils/get-options');
const { process } = require('../modules/process');

const prcoIRTool = async () => {
  Promise.resolve()
    .then(getOptions)
    .then(process)
    .catch((e) => {
      e.message ? console.log('Error: ', e.message) : console.log(JSON.stringify(e, null, 2));
    });
};

prcoIRTool();
