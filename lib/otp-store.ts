// OTP session store for authentication
// This is a singleton that can be imported by multiple files

export interface OTPSession {
  email: string;
  otp: string;
  expiresAt: number;
  isNewUser: boolean;
}

class OTPStoreClass {
  private sessions: Map<string, OTPSession> = new Map();

  // Store a new OTP session
  set(sessionId: string, session: OTPSession): void {
    this.sessions.set(sessionId, session);
  }

  // Get an OTP session
  get(sessionId: string): OTPSession | undefined {
    return this.sessions.get(sessionId);
  }

  // Delete an OTP session
  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  // Verify an OTP
  verifyOTP(sessionId: string, email: string, otp: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    // Check if session has expired
    if (session.expiresAt < Date.now()) {
      this.sessions.delete(sessionId);
      return false;
    }

    // Check if email matches
    if (session.email !== email) {
      return false;
    }

    // Check if OTP matches
    if (session.otp !== otp) {
      return false;
    }

    return true;
  }
}

// Export a singleton instance
export const OTPStore = new OTPStoreClass();
