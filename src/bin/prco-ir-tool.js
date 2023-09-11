#!/usr/bin/env tsx
/* eslint-disable no-console */

import { getOptions } from '../utils';

const prcoIRTool = async () => {
  Promise.resolve()
    .then(getOptions)
    .then(process)
    .catch((e) => {
      e.message ? console.log('Error: ', e.message) : console.log(JSON.stringify(e, null, 2));
    });
};

prcoIRTool();
