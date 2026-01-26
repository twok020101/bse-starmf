export const PURCHASE_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <orderEntryParamResponse>
      <orderEntryParamResult>NEW|20260126123456000001|12345678|TESTUSER|TESTMEMBER|UCC001|Order Confirmed Successfully|0</orderEntryParamResult>
    </orderEntryParamResponse>
  </soap:Body>
</soap:Envelope>`;

export const REDEMPTION_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <orderEntryParamResponse>
      <orderEntryParamResult>NEW|20260126123456000002|12345679|TESTUSER|TESTMEMBER|UCC001|Redemption Order Confirmed|0</orderEntryParamResult>
    </orderEntryParamResponse>
  </soap:Body>
</soap:Envelope>`;

export const ORDER_REJECTED_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <orderEntryParamResponse>
      <orderEntryParamResult>NEW|20260126123456000003|||TESTMEMBER|UCC001|Insufficient Units|1</orderEntryParamResult>
    </orderEntryParamResponse>
  </soap:Body>
</soap:Envelope>`;

export const INVALID_SCHEME_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <orderEntryParamResponse>
      <orderEntryParamResult>NEW|20260126123456000004|||TESTMEMBER|UCC001|Invalid Scheme Code|1</orderEntryParamResult>
    </orderEntryParamResponse>
  </soap:Body>
</soap:Envelope>`;

export const EMPTY_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <orderEntryParamResponse>
      <orderEntryParamResult></orderEntryParamResult>
    </orderEntryParamResponse>
  </soap:Body>
</soap:Envelope>`;
