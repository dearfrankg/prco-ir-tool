/* eslint-disable no-console */
const { templateSchemas } = require('../schemas');

const oneguardTemplates = {
  create: (data) => {
    const result = templateSchemas.oneguard.create.safeParse(data);
    if (!result.success) {
      console.log('result: ', result);
    }

    const inspectionReasons = data.InspectionReasons.map((reason) => {
      return `              <item>${reason}</item>`;
    }).join('');

    return {
      contentType: 'text/xml; charset=utf-8',
      body: `
<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope
  xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:ns1="https://test.oneguardinspections.com/webService/api">
  <SOAP-ENV:Header>
      <ns1:AuthenticateHeader>
          <UserName>${data.UserName}</UserName>
          <Password>${data.Password}</Password>
      </ns1:AuthenticateHeader>
  </SOAP-ENV:Header>
  <SOAP-ENV:Body>
      <SOAP-ENV:SendInspectionRequestTPA>
          <RequesterName>${data.RequesterName}</RequesterName>
          <RequesterExt>${data.RequesterExt}</RequesterExt>
          <RequesterEmail>${data.RequesterEmail}</RequesterEmail>
          <ContractHolder>${data.ContractHolder}</ContractHolder>
          <SaleDate>${data.SaleDate}</SaleDate>
          <SaleOdometer>${data.SaleOdometer}</SaleOdometer>
          <VehicleYear>${data.VehicleYear}</VehicleYear>
          <VehicleMake>${data.VehicleMake}</VehicleMake>
          <VehicleModel>${data.VehicleModel}</VehicleModel>
          <Mileage>${data.Mileage}</Mileage>
          <VIN>${data.VIN}</VIN>
          <ContractNumber>${data.ContractNumber}</ContractNumber>
          <ClaimNumber>${data.ClaimNumber}</ClaimNumber>
          <InspectionType>${data.InspectionType}</InspectionType>
          <InspectionReason>
${inspectionReasons}
          </InspectionReason>
          <RepairSite>${data.RepairSite}</RepairSite>
          <Address1>${data.Address1}</Address1>
          <Address2>${data.Address2}</Address2>
          <City>${data.City}</City>
          <State>${data.State}</State>
          <Zip>${data.Zip}</Zip>
          <Phone>${data.Phone}</Phone>
          <Contact>${data.Contact}</Contact>
          <TpaCode>PRCO</TpaCode>
      </SOAP-ENV:SendInspectionRequestTPA>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`.replace(/\n/g, ''),
    };
  },

  check: (data) => {
    const result = templateSchemas.oneguard.check.safeParse(data);
    if (!result.success) {
      console.log('result: ', result);
    }

    return {
      contentType: 'text/xml; charset=utf-8',
      body: `
<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope
    xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:ns1="https://oneguardinspections.com/webService/status/api">
    <SOAP-ENV:Header>
        <ns1:AuthenticateHeader>
            <Username>${data.Username}</Username>
            <Password>${data.Password}</Password>
        </ns1:AuthenticateHeader>
    </SOAP-ENV:Header>
    <SOAP-ENV:Body>
        <SOAP-ENV:GetRequest>
            <request_id>${data.request_id}</request_id>
            <tpa_code>PRCO</tpa_code>
        </SOAP-ENV:GetRequest>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`.replace(/\n/g, ''),
    };
  },

  cancel: (data) => {
    const result = templateSchemas.oneguard.cancel.safeParse(data);
    if (!result.success) {
      console.log('result: ', result);
    }

    return {
      contentType: 'text/xml; charset=utf-8',
      body: `
<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope
    xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:ns1="https://test.oneguardinspections.com/webService/cancel/api">
    <SOAP-ENV:Header>
        <ns1:AuthenticateHeader>
            <Username>${data.Username}</Username>
            <Password>${data.Password}</Password>
        </ns1:AuthenticateHeader>
    </SOAP-ENV:Header>
    <SOAP-ENV:Body>
        <SOAP-ENV:CancelRequest>
            <request_id>${data.request_id}</request_id>
            <tpa_code>PRCO</tpa_code>
        </SOAP-ENV:CancelRequest>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`.replace(/\n/g, ''),
    };
  },
};

module.exports = {
  oneguardTemplates,
};
