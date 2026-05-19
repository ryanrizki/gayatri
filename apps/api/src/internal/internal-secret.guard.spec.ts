import { UnauthorizedException } from '@nestjs/common'
import { InternalSecretGuard } from './internal-secret.guard'

function ctx(authHeader?: string) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: authHeader } }) })
  } as any
}

describe('InternalSecretGuard', () => {
  const OLD = process.env.INTERNAL_SECRET
  beforeAll(() => { process.env.INTERNAL_SECRET = 's3cr3t' })
  afterAll(() => { process.env.INTERNAL_SECRET = OLD })

  it('allows correct bearer secret', () => {
    expect(new InternalSecretGuard().canActivate(ctx('Bearer s3cr3t'))).toBe(true)
  })

  it('rejects missing header', () => {
    expect(() => new InternalSecretGuard().canActivate(ctx(undefined))).toThrow(UnauthorizedException)
  })

  it('rejects wrong secret', () => {
    expect(() => new InternalSecretGuard().canActivate(ctx('Bearer nope'))).toThrow(UnauthorizedException)
  })
})
