import axios from 'axios';
import { BSEConfig } from '../client/client.types';
import { Session, SessionState, isSessionExpired } from './session.types';
import { SOAPBuilder } from '../utils/soap-builder';
import { BSEError } from '../errors/bse-error';
import { SESSION_EXPIRY } from '../config/environments';

export class SessionManager {
  private config: BSEConfig;
  private state: SessionState;

  constructor(config: BSEConfig) {
    this.config = config;
    this.state = {
      currentSession: null,
      pendingRefresh: null,
    };
  }

  async createSession(userId: string, encryptedPassword: string): Promise<Session> {
    const soapEnvelope = SOAPBuilder.build(
      'bses',
      'http://bsestarmf.in/',
      'getPassword',
      {
        UserId: userId,
        Password: encryptedPassword,
        PassKey: this.config.passkey,
      }
    );

    const baseUrl = this.config.baseUrl || this.getBaseUrl();

    const response = await axios.post(
      `${baseUrl}/MFOrderEntry/MFOrder.svc/Secure`,
      soapEnvelope,
      {
        headers: { 'Content-Type': 'text/xml; charset=utf-8' },
        timeout: this.config.timeout,
      }
    );

    const result = this.parseAuthResponse(response.data);

    if (result.code !== '100') {
      throw new BSEError('AUTH_FAILED', result.message || 'Authentication failed');
    }

    const session: Session = {
      id: result.encryptedPassword,
      userId,
      memberId: this.config.memberId,
      encryptedPassword: result.encryptedPassword,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + SESSION_EXPIRY.MF_ORDER),
      isValid: true,
    };

    this.state.currentSession = session;
    return session;
  }

  async getSession(): Promise<Session> {
    if (!this.state.currentSession) {
      throw new BSEError('NO_SESSION', 'No active session. Please authenticate first.');
    }

    if (isSessionExpired.call(this.state.currentSession)) {
      if (this.state.pendingRefresh) {
        return this.state.pendingRefresh;
      }
      this.state.pendingRefresh = this.refreshSession();
      try {
        return await this.state.pendingRefresh;
      } finally {
        this.state.pendingRefresh = null;
      }
    }

    return this.state.currentSession;
  }

  async refreshSession(): Promise<Session> {
    if (!this.state.currentSession) {
      throw new BSEError('NO_SESSION', 'No session to refresh');
    }

    return this.createSession(
      this.state.currentSession.userId,
      this.state.currentSession.encryptedPassword
    );
  }

  clearSession(): void {
    this.state.currentSession = null;
    this.state.pendingRefresh = null;
  }

  private getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://bsestarmf.bseindia.com'
      : 'https://bsestarmfdemo.bseindia.com';
  }

  private parseAuthResponse(soapResponse: string): {
    code: string;
    message?: string;
    encryptedPassword: string;
  } {
    try {
      const parser = new (require('fast-xml-parser').XMLParser)();
      const doc = parser.parse(soapResponse);
      const resultText =
        doc?.['soap:Envelope']?.['soap:Body']?.['getPasswordResponse']?.['getPasswordResult']?.['#text'] ||
        doc?.['soap:Envelope']?.['soap:Body']?.['getPasswordResponse']?.['getPasswordResult'] ||
        '';

      if (!resultText || typeof resultText !== 'string') {
        throw new BSEError('EMPTY_RESPONSE', 'Empty authentication response');
      }

      const parts = resultText.split('|');
      return {
        code: parts[0] || '',
        message: parts[1],
        encryptedPassword: parts[1] || '',
      };
    } catch (error) {
      if (error instanceof BSEError) {
        throw error;
      }
      throw new BSEError('PARSE_ERROR', 'Failed to parse authentication response');
    }
  }
}
