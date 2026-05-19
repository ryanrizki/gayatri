import Link from 'next/link'
import { ServiceForm } from '../service-form'

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/services" className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-soft hover:text-gayatri-600">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Kembali
        </Link>
        <h1 className="mt-2 font-display text-2xl font-medium text-gayatri-600 md:text-3xl">Tambah Layanan</h1>
      </div>
      <ServiceForm />
    </div>
  )
}
