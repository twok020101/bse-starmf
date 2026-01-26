export const FATCA_UPLOAD_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <AdditionalServicesResponse>
      <AdditionalServicesResult>100|Success|FATCA Data Uploaded Successfully</AdditionalServicesResult>
    </AdditionalServicesResponse>
  </soap:Body>
</soap:Envelope>`;

export const CKYC_UPLOAD_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <AdditionalServicesResponse>
      <AdditionalServicesResult>100|Success|CKYC Registration Successful. CKYC Number: CKYC123456789</AdditionalServicesResult>
    </AdditionalServicesResponse>
  </soap:Body>
</soap:Envelope>`;

export const SIP_PAUSE_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <SIPPauseResponse>
      <SIPPauseResult>100|Success|SIP Paused Successfully. Resume after 30 days.</SIPPauseResult>
    </SIPPauseResponse>
  </soap:Body>
</soap:Envelope>`;

export const SIP_PAUSE_ALREADY_PAUSED_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <SIPPauseResponse>
      <SIPPauseResult>102|Failed|SIP is Already Paused</SIPPauseResult>
    </SIPPauseResponse>
  </soap:Body>
</soap:Envelope>`;

export const XSIP_TO_SIP_SHIFT_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <XSIPToSIPShiftResponse>
      <XSIPToSIPShiftResult>100|Success|XSIP Converted to Regular SIP Successfully. New SIP ID: 12345678</XSIPToSIPShiftResult>
    </XSIPToSIPShiftResponse>
  </soap:Body>
</soap:Envelope>`;
