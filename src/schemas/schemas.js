import { z } from 'zod';

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
  request: /^\d+(?:,\/(?:([a-z]+\/)+[a-z]+)?)?$/,
};

const BaseOptionsSchema = z.object({
  config_env_file: z.string(),
  operation: z.enum(['check-status', 'cancel']),
  vendor: z.enum(['wis', 'oneguard', 'verity']),
  environment: z.enum(['test', 'production']),
  requests: z.array(z.string().regex(regexp.request, { message: 'invalid path' })),
});

const JsonOptionsSchema = BaseOptionsSchema.merge(
  z.object({
    json: z.string(),
  }),
);

export const CliOptionsSchema = z.union([BaseOptionsSchema, JsonOptionsSchema]);

// export const EnvOptionsSchema = z.discriminatedUnion("vendor", [
//   CliOptionsSchema.omit({ vendor: true }).merge(
//     z.object({
//       vendor: z.literal("wis"),
//       wis_credentials: z.string(),
//       wis_test_url: z.string(),
//       wis_prod_url: z.string(),
//       wis_report_folder: z.string(),
//     }),
//   ),
//   CliOptionsSchema.omit({ vendor: true }).merge(
//     z.object({
//       vendor: z.literal("oneguard"),
//       oneguard_credentials: z.string(),
//       oneguard_test_url: z.string(),
//       oneguard_prod_url: z.string(),
//       oneguard_report_folder: z.string(),
//     }),
//   ),
//   CliOptionsSchema.omit({ vendor: true }).merge(
//     z.object({
//       vendor: z.literal("verity"),
//       verity_api_key: z.string(),
//       verity_test_url: z.string(),
//       verity_prod_url: z.string(),
//       verity_report_folder: z.string(),
//     }),
//   ),
// ]);

// export const FinalOptionsSchema = z.discriminatedUnion("vendor", [
//   CliOptionsSchema.omit({ vendor: true }).merge(
//     z.object({
//       vendor: z.enum(["wis", "oneguard"]),
//       username: z.string(),
//       password: z.string(),
//       url: z.string(),
//       report_folder: z.string(),
//     }),
//   ),
//   CliOptionsSchema.omit({ vendor: true }).merge(
//     z.object({
//       vendor: z.literal("verity"),
//       api_key: z.string(),
//       url: z.string(),
//       report_folder: z.string(),
//     }),
//   ),
// ]);

// export type CollectEnvProps = z.infer<typeof CliOptionsSchema>;
// export type DeriveFromEnvProps = z.infer<typeof EnvOptionsSchema>;
// export type FinalOptions = z.infer<typeof FinalOptionsSchema>;

// export type Vendors = {
//   readonly [index: string]: any;
// };

// type Record = {
//   requestId: string;
//   path: string;
//   payload: string;
//   responseStatus: number;
//   responseData: string;
//   responseJson: any;
//   report: string;
// };

// type Records = {
//   [key: string]: Partial<Record>;
// };

// export type PrcoProps = {
//   options: FinalOptions;
//   requestIds: string[];
//   responses: Records;
// };

// export type PrcoRequestProps = {
//   prco: PrcoProps;
//   requestId: string;
// };
