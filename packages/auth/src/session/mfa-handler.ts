import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class MfaHandler {
  generateSecret(userEmail: string): { secret: string; otpauthUrl: string } {
    const secret = speakeasy.generateSecret({
      name: `DiamondFlow (${userEmail})`,
      issuer: 'DiamondFlow',
      length: 20,
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url!,
    };
  }

  async generateQrCode(otpauthUrl: string): Promise<string> {
    return qrcode.toDataURL(otpauthUrl);
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }

  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(this.generateBackupCode());
    }
    return codes;
  }

  private generateBackupCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}