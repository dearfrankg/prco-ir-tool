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
  inspectionId: /^\d+(?:,\/(?:([a-z]+\/)+[a-z]+)?)?$/,
};

export const BaseOptionsSchema = z.object({
  config_env_file: z.string(),
  operation: z.enum(['check-status', 'cancel', 'create']),
  vendor: z.enum(['wis', 'oneguard', 'verity']),
  environment: z.enum(['test', 'production']),
  inspectionIds: z.array(z.string().regex(regexp.inspectionId, { message: 'invalid inspection id' })),
});

export const CreateOptionsSchema = BaseOptionsSchema.omit({ inspectionIds: true }).merge(
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
