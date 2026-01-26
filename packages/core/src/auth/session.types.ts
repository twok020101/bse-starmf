export interface Session {
  id: string;
  userId: string;
  memberId: string;
  encryptedPassword: string;
  createdAt: Date;
  expiresAt: Date;
  isValid: boolean;
}

export interface SessionState {
  currentSession: Session | null;
  pendingRefresh: Promise<Session> | null;
}

export function isSessionExpired(this: Session): boolean {
  return Date.now() >= this.expiresAt.getTime();
}
