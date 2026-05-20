import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const app = await NestFactory.create(AppModule, {
    cors: { origin: origins, credentials: true }
  })
  app.use(cookieParser())
  app.setGlobalPrefix('v1')
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000)
  await app.listen(port)
  console.log(`Gayatri API listening on :${port}`)
}

bootstrap()
