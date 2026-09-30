'use client'

import { useRouter } from 'next/navigation'
import ArchiveModal from '@/components/archive/ArchiveModal'
import type { ArchiveEntry } from '@/lib/data/archive-constants'

export default function ModalRouteClient({ entry }: { entry: ArchiveEntry }) {
  const router = useRouter()
  return <ArchiveModal entry={entry} onClose={() => router.back()} />
}
