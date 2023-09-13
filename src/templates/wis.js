/* eslint-disable no-console */
import { templateSchemas } from '../schemas';

export const wisTemplates = {
  create: (data) => {
    const result = templateSchemas.wis.create.safeParse(data);
    if (!result.success) {
      console.log('result: ', result);
    }

    const InspectionReasons = data.InspectionReasons.map((reason) => {
      return `        <anyType xsi:type="xsd:string">${reason}</anyType>\n`;
    }).join('');

    return {
      contentType: 'text/xml; charset=utf-8',
      body: `
<soap:Envelope
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <AuthenticateHeader xmlns="http://www.wisinspections.com/">
      <Username>${data.Username}</Username>
      <Password>${data.Password}</Password>
    </AuthenticateHeader>
  </soap:Header>
  <soap:Body>
    <SendRequestB xmlns="http://www.wisinspections.com/">
      <RequesterName>${data.RequesterName}</RequesterName>
      <RequesterExt>${data.RequesterExt}</RequesterExt>
      <RequesterEmail>${data.RequesterEmail}</RequesterEmail>
      <ContractHolder>${data.ContractHolder}</ContractHolder>
      <ContractSale>${data.ContractSale}</ContractSale>
      <ContractMileage>${data.ContractMileage}</ContractMileage>
      <VehicleYear>${data.VehicleYear}</VehicleYear>
      <VehicleMake>${data.VehicleMake}</VehicleMake>
      <VehicleModel>${data.VehicleModel}</VehicleModel>
      <Mileage>${data.Mileage}</Mileage>
      <VinNo>${data.VinNo}</VinNo>
      <ContractNo>${data.ContractNo}</ContractNo>
      <AuthorizationNo>${data.AuthorizationNo}</AuthorizationNo>
      <InspectionType>${data.InspectionType}</InspectionType>
      <InspectionReason>
${InspectionReasons}
      </InspectionReason>
      <RepairSite>${data.RepairSite}</RepairSite>
      <Address1>${data.Address1}</Address1>
      <Address2>${data.Address2}</Address2>
      <City>${data.City}</City>
      <State>${data.State}</State>
      <Zip>${data.Zip}</Zip>
      <Phone>${data.Phone}</Phone>
      <Contact>${data.Contact}</Contact>
    </SendRequestB>
  </soap:Body>
</soap:Envelope>`,
    };
  },

  check: (data) => {
    const result = templateSchemas.wis.check.safeParse(data);
    if (!result.success) {
      console.log('result: ', result);
    }

    return {
      contentType: 'text/xml; charset=utf-8',
      body: `
<soap:Envelope
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <AuthenticateHeader xmlns="http://www.wisinspections.com/">
      <Username>${data.Username}</Username>
      <Password>${data.Password}</Password>
    </AuthenticateHeader>
  </soap:Header>
  <soap:Body>
    <CheckStatus xmlns="http://www.wisinspections.com/">
      <RequestID>${data.RequestID}</RequestID>
    </CheckStatus>
  </soap:Body>
</soap:Envelope>`,
    };
  },

  cancel: (data) => {
    const result = templateSchemas.wis.cancel.safeParse(data);
    if (!result.success) {
      console.log('result: ', result);
    }

    return {
      contentType: 'text/xml; charset=utf-8',
      body: `
<soap:Envelope
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <AuthenticateHeader xmlns="http://www.wisinspections.com/">
      <Username>${data.Username}</Username>
      <Password>${data.Password}</Password>
    </AuthenticateHeader>
  </soap:Header>
  <soap:Body>
    <CheckStatus xmlns="http://www.wisinspections.com/">
      <RequestID>${data.RequestID}</RequestID>
    </CheckStatus>
  </soap:Body>
</soap:Envelope>`,
    };
  },
};
