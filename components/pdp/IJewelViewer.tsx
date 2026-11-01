import styles from './IJewelViewer.module.css'

interface IJewelViewerProps {
  src: string
  title: string
}

export default function IJewelViewer({ src, title }: IJewelViewerProps) {
  return (
    <div className={styles.wrapper}>
      <iframe
        src={src}
        title={title}
        frameBorder={0}
        allowFullScreen
        allow="camera; autoplay; clipboard-write; fullscreen; xr-spatial-tracking; web-share"
        className={styles.viewer}
      />
      {/* Covers the iJewel watermark logo until whitelabel domain is activated in iJewel account */}
      <div className={styles.logoCover} aria-hidden="true" />
    </div>
  )
}
