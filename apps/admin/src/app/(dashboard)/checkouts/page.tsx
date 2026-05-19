import { CheckoutsList } from './checkouts-list'

export default function CheckoutsPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-gayatri-600 md:text-3xl">Checkout</h1>
        <p className="text-sm text-charcoal-soft">Kelola pesanan masuk, konfirmasi jadwal, dan kirim notifikasi WA.</p>
      </div>
      <CheckoutsList initialStatus={searchParams.status ?? 'NEW'} initialQ={searchParams.q ?? ''} />
    </div>
  )
}
