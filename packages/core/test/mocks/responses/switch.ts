export const SWITCH_ORDER_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <switchOrderEntryParamResponse>
      <switchOrderEntryParamResult>NEW|20260126123456000010|12345680|TESTUSER|TESTMEMBER|UCC001|Switch Order Placed Successfully|0</switchOrderEntryParamResult>
    </switchOrderEntryParamResponse>
  </soap:Body>
</soap:Envelope>`;

export const SWITCH_ORDER_INSUFFICIENT_UNITS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <switchOrderEntryParamResponse>
      <switchOrderEntryParamResult>NEW|20260126123456000011|||TESTMEMBER|UCC001|Insufficient Units in Source Scheme|1</switchOrderEntryParamResult>
    </switchOrderEntryParamResponse>
  </soap:Body>
</soap:Envelope>`;

export const SPREAD_ORDER_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <spreadOrderEntryParamResponse>
      <spreadOrderEntryParamResult>NEW|20260126123456000012|12345681|TESTUSER|TESTMEMBER|UCC001|Spread Order Placed Successfully|0</spreadOrderEntryParamResult>
    </spreadOrderEntryParamResponse>
  </soap:Body>
</soap:Envelope>`;

export const STP_REGISTRATION_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <STPRegistrationResponse>
      <STPRegistrationResult>NEW|20260126123456000013|12345682|TESTUSER|TESTMEMBER|UCC001|STP Registered Successfully|0</STPRegistrationResult>
    </STPRegistrationResponse>
  </soap:Body>
</soap:Envelope>`;

export const STP_CANCELLATION_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <STPRegistrationResponse>
      <STPRegistrationResult>CXL|20260126123456000014|12345683|TESTUSER|TESTMEMBER|UCC001|STP Cancelled Successfully|0</STPRegistrationResult>
    </STPRegistrationResponse>
  </soap:Body>
</soap:Envelope>`;
