/* eslint-disable no-console */

import parseArgs from 'minimist';
import * as schema from '../schemas';
import { usage, isUnique, hasExistingPath, hasExistingFolder } from '../utils';
import { config } from 'dotenv';

const vendors = getVendorsEnvResources();

export function getOptions() {
  return Promise.resolve() //
    .then(collectMinimistOptions)
    .then(collectEnvOptions)
    .then(deriveFromEnv);
  // .then(printOptions);
}

function collectMinimistOptions() {
  // configure aliases
  const optionsConfig = {
    config_env_file: 'c',
    operation: 'o',
    vendor: 'v',
    environment: 'e',
    json: 'j',
    help: 'h',
  };

  // parse options
  const options = parseArgs(process.argv.slice(2), {
    string: [...Object.keys(optionsConfig), '_'],
    alias: optionsConfig,
    default: {
      environment: 'test',
      config_env_file: `${process.env.HOME}/protected/prco-ir-tool-env`,
    },
    unknown: () => {
      throw new Error('Unknown option.');
    },
  });

  // help request
  const isHelpWanted = options.help !== undefined;

  if (isHelpWanted) {
    printUsage();
    process.exit(1);
  }

  const isCreateOperation = options.operation === 'create';
  const hasInspectionIds = options._.length > 0;
  let result;

  if (isCreateOperation) {
    prepCreateOperation({ hasInspectionIds, options });
    result = schema.CreateOptionsSchema.safeParse(options);
  } else {
    prepNonCreateOperation({ options });
    result = schema.BaseOptionsSchema.safeParse({
      ...options,
      inspectionIds: options._,
    });
  }

  // validate

  if (result.success) {
    return result.data;
  } else {
    throw result.error;
  }
}

function prepCreateOperation({ hasInspectionIds, options }) {
  if (hasInspectionIds) {
    throw new Error('create operation should not have inspection ids');
  }

  // throw on invalid json
  try {
    options.jsonObj = JSON.parse(options.json ?? '');
  } catch (e) {
    throw new Error('Invalid JSON option');
  }
}

function prepNonCreateOperation({ options }) {
  const inspectionIds = options._.map((id) => id.split(',')[0] ?? '');

  if (inspectionIds.length === 0) {
    throw new Error('Inspection ids are missing');
  }

  if (!isUnique(inspectionIds)) {
    throw new Error('Inspection ids are not unique');
  }
}

function printUsage() {
  console.log(usage);
  process.exit(1);
}

function collectEnvOptions(options) {
  const { config_env_file } = options;

  // verify config path
  if (!hasExistingPath(config_env_file)) {
    throw new Error(`Missing env file: ${config_env_file}`);
  }

  config({ path: config_env_file });

  const { vendor } = options;
  const vendorResources = vendors[vendor];

  // populate and verify a value
  const validEnvVars = populateEnvVars(vendorResources);

  const newOptions = { ...options, ...validEnvVars };

  // validate
  const result = schema.EnvSchema.safeParse(newOptions);

  if (result.success) {
    return { ...options, ...result.data };
  } else {
    throw result.error;
  }
}

function populateEnvVars(vendorResources) {
  const validEnvVars = {};
  let reason = '';
  vendorResources.envVars.forEach((envVar) => {
    const value = process.env[envVar];
    const isInvalidEnvVar = value === undefined || value.length === 0;

    if (isInvalidEnvVar) {
      reason += `Invalid env variable: ${envVar}\n`;
    } else {
      validEnvVars[envVar] = value;
    }

    if (reason) {
      throw new Error(reason);
    }
  });

  return validEnvVars;
}

