import { z } from 'zod';

export function shape(schema) {
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

export const BaseOptionsSchema = z.object({
  config_env_file: z.string(),
  operation: z.enum(['check-status', 'cancel', 'create']),
  vendor: z.enum(['wis', 'oneguard', 'verity']),
  environment: z.enum(['test', 'production']),
  inspectionItems: z.array(z.string().regex(regexp.inspectionItems, { message: 'invalid inspection item' })),
});

export const CreateOptionsSchema = BaseOptionsSchema.omit({ inspectionItems: true }).merge(
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

export const EnvSchema = z.union([WisEnvSchema, OneguardEnvSchema, VerityEnvSchema]);

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

export const VerityBaseOptionsSchema = BaseOptionsSchema.merge(VerityOptionsSchema);
export const VerityCreateOptionsSchema = CreateOptionsSchema.merge(VerityOptionsSchema);
export const NonVerityBaseOptionsSchema = BaseOptionsSchema.merge(NonVerityOptionsSchema);
export const NonVerityCreateOptionsSchema = CreateOptionsSchema.merge(NonVerityOptionsSchema);

export const templateSchemas = {
  oneguard: {
    create: z.object({
      UserName: z.string(),
      Password: z.string(),
      RequesterName: z.string(),
      RequesterExt: z.string(),
      RequesterEmail: z.string(),
      ContractHolder: z.string(),
      SaleDate: z.string(),
      SaleOdometer: z.string(),
      VehicleYear: z.string(),
      VehicleMake: z.string(),
      VehicleModel: z.string(),
      Mileage: z.string(),
      VIN: z.string(),
      ContractNumber: z.string(),
      ClaimNumber: z.string(),
      InspectionType: z.string(),
      InspectionReasons: z.array(z.string()),
      RepairSite: z.string(),
      Address1: z.string(),
      Address2: z.string(),
      City: z.string(),
      State: z.string(),
      Zip: z.string(),
      Phone: z.string(),
      Contact: z.string(),
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
      api_key: z.string(),
      reference_number: z.string(),
      sale_date: z.string(),
      vehicle_year: z.string(),
      vehicle_make: z.string(),
      vehicle_model: z.string(),
      vehicle_mileage: z.string(),
      vin: z.string(),
      contract_no: z.string(),
      insp_reason: z.string(),
      repair_site: z.string(),
      contact_name: z.string(),
      contact_phone: z.string(),
      req_name: z.string(),
      req_ext: z.string(),
      req_email: z.string(),
      contract_holder: z.string(),
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
      Username: z.string(),
      Password: z.string(),
      RequesterName: z.string(),
      RequesterExt: z.string(),
      RequesterEmail: z.string(),
      ContractHolder: z.string(),
      ContractSale: z.string(),
      ContractMileage: z.string(),
      VehicleYear: z.string(),
      VehicleMake: z.string(),
      VehicleModel: z.string(),
      Mileage: z.string(),
      VinNo: z.string(),
      ContractNo: z.string(),
      AuthorizationNo: z.string(),
      InspectionType: z.string(),
      InspectionReasons: z.array(z.string()),
      RepairSite: z.string(),
      Address1: z.string(),
      Address2: z.string(),
      City: z.string(),
      State: z.string(),
      Zip: z.string(),
      Phone: z.string(),
      Contact: z.string(),
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
