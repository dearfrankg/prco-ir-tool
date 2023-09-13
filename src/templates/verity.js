/* eslint-disable no-console */
import { templateSchemas } from '../schemas';

export const verityTemplates = {
  create: (data) => {
    const result = templateSchemas.verity.create.safeParse(data);
    if (!result.success) {
      console.log('result: ', result);
    }

    return {
      contentType: 'application/json',
      body: JSON.stringify(data),
    };
  },

  check: (data) => {
    const result = templateSchemas.verity.check.safeParse(data);
    if (!result.success) {
      console.log('result: ', result);
    }

    return {
      contentType: 'application/json',
      body: JSON.stringify(data),
    };
  },

  cancel: (data) => {
    const result = templateSchemas.verity.cancel.safeParse(data);
    if (!result.success) {
      console.log('result: ', result);
    }

    return {
      contentType: 'application/json',
      body: JSON.stringify(data),
    };
  },
};
