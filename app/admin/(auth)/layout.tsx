export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth pages (login) don't need the admin sidebar/header
  return <>{children}</>
}
