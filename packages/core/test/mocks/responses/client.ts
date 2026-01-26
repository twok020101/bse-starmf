export const CLIENT_REGISTRATION_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <RegistrationResponse>
      <RegistrationResult>100|UCC123456|Client Registered Successfully</RegistrationResult>
    </RegistrationResponse>
  </soap:Body>
</soap:Envelope>`;

export const CLIENT_REGISTRATION_DUPLICATE_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <RegistrationResponse>
      <RegistrationResult>102|UCC123456|Client Code Already Exists</RegistrationResult>
    </RegistrationResponse>
  </soap:Body>
</soap:Envelope>`;

export const CLIENT_REGISTRATION_INVALID_PAN_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <RegistrationResponse>
      <RegistrationResult>104||Invalid PAN Card Number</RegistrationResult>
    </RegistrationResponse>
  </soap:Body>
</soap:Envelope>`;

export const CLIENT_MODIFICATION_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <RegistrationResponse>
      <RegistrationResult>100|UCC123456|Client Details Updated Successfully</RegistrationResult>
    </RegistrationResponse>
  </soap:Body>
</soap:Envelope>`;
