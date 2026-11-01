import styles from './IJewelViewer.module.css'

interface IJewelViewerProps {
  src: string
  title: string
}

export default function IJewelViewer({ src, title }: IJewelViewerProps) {
  const url = new URL(src)
  url.searchParams.set('isRemoveLogo', 'true')
  url.searchParams.set('isRemoveLogoLink', 'true')

  return (
    <iframe
      src={url.toString()}
      title={title}
      frameBorder={0}
      allowFullScreen
      allow="camera; autoplay; clipboard-write; fullscreen; xr-spatial-tracking; web-share"
      className={styles.viewer}
    />
  )
}
