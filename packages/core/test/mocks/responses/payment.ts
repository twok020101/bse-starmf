export const PAYMENT_URL_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <DirectPaymentGatewayResponse>
      <DirectPaymentGatewayResult>100|SUCCESS|https://payment.bseindia.com/pay?id=PAY123456789</DirectPaymentGatewayResult>
    </DirectPaymentGatewayResponse>
  </soap:Body>
</soap:Envelope>`;

export const PAYMENT_STATUS_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <PaymentStatusResponse>
      <PaymentStatusResult>100|SUCCESS|PAY123456789|5000|Payment Received</PaymentStatusResult>
    </PaymentStatusResponse>
  </soap:Body>
</soap:Envelope>`;

export const PAYMENT_STATUS_PENDING_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <PaymentStatusResponse>
      <PaymentStatusResult>101|PENDING|PAY123456789||Payment Under Process</PaymentStatusResult>
    </PaymentStatusResponse>
  </soap:Body>
</soap:Envelope>`;

export const SINGLE_PAYMENT_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <SinglePaymentAPIResponse>
      <SinglePaymentAPIResult>100|SUCCESS|SP123456789|Payment Initiated Successfully</SinglePaymentAPIResult>
    </SinglePaymentAPIResponse>
  </soap:Body>
</soap:Envelope>`;
