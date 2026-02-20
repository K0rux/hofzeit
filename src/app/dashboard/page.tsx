import { AppLayout } from '@/components/app-layout'

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold">Willkommen bei Hofzeit</h2>
        <p className="mt-2 text-muted-foreground">
          Hier werden bald Ihre Zeiterfassungsdaten angezeigt.
        </p>
      </div>
    </AppLayout>
  )
}
