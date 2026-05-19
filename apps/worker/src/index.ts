import { startSendWorker } from './wa-send.worker.ts'
import { startReminderCron } from './reminder.cron.ts'

async function main() {
  console.log('[gayatri/worker] starting...')
  startSendWorker()
  startReminderCron()
  console.log('[gayatri/worker] ready')
}

main().catch((e) => {
  console.error('[gayatri/worker] fatal', e)
  process.exit(1)
})
