import { EditProductClient } from './edit-product'

export default function EditProductPage({ params }: { params: { id: string } }) {
  return <EditProductClient id={params.id} />
}
