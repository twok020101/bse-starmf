import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import type { EncryptorOptions } from './encryptor.types';

/**
 * Service for encrypting and decrypting passwords using AES-256.
 *
 * Implements AES encryption as required by BSE StAR MF API specification.
 * Uses ECB mode by default (as per BSE spec) with PKCS7 padding.
 *
 * @example
 * ```typescript
 * const encryptor = new PasswordEncryptor();
 *
 * // Encrypt password
 * const encrypted = encryptor.encrypt('myPassword', 'myPasskey');
 *
 * // Decrypt password
 * const decrypted = encryptor.decrypt(encrypted, 'myPasskey');
 * ```
 */
export class PasswordEncryptor {
  private options: Required<EncryptorOptions>;

  /**
   * Creates a new PasswordEncryptor instance.
   *
   * @param options - Encryption configuration options
   * @param options.algorithm - Encryption algorithm (default: 'AES')
   * @param options.mode - Cipher mode (default: 'ECB')
   * @param options.padding - Padding scheme (default: 'Pkcs7')
   */
  constructor(options: EncryptorOptions = {}) {
    this.options = {
      algorithm: options.algorithm ?? 'AES',
      mode: options.mode ?? 'ECB',
      padding: options.padding ?? 'Pkcs7',
    };
  }

  /**
   * Encrypts a plaintext string using AES encryption.
   *
   * @param plaintext - The text to encrypt (e.g., password)
   * @param passkey - The encryption key
   * @returns {string} Base64-encoded encrypted ciphertext
   */
  encrypt(plaintext: string, passkey: string): string {
    const encrypted = AES.encrypt(plaintext, passkey, {
      mode: this.getMode(),
      padding: this.getPadding(),
    });
    return encrypted.toString();
  }

  /**
   * Decrypts an AES-encrypted ciphertext.
   *
   * @param ciphertext - Base64-encoded encrypted text
   * @param passkey - The encryption key (must match the one used for encryption)
   * @returns {string} Decrypted plaintext string
   */
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
    return mode ?? CryptoJS.mode.ECB;
  }

  private getPadding(): object {
    const CryptoJS = require('crypto-js');
    const padName =
      this.options.padding.charAt(0).toUpperCase() + this.options.padding.slice(1).toLowerCase();
    const pad = (CryptoJS.pad as Record<string, object>)[padName];
    return pad ?? CryptoJS.pad.Pkcs7;
  }
}
