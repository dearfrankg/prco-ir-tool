export const vendors = {
  wis: {
    contentType: 'text/xml; charset=utf-8',
    getBody: (prco, requestId) => {
      if ('username' in prco.options && 'password' in prco.options) {
        const {
          options: { username, password },
        } = prco;

        return `
<soap:Envelope
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <AuthenticateHeader xmlns="http://www.wisinspections.com/">
      <Username>${username}</Username>
      <Password>${password}</Password>
    </AuthenticateHeader>
  </soap:Header>
  <soap:Body>
    <CheckStatus xmlns="http://www.wisinspections.com/">
      <RequestID>${requestId}</RequestID>
    </CheckStatus>
  </soap:Body>
</soap:Envelope>
    `;
      }

      throw new Error('Missing prop username | password | requestId');
    },
  },

  oneguard: {
    contentType: 'text/xml; charset=utf-8',
    getBody: (prco, requestId) => {
      if ('username' in prco.options && 'password' in prco.options) {
        const {
          options: { username, password, url, operation },
        } = prco;

        const fns = {
          create: '',
          ['check-status']: 'GetRequest',
          cancel: 'CancelRequest',
        };
        const fn = fns[operation];

        return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope
    xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:ns1="${url}">
    <SOAP-ENV:Header>
        <ns1:AuthenticateHeader>
            <Username>${username}</Username>
            <Password>${password}</Password>
        </ns1:AuthenticateHeader>
    </SOAP-ENV:Header>
    <SOAP-ENV:Body>
        <SOAP-ENV:${fn}>
            <request_id>${requestId}</request_id>
            <tpa_code>PRCO</tpa_code>
        </SOAP-ENV:${fn}>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
    `;
      }

      throw new Error('Missing username and password props');
    },
  },

  verity: {
    contentType: 'application/json',
    getBody: (prco, requestId) => {
      if ('api_key' in prco.options) {
        const {
          options: { api_key },
        } = prco;

        return JSON.stringify({
          api_key: api_key,
          inspection_id: requestId,
        });
      }

      throw new Error('missing api_key');
    },
  },
};
