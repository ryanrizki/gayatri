import { CustomersList } from './customers-list'

export default function CustomersPage({ searchParams }: { searchParams: { q?: string } }) {
  return <CustomersList initialQ={searchParams.q ?? ''} />
}
