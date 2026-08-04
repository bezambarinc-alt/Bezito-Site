import styles from './PageHeader.module.css'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  intro?: string
  variant?: 'dark' | 'light'
}

/** Editorial page header used across the simpler public routes. */
export default function PageHeader({ eyebrow, title, intro, variant = 'dark' }: PageHeaderProps) {
  return (
    <header className={`${styles.header} ${variant === 'light' ? styles.light : ''}`}>
      <div className={styles.inner}>
        {eyebrow && <p className="ba-eyebrow">{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {intro && <p className={styles.intro}>{intro}</p>}
      </div>
    </header>
  )
}
