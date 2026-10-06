import styles from './IJewelViewer.module.css'

interface IJewelViewerProps {
  src: string
  title: string
}

export default function IJewelViewer({ src, title }: IJewelViewerProps) {
  return (
    <iframe
      src={src}
      title={title}
      frameBorder={0}
      allowFullScreen
      allow="camera; autoplay; clipboard-write; fullscreen; xr-spatial-tracking; web-share"
      className={styles.viewer}
    />
  )
}
