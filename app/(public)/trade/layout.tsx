import PasswordGate from './flex/PasswordGate'

export default function TradeLayout({ children }: { children: React.ReactNode }) {
  return <PasswordGate>{children}</PasswordGate>
}
