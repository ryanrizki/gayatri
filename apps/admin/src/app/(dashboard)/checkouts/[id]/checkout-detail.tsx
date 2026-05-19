'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { formatDate, formatIdr, relativeTime } from '@/lib/format'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/empty'
import { ConfirmDialog } from './action-confirm'
import { RescheduleDialog } from './action-reschedule'
import { CancelDialog } from './action-cancel'
import { SimpleActionButton } from './action-simple'

type Detail = {
  id: string
  code: string
  status: string
  totalIdr: number
  notes: string | null
  cancelReason: string | null
  preferredDate: string | null
  scheduledAt: string | null
  doneAt: string | null
  createdAt: string
  customer: { id: string; name: string; phone: string; email: string | null; address: string | null }
  child: { name: string; ageMonth: number | null; gender: string | null } | null
  branch: { id: string; name: string } | null
  therapist: { id: string; name: string } | null
  items: { id: string; type: string; serviceId: string | null; productId: string | null; qty: number; priceIdr: number; nameSnapshot: string }[]
  waLogs: { id: string; templateCode: string; status: string; createdAt: string; error: string | null }[]
}

export function CheckoutDetail({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['checkout', id],
    queryFn: () => adminApi<Detail>(`/admin/checkouts/${id}`)
  })

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center py-16">
        <Spinner />
      </Card>
    )
  }
  if (isError || !data) {
    return <Card className="text-sm text-red-600">Gagal memuat detail checkout.</Card>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href="/checkouts" className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-soft hover:text-gayatri-600">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Kembali
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="font-display text-2xl font-medium text-gayatri-600 md:text-3xl">{data.code}</h1>
            <StatusBadge status={data.status} />
          </div>
          <p className="text-xs text-charcoal-soft">Dibuat {relativeTime(data.createdAt)} · {formatDate(data.createdAt)}</p>
        </div>
        <ActionBar status={data.status} id={data.id} onChanged={() => refetch()} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Item Pesanan</CardTitle>
            <CardDescription>{data.items.length} item · Total {formatIdr(data.totalIdr)}</CardDescription>
          </CardHeader>
          <div className="overflow-hidden rounded-xl border border-outline-soft/30">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-charcoal-soft">
                <tr>
                  <th className="px-4 py-2 font-semibold">Jenis</th>
                  <th className="px-4 py-2 font-semibold">Nama</th>
                  <th className="px-4 py-2 font-semibold">Qty</th>
                  <th className="px-4 py-2 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-soft/20">
                {data.items.map((it) => (
                  <tr key={it.id}>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gayatri-50 px-2 py-0.5 text-[10px] font-semibold text-gayatri-600">
                        {it.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-charcoal">{it.nameSnapshot}</td>
                    <td className="px-4 py-3 text-charcoal-soft">{it.qty}</td>
                    <td className="px-4 py-3 text-right font-semibold text-charcoal">{formatIdr(it.priceIdr * it.qty)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-cream-100">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-xs font-semibold uppercase text-charcoal-soft">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right font-display text-lg font-medium text-gayatri-600">
                    {formatIdr(data.totalIdr)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {data.notes && (
            <div className="mt-4 rounded-xl bg-cream-100 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-charcoal-soft">Catatan</p>
              <p className="text-sm text-charcoal">{data.notes}</p>
            </div>
          )}
          {data.cancelReason && (
            <div className="mt-4 rounded-xl bg-red-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-700">Alasan Batal</p>
              <p className="text-sm text-charcoal">{data.cancelReason}</p>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pelanggan</CardTitle>
            </CardHeader>
            <Field label="Nama" value={data.customer.name} />
            <Field label="Telepon" value={data.customer.phone} />
            {data.customer.email && <Field label="Email" value={data.customer.email} />}
            {data.customer.address && <Field label="Alamat" value={data.customer.address} />}
          </Card>

          {data.child && (
            <Card>
              <CardHeader>
                <CardTitle>Bayi</CardTitle>
              </CardHeader>
              <Field label="Nama" value={data.child.name} />
              {data.child.ageMonth != null && <Field label="Usia" value={`${data.child.ageMonth} bulan`} />}
              {data.child.gender && <Field label="Jenis Kelamin" value={data.child.gender === 'L' ? 'Laki-laki' : 'Perempuan'} />}
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Jadwal</CardTitle>
            </CardHeader>
            <Field
              label="Tanggal Preferensi"
              value={data.preferredDate ? formatDate(data.preferredDate) : '—'}
            />
            <Field
              label="Jadwal Dikonfirmasi"
              value={data.scheduledAt ? formatDate(data.scheduledAt) : 'Belum dijadwalkan'}
            />
            <Field label="Cabang" value={data.branch?.name ?? '—'} />
            <Field label="Terapis" value={data.therapist?.name ?? '—'} />
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log WhatsApp</CardTitle>
          <CardDescription>Riwayat pengiriman notifikasi WA terkait pesanan ini.</CardDescription>
        </CardHeader>
        {data.waLogs.length === 0 ? (
          <p className="text-sm text-charcoal-soft">Belum ada log WA.</p>
        ) : (
          <ul className="divide-y divide-outline-soft/20">
            {data.waLogs.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold text-charcoal">{l.templateCode}</p>
                  <p className="text-xs text-charcoal-soft">{formatDate(l.createdAt)}</p>
                  {l.error && <p className="mt-1 text-xs text-red-600">{l.error}</p>}
                </div>
                <StatusBadge status={l.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-soft">{label}</p>
      <p className="text-sm text-charcoal">{value}</p>
    </div>
  )
}

function ActionBar({ status, id, onChanged }: { status: string; id: string; onChanged: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === 'NEW' && (
        <>
          <ConfirmDialog id={id} onDone={onChanged} />
          <CancelDialog id={id} onDone={onChanged} />
        </>
      )}
      {(status === 'CONFIRMED' || status === 'RESCHEDULED') && (
        <>
          <SimpleActionButton id={id} action="ongoing" label="Mulai" icon="play_circle" onDone={onChanged} />
          <RescheduleDialog id={id} onDone={onChanged} />
          <CancelDialog id={id} onDone={onChanged} />
        </>
      )}
      {status === 'ONGOING' && <SimpleActionButton id={id} action="done" label="Selesaikan" icon="check_circle" onDone={onChanged} />}
    </div>
  )
}
