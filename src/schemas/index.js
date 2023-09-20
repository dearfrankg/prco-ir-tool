const { z } = require('zod');

function shape(schema) {
  const shape = {};

  for (const key in schema.shape) {
    shape[key] = schema.shape[key].t;
  }

  return shape;
}

const regexp = {
  /*
    non capturing group -- /(?:alpha)/ -- ignore alpha
    optional group -- /(?:alpha)?/ -- alpha is optional
  */

  /*
    legal choices:
    12345
    12345,/
    12345,/a/b
  */
  inspectionItems: /^\d+(?:,\/(?:([a-z]+\/)+[a-z]+)?)?$/,
};

const BaseOptionsSchema = z.object({
  config_env_file: z.string(),
  operation: z.enum(['check-status', 'cancel', 'create']),
  vendor: z.enum(['wis', 'oneguard', 'verity']),
  environment: z.enum(['test', 'production']),
  inspectionItems: z.array(z.string().regex(regexp.inspectionItems, { message: 'invalid inspection item' })),
});

const CreateOptionsSchema = BaseOptionsSchema.omit({ inspectionItems: true }).merge(
  z.object({ json: z.string(), jsonObj: z.any().optional() }),
);

const WisEnvSchema = z.object({
  wis_credentials: z.string(),
  wis_test_url: z.string(),
  wis_prod_url: z.string(),
  wis_report_folder: z.string(),
});

const OneguardEnvSchema = z.object({
  oneguard_credentials: z.string(),
  oneguard_test_url: z.string(),
  oneguard_prod_url: z.string(),
  oneguard_report_folder: z.string(),
});

const VerityEnvSchema = z.object({
  verity_api_key: z.string(),
  verity_test_url: z.string(),
  verity_prod_url: z.string(),
  verity_report_folder: z.string(),
});

const EnvSchema = z.union([WisEnvSchema, OneguardEnvSchema, VerityEnvSchema]);

const NonVerityOptionsSchema = z.object({
  username: z.string(),
  password: z.string(),
  url: z.string(),
  report_folder: z.string(),
});

const VerityOptionsSchema = z.object({
  api_key: z.string(),
  url: z.string(),
  report_folder: z.string(),
});

const VerityBaseOptionsSchema = BaseOptionsSchema.merge(VerityOptionsSchema);
const VerityCreateOptionsSchema = CreateOptionsSchema.merge(VerityOptionsSchema);
const NonVerityBaseOptionsSchema = BaseOptionsSchema.merge(NonVerityOptionsSchema);
const NonVerityCreateOptionsSchema = CreateOptionsSchema.merge(NonVerityOptionsSchema);

const templateSchemas = {
  oneguard: {
    create: z.object({
      UserName: z.string().max(30).required(),
      Password: z.string().max(255).required(),
      RequesterName: z.string().max(60).required(),
      RequesterExt: z.string().max(10),
      RequesterEmail: z.string().max(100),
      ContractHolder: z.string().max(91),
      SaleDate: z.string().datetime().required(),
      SaleOdometer: z.string().max(10),
      VehicleYear: z.string().max(4).required(),
      VehicleMake: z.string().max(25).required(),
      VehicleModel: z.string().max(100).required(),
      Mileage: z.string().max(10).required(),
      VIN: z.string().max(17),
      ContractNumber: z.string().max(20).required(),
      ClaimNumber: z.string().max(20).required(),
      InspectionType: z.string().required(),
      InspectionReasons: z.array(z.string()).max(15).required(),
      RepairSite: z.string().max(60).required(),
      Address1: z.string().max(30),
      Address2: z.string().max(30),
      City: z.string().max(30),
      State: z.string().max(2),
      Zip: z.string().max(12),
      Phone: z.string().max(10),
      Contact: z.string().max(60).required(),
    }),

    check: z.object({
      Username: z.string(),
      Password: z.string(),
      request_id: z.string(),
    }),

    cancel: z.object({
      Username: z.string(),
      Password: z.string(),
      request_id: z.string(),
    }),
  },

  verity: {
    create: z.object({
      api_key: z.string().required(),
      reference_number: z.string().required(),
      sale_date: z.string(),
      sale_mileage: z.string(),
      vehicle_year: z.string().required(),
      vehicle_make: z.string().required(),
      vehicle_model: z.string().required(),
      vehicle_mileage: z.string().required(),
      vin: z.string().required(),
      contract_holder: z.string(),
      contract_no: z.string().required(),
      insp_reason: z.string().required(),
      repair_site: z.string().required(),
      facility_addr1: z.string().required(),
      facility_addr2: z.string(),
      facility_city: z.string().required(),
      facility_state: z.string().required(),
      facility_zip: z.string().required(),
      contact_name: z.string().required(),
      contact_phone: z.string().required(),
      req_name: z.string().required(),
      req_ext: z.string(),
      req_email: z.string(),
      failures: z.array(
        z.object({
          cause: z.string(),
          complaint: z.string(),
          correction: z.string(),
        }),
      ),
    }),

    check: z.object({
      api_key: z.string(),
      inspection_id: z.string(),
    }),

    cancel: z.object({
      api_key: z.string(),
      inspection_id: z.string(),
    }),
  },

  wis: {
    create: z.object({
      Username: z.string().required(),
      Password: z.string().required(),
      RequesterName: z.string().required(),
      RequesterExt: z.string().required(),
      RequesterEmail: z.string().required(),
      ContractHolder: z.string().required(),
      ContractSale: z.string().required(),
      ContractMileage: z.string().required(),
      VehicleYear: z.string().required(),
      VehicleMake: z.string().required(),
      VehicleModel: z.string().required(),
      Mileage: z.string().required(),
      VinNo: z.string().required(),
      ContractNo: z.string().required(),
      AuthorizationNo: z.string().required(),
      InspectionType: z.string().required(),
      InspectionReasons: z.array(z.string()).max(18).required(),
      RepairSite: z.string().required(),
      Address1: z.string().required(),
      Address2: z.string().required(),
      City: z.string().required(),
      State: z.string().required(),
      Zip: z.string().required(),
      Phone: z.string().required(),
      Contact: z.string().required(),
    }),

    check: z.object({
      Username: z.string(),
      Password: z.string(),
      RequestID: z.string(),
    }),

    cancel: z.object({
      Username: z.string(),
      Password: z.string(),
      RequestID: z.string(),
    }),
  },
};

module.exports = {
  shape,
  BaseOptionsSchema,
  CreateOptionsSchema,
  EnvSchema,
  VerityBaseOptionsSchema,
  VerityCreateOptionsSchema,
  NonVerityBaseOptionsSchema,
  NonVerityCreateOptionsSchema,
  templateSchemas,
};