function deriveFromEnv(options) {
  const { vendor } = options;
  const vendorResources = vendors[vendor];

  // expend credentials and validate env vars for only one vendor
  const expandedOptions = vendorResources.expand(options);

  // confirm report folder
  if ('report_folder' in expandedOptions) {
    const reportFolder = expandedOptions.report_folder;

    if (!hasExistingFolder(reportFolder)) {
      throw new Error(`Missing report folder: ${reportFolder}`);
    }
  }

  const schemaMap = {
    verity: {
      create: schema.VerityCreateOptionsSchema,
      nonCreate: schema.VerityBaseOptionsSchema,
    },
    nonVerity: {
      create: schema.NonVerityCreateOptionsSchema,
      nonCreate: schema.NonVerityBaseOptionsSchema,
    },
  };

  const schemaVendor = options.vendor === 'verity' ? 'verity' : 'nonVerity';
  const schemaOperation = options.operation === 'create' ? 'create' : 'nonCreate';
  const FinalOptionsSchema = schemaMap[schemaVendor][schemaOperation];

  // validate final options
  const result = FinalOptionsSchema.safeParse(expandedOptions);

  if (result.success) {
    return result.data;
  } else {
    throw result.error;
  }
}

function getVendorsEnvResources() {
  return {
    wis: {
      envVars: [
        'wis_credentials', //
        'wis_test_url',
        'wis_prod_url',
        'wis_report_folder',
      ],

      expand: (options) => {
        if (!('wis_credentials' in options)) {
          throw new Error('bad luck');
        }

        // derive username, password from wis_credentials
        const [wis_username, wis_password] = options.wis_credentials
          .toString() //
          .split(',');
        if (!wis_username || !wis_password) {
          throw new Error('Invalid formatting of wis credentials');
        }

        // derive props
        const isProduction = options.environment === 'production';
        const expandedOptions = {
          ...options,
          username: wis_username.trim(),
          password: wis_password.trim(),
          url: isProduction ? options.wis_prod_url : options.wis_test_url,
          report_folder: options.wis_report_folder,
        };

        // remove vendor entries
        Object.keys(expandedOptions).forEach((key) => {
          key.startsWith('wis') && delete expandedOptions[key];
        });

        return expandedOptions;
      },
    },

    oneguard: {
      envVars: ['oneguard_credentials', 'oneguard_test_url', 'oneguard_prod_url', 'oneguard_report_folder'],

      expand: (options) => {
        if (!('oneguard_credentials' in options)) {
          throw new Error('bad luck');
        }

        // derive username, password from oneguard_credentials
        const [oneguard_username, oneguard_password] = options.oneguard_credentials
          .toString() //
          .split(',');
        if (!oneguard_username || !oneguard_password) {
          throw new Error('Invalid formatting of oneguard credentials');
        }

        // derive url
        const suffix = {
          create: '/api',
          ['check-status']: '/status/api',
          cancel: '/cancel/api',
        };
        const isProduction = options.environment === 'production';
        const url = isProduction
          ? options.oneguard_prod_url + suffix[options.operation]
          : options.oneguard_test_url + suffix[options.operation];

        // derive props
        const expandedOptions = {
          ...options,
          username: oneguard_username.trim(),
          password: oneguard_password.trim(),
          url,
          report_folder: options.oneguard_report_folder,
        };

        // remove vendor entries
        Object.keys(expandedOptions).forEach((key) => {
          key.startsWith('oneguard') && delete expandedOptions[key];
        });

        return expandedOptions;
      },
    },

    verity: {
      envVars: [
        'verity_api_key', //
        'verity_test_url',
        'verity_prod_url',
        'verity_report_folder',
      ],

      expand: (options) => {
        if (!('verity_api_key' in options)) {
          throw new Error('bad luck');
        }

        // derive url
        const suffix = {
          create: 'create-inspection',
          ['check-status']: 'check-inspection',
          cancel: 'cancel-inspection',
        };
        const isProduction = options.environment === 'production';
        const url = isProduction
          ? options.verity_prod_url + suffix[options.operation]
          : options.verity_test_url + suffix[options.operation];

        // derive props
        const expandedOptions = {
          ...options,
          api_key: options.verity_api_key.trim(),
          url,
          report_folder: options.verity_report_folder,
        };

        // remove vendor entries
        Object.keys(expandedOptions).forEach((key) => {
          key.startsWith('verity') && delete expandedOptions[key];
        });

        return expandedOptions;
      },
    },
  };
}

// function printOptions(options) {
//   console.log('options: ', options);
//   return options;
// }
