/**
 * Configuration options for password encryption.
 */
export type EncryptorOptions = {
  /** Encryption algorithm (default: 'AES') */
  algorithm?: string;

  /** Cipher mode: 'ECB', 'CBC', 'CFB', 'CTR', 'OFB' (default: 'ECB') */
  mode?: string;

  /** Padding scheme: 'Pkcs7', 'AnsiX923', 'Iso10126', 'Iso97971', 'NoPadding', 'ZeroPadding' (default: 'Pkcs7') */
  padding?: string;
};
