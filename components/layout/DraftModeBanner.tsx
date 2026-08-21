/** Floating banner shown when Next.js Draft Mode is active (template preview). */
export default function DraftModeBanner({
  templateName,
  exitUrl,
}: {
  templateName: string
  exitUrl: string
}) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: '#c9a96e',
      color: '#0f0f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      padding: '0.5rem 1.5rem',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '12px',
      fontWeight: 600,
      letterSpacing: '0.08em',
    }}>
      <span>⚠ PREVIEW MODE — Template: <strong>{templateName}</strong></span>
      <a
        href={exitUrl}
        style={{
          color: '#0f0f0f',
          textDecoration: 'none',
          border: '1px solid rgba(0,0,0,0.25)',
          borderRadius: '4px',
          padding: '2px 10px',
          fontSize: '11px',
          fontWeight: 700,
        }}
      >
        Exit Preview ×
      </a>
    </div>
  )
}
