export const MANDATE_REGISTRATION_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <MandateRegistrationResponse>
      <MandateRegistrationResult>100|789456123|Mandate Registration Successful. Awaiting Bank Approval.</MandateRegistrationResult>
    </MandateRegistrationResponse>
  </soap:Body>
</soap:Envelope>`;

export const MANDATE_STATUS_ACTIVE_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <MandateStatusResponse>
      <MandateStatusResult>100|789456123|ACTIVE|15/01/2026|31/12/2099|Mandate is Active</MandateStatusResult>
    </MandateStatusResponse>
  </soap:Body>
</soap:Envelope>`;

export const MANDATE_STATUS_PENDING_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <MandateStatusResponse>
      <MandateStatusResult>101|789456123|PENDING||Mandate is Pending Bank Approval</MandateStatusResult>
    </MandateStatusResponse>
  </soap:Body>
</soap:Envelope>`;

export const MANDATE_STATUS_REJECTED_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <MandateStatusResponse>
      <MandateStatusResult>102|789456123|REJECTED||Mandate Rejected by Bank - Signature Mismatch</MandateStatusResult>
    </MandateStatusResponse>
  </soap:Body>
</soap:Envelope>`;

export const MANDATE_SHIFT_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <MandateShiftResponse>
      <MandateShiftResult>100|789456123|Mandate Transferred Successfully to New Account</MandateShiftResult>
    </MandateShiftResponse>
  </soap:Body>
</soap:Envelope>`;
