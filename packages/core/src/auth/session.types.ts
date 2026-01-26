/**
 * Represents an authenticated session with BSE StAR MF API.
 */
export interface Session {
  /**
   * Session identifier (encrypted password token).
   */
  id: string;

  /**
   * BSE user ID associated with this session.
   */
  userId: string;

  /**
   * BSE member ID associated with this session.
   */
  memberId: string;

  /**
   * AES-encrypted password for API authentication.
   */
  encryptedPassword: string;

  /**
   * Timestamp when the session was created.
   */
  createdAt: Date;

  /**
   * Timestamp when the session expires.
   *
   * Sessions are valid for 1 hour from creation.
   */
  expiresAt: Date;

  /**
   * Whether the session is currently valid.
   */
  isValid: boolean;
}

/**
 * Internal state for session management.
 */
export interface SessionState {
  /** Currently active session, or null if not authenticated */
  currentSession: Session | null;

  /** Pending refresh promise, or null if no refresh in progress */
  pendingRefresh: Promise<Session> | null;
}

/**
 * Checks if the session has expired.
 *
 * @returns {boolean} True if current time is at or past expiry time
 */
export function isSessionExpired(this: Session): boolean {
  return Date.now() >= this.expiresAt.getTime();
}
