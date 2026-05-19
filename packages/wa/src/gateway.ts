export interface WaSendResult {
  ok: boolean
  providerRef?: string
  error?: string
}

export interface WaGateway {
  readonly name: string
  send(to: string, body: string): Promise<WaSendResult>
}
