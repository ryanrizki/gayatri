import { CheckoutDetail } from './checkout-detail'

export default function CheckoutDetailPage({ params }: { params: { id: string } }) {
  return <CheckoutDetail id={params.id} />
}
