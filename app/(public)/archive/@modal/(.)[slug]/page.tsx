import { getArchiveBySlug } from '@/lib/data/archive'
import { notFound } from 'next/navigation'
import ModalRouteClient from './ModalRouteClient'

export default async function ArchiveModalPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = await getArchiveBySlug(slug)
  if (!entry) notFound()
  return <ModalRouteClient entry={entry} />
}
