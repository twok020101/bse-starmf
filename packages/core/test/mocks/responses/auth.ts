export const AUTH_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <getPasswordResponse>
      <getPasswordResult>100|Success|encrypted_session_token</getPasswordResult>
    </getPasswordResponse>
  </soap:Body>
</soap:Envelope>`;

export const AUTH_FAILURE_INVALID_USER = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <getPasswordResponse>
      <getPasswordResult>102|Invalid User ID or Password</getPasswordResult>
    </getPasswordResponse>
  </soap:Body>
</soap:Envelope>`;

export const AUTH_FAILURE_DISABLED_USER = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <getPasswordResponse>
      <getPasswordResult>103|User is disabled. Contact Admin</getPasswordResult>
    </getPasswordResponse>
  </soap:Body>
</soap:Envelope>`;

export const AUTH_FAILURE_MEMBER_SUSPENDED = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <getPasswordResponse>
      <getPasswordResult>104|Member is suspended. Contact Admin</getPasswordResult>
    </getPasswordResponse>
  </soap:Body>
</soap:Envelope>`;
