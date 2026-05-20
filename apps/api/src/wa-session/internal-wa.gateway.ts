import { Injectable } from '@nestjs/common'
import type { WaGateway, WaSendResult } from '@gayatri/wa'
import { WaSessionService } from './wa-session.service'

/**
 * WaGateway impl that talks to the in-process Baileys session — no HTTP hop.
 * Selected when WA_PROVIDER=internal.
 */
@Injectable()
export class InternalWaGateway implements WaGateway {
  readonly name = 'internal'
  constructor(private readonly session: WaSessionService) {}
  async send(to: string, body: string): Promise<WaSendResult> {
    return this.session.send(to, body)
  }
}
