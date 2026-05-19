import { PrismaClient, AdminRole } from '@prisma/client'
import { randomBytes, scryptSync } from 'node:crypto'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const prisma = new PrismaClient()

function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(plain, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

// Parse `--key value` and `--key=value` flags from argv.
function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    if (key.includes('=')) {
      const [k, ...rest] = key.split('=')
      out[k] = rest.join('=')
    } else {
      out[key] = argv[i + 1] ?? ''
      i++
    }
  }
  return out
}

async function prompt(question: string, fallback?: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout })
  try {
    const ans = (await rl.question(question)).trim()
    return ans || fallback || ''
  } finally {
    rl.close()
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const email = args.email ?? process.env.ADMIN_EMAIL ?? (await prompt('Email: '))
  const password =
    args.password ?? process.env.ADMIN_PASSWORD ?? (await prompt('Password: '))
  const name = args.name ?? process.env.ADMIN_NAME ?? (await prompt('Name [Super Admin]: ', 'Super Admin'))
  const roleRaw = (args.role ?? process.env.ADMIN_ROLE ?? 'OWNER').toUpperCase()

  if (!email || !password) {
    console.error('Error: --email and --password are required.')
    process.exit(1)
  }

  const validRoles = Object.values(AdminRole) as string[]
  if (!validRoles.includes(roleRaw)) {
    console.error(`Error: invalid role "${roleRaw}". Valid: ${validRoles.join(', ')}`)
    process.exit(1)
  }
  const role = roleRaw as AdminRole

  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { password: hashPassword(password), name, role, active: true },
    create: { email, password: hashPassword(password), name, role, active: true }
  })

  console.log(`Admin upserted: ${user.email} (role=${user.role})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
