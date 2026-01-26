import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import { EncryptorOptions } from './encryptor.types';

export class PasswordEncryptor {
  private options: Required<EncryptorOptions>;

  constructor(options: EncryptorOptions = {}) {
    this.options = {
      algorithm: options.algorithm || 'AES',
      mode: options.mode || 'ECB',
      padding: options.padding || 'Pkcs7',
    };
  }

  encrypt(plaintext: string, passkey: string): string {
    const encrypted = AES.encrypt(plaintext, passkey, {
      mode: this.getMode(),
      padding: this.getPadding(),
    });
    return encrypted.toString();
  }

  decrypt(ciphertext: string, passkey: string): string {
    const decrypted = AES.decrypt(ciphertext, passkey, {
      mode: this.getMode(),
      padding: this.getPadding(),
    });
    return decrypted.toString(Utf8);
  }

  private getMode(): object {
    const CryptoJS = require('crypto-js');
    const modeName = this.options.mode.toUpperCase();
    const mode = (CryptoJS.mode as Record<string, object>)[modeName];
    return mode || CryptoJS.mode.ECB;
  }

  private getPadding(): object {
    const CryptoJS = require('crypto-js');
    const padName = this.options.padding.charAt(0).toUpperCase() + this.options.padding.slice(1).toLowerCase();
    const pad = (CryptoJS.pad as Record<string, object>)[padName];
    return pad || CryptoJS.pad.Pkcs7;
  }
}
