import { PrismaClient } from '@prisma/client'
import { randomBytes, scryptSync } from 'node:crypto'

const prisma = new PrismaClient()

function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(plain, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

async function main() {
  console.log('Seeding Gayatri DB...')

  // Admin owner
  await prisma.adminUser.upsert({
    where: { email: 'owner@gayatri.local' },
    update: {},
    create: {
      email: 'owner@gayatri.local',
      password: hashPassword('gayatri123'),
      name: 'Owner',
      role: 'OWNER'
    }
  })

  // Branch
  const branch = await prisma.branch.upsert({
    where: { id: 'branch-main' },
    update: {},
    create: {
      id: 'branch-main',
      name: 'Gayatri Pusat',
      address: 'Jl. Mawar No. 1, Jakarta',
      phone: '021-1234567'
    }
  })

  // Category
  const oilCat = await prisma.category.upsert({
    where: { slug: 'baby-oil' },
    update: {},
    create: { slug: 'baby-oil', name: 'Baby Oil & Cream', order: 1 }
  })
  const toolCat = await prisma.category.upsert({
    where: { slug: 'baby-tools' },
    update: {},
    create: { slug: 'baby-tools', name: 'Perlengkapan Bayi', order: 2 }
  })

  // Services
  const services = [
    { slug: 'baby-spa-newborn', name: 'Baby Spa Newborn', description: 'Relaxing spa untuk bayi 0-3 bulan', priceIdr: 150000, durationMin: 45, ageMinMonth: 0, ageMaxMonth: 3 },
    { slug: 'baby-spa-infant', name: 'Baby Spa Infant', description: 'Spa lengkap untuk bayi 3-12 bulan', priceIdr: 175000, durationMin: 60, ageMinMonth: 3, ageMaxMonth: 12 },
    { slug: 'baby-massage', name: 'Baby Massage', description: 'Pijat bayi tradisional', priceIdr: 100000, durationMin: 30, ageMinMonth: 0, ageMaxMonth: 24 },
    { slug: 'baby-swim', name: 'Baby Swim', description: 'Berenang sehat dengan neck ring', priceIdr: 125000, durationMin: 30, ageMinMonth: 3, ageMaxMonth: 18 }
  ]
  for (const s of services) {
    const imageUrl = `https://picsum.photos/seed/${s.slug}/600/400`
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: { imageUrl, gallery: [imageUrl] },
      create: { ...s, active: true, imageUrl, gallery: [imageUrl] }
    })
  }

  // Products
  const products = [
    { slug: 'baby-oil-100ml', name: 'Baby Oil 100ml', description: 'Minyak telon herbal', priceIdr: 35000, stock: 50, categoryId: oilCat.id },
    { slug: 'baby-cream', name: 'Baby Cream 50g', description: 'Pelembab kulit bayi', priceIdr: 45000, stock: 30, categoryId: oilCat.id },
    { slug: 'baby-neck-ring', name: 'Neck Ring Swim', description: 'Pelampung leher untuk baby swim', priceIdr: 85000, stock: 15, categoryId: toolCat.id }
  ]
  for (const p of products) {
    const imageUrl = `https://picsum.photos/seed/${p.slug}/600/400`
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { imageUrl, gallery: [imageUrl] },
      create: { ...p, active: true, imageUrl, gallery: [imageUrl] }
    })
  }

  // Banner
  const bannerImage = 'https://picsum.photos/seed/gayatri-hero/1200/600'
  await prisma.banner.upsert({
    where: { id: 'banner-welcome' },
    update: { imageUrl: bannerImage },
    create: {
      id: 'banner-welcome',
      imageUrl: bannerImage,
      title: 'Selamat Datang di Gayatri',
      order: 1,
      active: true
    }
  })

  // WA Templates
  const templates = [
    { code: 'T-ADM-001', name: 'New Checkout (Admin)', body: '🆕 Checkout Baru #{code}\n\nCustomer: {name} ({phone})\nBayi: {baby_name}, {baby_age}\nAlamat: {address}\n\nItems:\n{items_list}\n\nTotal: Rp{total}\nTanggal preferensi: {preferred_date}\nCatatan: {notes}\n\nBuka admin: {admin_url}' },
    { code: 'T-CUS-001', name: 'Checkout Received (Customer)', body: 'Halo {name}, checkout #{code} diterima.\nAdmin akan hubungi via WA untuk konfirmasi jadwal.\nTerima kasih 🙏' },
    { code: 'T-CUS-002', name: 'Confirmed (Customer)', body: '✅ Booking Dikonfirmasi #{code}\n\n{service_name}\n📅 {date} {hour}\n📍 {branch_address}\n💰 Rp{total}\n\nSampai jumpa, {baby_name}!' },
    { code: 'T-CUS-003', name: 'Reschedule (Customer)', body: 'ℹ️ Jadwal Diubah #{code}\nJadwal baru: {new_date} {new_hour}\nMohon konfirmasi balas YA.' },
    { code: 'T-CUS-004', name: 'Cancelled (Customer)', body: '❌ Booking Dibatalkan #{code}\nAlasan: {reason}\nHubungi kami jika butuh info.' },
    { code: 'T-CUS-005', name: 'Reminder H-1 (Customer)', body: '🔔 Reminder: besok {hour} jadwal spa {baby_name}.\nMohon hadir 10 menit sebelumnya.\nAlamat: {address}' },
    { code: 'T-CUS-006', name: 'Reminder H-3jam (Customer)', body: '⏰ 3 jam lagi jadwal {baby_name}.\nPersiapkan handuk + baju ganti ya.' },
    { code: 'T-CUS-007', name: 'Done (Customer)', body: '🌸 Terima kasih sudah pakai Gayatri.\nSemoga {baby_name} sehat selalu.' },
    { code: 'T-ADM-002', name: 'Low Stock (Admin)', body: '⚠️ Stok rendah: {product} tinggal {qty}.' }
  ]
  for (const t of templates) {
    await prisma.waTemplate.upsert({
      where: { code: t.code },
      update: { body: t.body, name: t.name },
      create: { ...t, active: true }
    })
  }

  // Settings
  const settings = [
    { key: 'business_name', value: 'Gayatri Baby Spa' },
    { key: 'business_phone', value: '+62 812-3456-7890' },
    { key: 'business_address', value: 'Jl. Mawar No. 1, Jakarta' },
    { key: 'business_hours', value: '09:00-18:00' },
    { key: 'admin_wa_number', value: process.env.ADMIN_WA_NUMBER ?? '6282132091173' },
    { key: 'reminder_h1_enabled', value: 'true' },
    { key: 'reminder_h3_enabled', value: 'true' }
  ]
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s
    })
  }

  console.log('Seed complete.')
  console.log('Admin login: owner@gayatri.local / gayatri123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
