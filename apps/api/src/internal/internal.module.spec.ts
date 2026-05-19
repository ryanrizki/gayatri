import { Test } from '@nestjs/testing'
import { InternalModule } from './internal.module'
import { InternalController } from './internal.controller'
import { InternalService } from './internal.service'
import { PrismaService } from '../prisma.service'

describe('InternalModule (DI bootstrap)', () => {
  it('compiles the module and resolves controller + service via DI', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [InternalModule] })
      .overrideProvider(PrismaService)
      .useValue({ $connect: jest.fn(), $disconnect: jest.fn() })
      .compile()

    const controller = moduleRef.get(InternalController)
    const service = moduleRef.get(InternalService)
    expect(controller).toBeInstanceOf(InternalController)
    expect(service).toBeInstanceOf(InternalService)
    await moduleRef.close()
  })
})
