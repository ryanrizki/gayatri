import { EditServiceClient } from './edit-service'

export default function EditServicePage({ params }: { params: { id: string } }) {
  return <EditServiceClient id={params.id} />
}
