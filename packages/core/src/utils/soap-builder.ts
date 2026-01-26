/**
 * Utility class for building SOAP envelopes for BSE StAR MF API requests.
 *
 * Handles the construction of properly formatted SOAP XML messages
 * with namespace prefixes, headers, and body elements.
 *
 * @example
 * ```typescript
 * const envelope = SOAPBuilder.build(
 *   'bses',
 *   'http://bsestarmf.in/',
 *   'orderEntryParam',
 *   {
 *     TransCode: 'NEW',
 *     TransNo: '20260126MEMBER000001',
 *     ClientCode: 'UCC001',
 *   }
 * );
 * ```
 */
export class SOAPBuilder {
  private static readonly SOAP_ENVELOPE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:{namespacePrefix}="{namespace}">
  <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">
    <wsa:Action>{soapAction}</wsa:Action>
    <wsa:To>{endpoint}</wsa:To>
  </soap:Header>
  <soap:Body>
    {body}
  </soap:Body>
</soap:Envelope>`;

  /**
   * Builds a complete SOAP envelope with header and body.
   *
   * @param prefix - XML namespace prefix (e.g., 'bses')
   * @param namespace - XML namespace URI (e.g., 'http://bsestarmf.in/')
   * @param methodName - The SOAP method to call
   * @param params - Method parameters as key-value pairs
   * @param endpoint - Optional endpoint URL for header
   * @returns Complete SOAP XML envelope as string
   */
  static build(
    prefix: string,
    namespace: string,
    methodName: string,
    params: Record<string, unknown>,
    endpoint?: string
  ): string {
    const soapAction = `${namespace}${methodName}`;
    const body = this.buildMethodElement(prefix, namespace, methodName, params);

    return this.SOAP_ENVELOPE.replace('{namespacePrefix}', prefix)
      .replace('{namespace}', namespace)
      .replace('{soapAction}', soapAction)
      .replace('{endpoint}', endpoint || '')
      .replace('{body}', body);
  }

  /**
   * Builds the method element body without the envelope wrapper.
   *
   * @param prefix - XML namespace prefix
   * @param namespace - XML namespace URI
   * @param methodName - The SOAP method name
   * @param params - Method parameters
   * @returns SOAP body element as XML string
   */
  static buildMethodElement(
    prefix: string,
    namespace: string,
    methodName: string,
    params: Record<string, unknown>
  ): string {
    const paramElements = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        const formattedKey = this.formatParamName(key);
        return `<${prefix}:${formattedKey}>${this.escapeXml(String(value))}</${prefix}:${formattedKey}>`;
      })
      .join('\n');

    return `<${prefix}:${methodName}>\n${paramElements}\n</${prefix}:${methodName}>`;
  }

  private static formatParamName(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  private static escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
