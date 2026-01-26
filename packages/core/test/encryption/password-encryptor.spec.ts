import { PasswordEncryptor } from '../../src/encryption/password-encryptor';

describe('PasswordEncryptor', () => {
  let encryptor: PasswordEncryptor;

  beforeEach(() => {
    encryptor = new PasswordEncryptor();
  });

  describe('encrypt', () => {
    it('should encrypt a plaintext password', () => {
      const plaintext = 'myPassword123';
      const passkey = 'testPasskey';

      const ciphertext = encryptor.encrypt(plaintext, passkey);

      expect(ciphertext).toBeDefined();
      expect(typeof ciphertext).toBe('string');
      expect(ciphertext).not.toBe(plaintext);
    });

    it('should produce different ciphertexts for same plaintext with different passkeys', () => {
      const plaintext = 'myPassword123';
      const passkey1 = 'passkey1';
      const passkey2 = 'passkey2';

      const ciphertext1 = encryptor.encrypt(plaintext, passkey1);
      const ciphertext2 = encryptor.encrypt(plaintext, passkey2);

      expect(ciphertext1).not.toBe(ciphertext2);
    });

    it('should produce decryptable ciphertexts for same inputs', () => {
      const plaintext = 'myPassword123';
      const passkey = 'testPasskey';

      const ciphertext1 = encryptor.encrypt(plaintext, passkey);
      const ciphertext2 = encryptor.encrypt(plaintext, passkey);

      expect(ciphertext1).not.toBe(ciphertext2);
      expect(encryptor.decrypt(ciphertext1, passkey)).toBe(plaintext);
      expect(encryptor.decrypt(ciphertext2, passkey)).toBe(plaintext);
    });
  });

  describe('decrypt', () => {
    it('should decrypt an encrypted password correctly', () => {
      const plaintext = 'myPassword123';
      const passkey = 'testPasskey';

      const ciphertext = encryptor.encrypt(plaintext, passkey);
      const decrypted = encryptor.decrypt(ciphertext, passkey);

      expect(decrypted).toBe(plaintext);
    });

    it('should fail to decrypt with wrong passkey', () => {
      const plaintext = 'myPassword123';
      const correctPasskey = 'correctPasskey';
      const wrongPasskey = 'wrongPasskey';

      const ciphertext = encryptor.encrypt(plaintext, correctPasskey);
      const decrypted = encryptor.decrypt(ciphertext, wrongPasskey);

      expect(decrypted).not.toBe(plaintext);
    });

    it('should handle special characters in password', () => {
      const plaintext = 'P@ss!word#123$';
      const passkey = 'testPasskey';

      const ciphertext = encryptor.encrypt(plaintext, passkey);
      const decrypted = encryptor.decrypt(ciphertext, passkey);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle empty password', () => {
      const plaintext = '';
      const passkey = 'testPasskey';

      const ciphertext = encryptor.encrypt(plaintext, passkey);
      const decrypted = encryptor.decrypt(ciphertext, passkey);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('with custom options', () => {
    it('should work with ECB mode (default)', () => {
      const encryptor = new PasswordEncryptor({ mode: 'ECB' });
      const plaintext = 'testPassword';
      const passkey = 'passkey';

      const ciphertext = encryptor.encrypt(plaintext, passkey);
      const decrypted = encryptor.decrypt(ciphertext, passkey);

      expect(decrypted).toBe(plaintext);
    });

    it('should work with CBC mode', () => {
      const encryptor = new PasswordEncryptor({ mode: 'CBC' });
      const plaintext = 'testPassword';
      const passkey = 'passkey';

      const ciphertext = encryptor.encrypt(plaintext, passkey);
      const decrypted = encryptor.decrypt(ciphertext, passkey);

      expect(decrypted).toBe(plaintext);
    });
  });
});
