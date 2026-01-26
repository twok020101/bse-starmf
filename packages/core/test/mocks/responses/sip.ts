export const SIP_REGISTRATION_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <sipOrderEntryParamResponse>
      <sipOrderEntryParamResult>NEW|20260126123456000005|TESTMEMBER|UCC001|TESTUSER|12345678|SIP Registered Successfully|0|SIP123456</sipOrderEntryParamResult>
    </sipOrderEntryParamResponse>
  </soap:Body>
</soap:Envelope>`;

export const SIP_CANCELLATION_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <sipOrderEntryParamResponse>
      <sipOrderEntryParamResult>CXL|20260126123456000006|TESTMEMBER|UCC001|TESTUSER|12345678|SIP Cancelled Successfully|0|</sipOrderEntryParamResult>
    </sipOrderEntryParamResponse>
  </soap:Body>
</soap:Envelope>`;

export const SIP_INVALID_REG_ID_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <sipOrderEntryParamResponse>
      <sipOrderEntryParamResult>CXL|20260126123456000007|TESTMEMBER||TESTUSER|0|Invalid SIP Registration ID|1|</sipOrderEntryParamResult>
    </sipOrderEntryParamResponse>
  </soap:Body>
</soap:Envelope>`;

export const XSIP_REGISTRATION_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <xsipOrderEntryParamResponse>
      <xsipOrderEntryParamResult>NEW|20260126123456000008|TESTMEMBER|UCC001|TESTUSER|23456789|XSIP Registered Successfully|0|</xsipOrderEntryParamResult>
    </xsipOrderEntryParamResponse>
  </soap:Body>
</soap:Envelope>`;

export const XSIP_CANCELLATION_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <xsipOrderEntryParamResponse>
      <xsipOrderEntryParamResult>CXL|20260126123456000009|TESTMEMBER|UCC001|TESTUSER|23456789|XSIP Cancelled Successfully|0|</xsipOrderEntryParamResult>
    </xsipOrderEntryParamResponse>
  </soap:Body>
</soap:Envelope>`;
