import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { PrismaService } from '../prisma.service'

const JWT_TTL = 60 * 60 * 8 // 8h

function secret(): Uint8Array {
  const s = process.env.ADMIN_SESSION_SECRET ?? process.env.JWT_SECRET
  if (!s) throw new Error('ADMIN_SESSION_SECRET not set')
  return new TextEncoder().encode(s)
}

export interface AdminTokenPayload {
  sub: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'STAFF'
}

@Injectable()
export class AdminAuthService {
  constructor(private db: PrismaService) {}

  async verifyPassword(plain: string, stored: string): Promise<boolean> {
    // Stored from seed = "salt:hash" via scrypt. Allow bcrypt prefix too.
    if (stored.startsWith('$2')) {
      return bcrypt.compare(plain, stored)
    }
    const [salt, hash] = stored.split(':')
    if (!salt || !hash) return false
    const { scryptSync, timingSafeEqual } = await import('node:crypto')
    const computed = scryptSync(plain, salt, 64)
    const expected = Buffer.from(hash, 'hex')
    if (expected.length !== computed.length) return false
    return timingSafeEqual(computed, expected)
  }

  async login(email: string, password: string) {
    const user = await this.db.adminUser.findUnique({ where: { email } })
    if (!user || !user.active) throw new UnauthorizedException('Invalid credentials')
    const ok = await this.verifyPassword(password, user.password)
    if (!ok) throw new UnauthorizedException('Invalid credentials')

    const token = await new SignJWT({ email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(`${JWT_TTL}s`)
      .sign(secret())

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    }
  }

  async verify(token: string): Promise<AdminTokenPayload> {
    const { payload } = await jwtVerify(token, secret())
    return payload as unknown as AdminTokenPayload
  }
}
