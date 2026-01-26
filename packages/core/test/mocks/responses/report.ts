export const ORDER_STATUS_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <OrderStatusResponse>
      <OrderStatusResult>NEW|20260126123456000001|12345678|PENDING|Order is under process</OrderStatusResult>
    </OrderStatusResponse>
  </soap:Body>
</soap:Envelope>`;

export const ORDER_STATUS_COMPLETED_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <OrderStatusResponse>
      <OrderStatusResult>NEW|20260126123456000001|12345678|CONFIRMED|Order confirmed. Units allocated.</OrderStatusResult>
    </OrderStatusResponse>
  </soap:Body>
</soap:Envelope>`;

export const ORDER_STATUS_NOT_FOUND_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <OrderStatusResponse>
      <OrderStatusResult|||0|Order not found</OrderStatusResult>
    </OrderStatusResponse>
  </soap:Body>
</soap:Envelope>`;

export const ALLOTMENT_STATEMENT_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <AllotmentStatementResponse>
      <AllotmentStatementResult>100|Success|<NewDataSet>
  <Table>
    <OrderId>12345678</OrderId>
    <ClientCode>UCC001</ClientCode>
    <SchemeCode>119603</SchemeCode>
    <SchemeName>HDFC Mid-Cap Opportunities Fund - Growth</SchemeName>
    <AllotedUnits>28.456</AllotedUnits>
    <AllotedNAV>175.2356</AllotedNAV>
    <TransactionDate>26/01/2026</TransactionDate>
    <ProcessingDate>26/01/2026</ProcessingDate>
  </Table>
</NewDataSet></AllotmentStatementResult>
    </AllotmentStatementResponse>
  </soap:Body>
</soap:Envelope>`;

export const REDEMPTION_STATEMENT_SUCCESS_RESPONSE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <RedemptionStatementResponse>
      <RedemptionStatementResult>100|Success|<NewDataSet>
  <Table>
    <OrderId>12345679</OrderId>
    <ClientCode>UCC001</ClientCode>
    <SchemeCode>119603</SchemeCode>
    <SchemeName>HDFC Mid-Cap Opportunities Fund - Growth</SchemeName>
    <RedeemedUnits>28.456</RedeemedUnits>
    <RedeemedNAV>175.2356</RedeemedNAV>
    <TransactionDate>26/01/2026</TransactionDate>
    <ProcessingDate>26/01/2026</ProcessingDate>
  </Table>
</NewDataSet></RedemptionStatementResult>
    </RedemptionStatementResponse>
  </soap:Body>
</soap:Envelope>`;
