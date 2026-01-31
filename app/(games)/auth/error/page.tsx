import Link from 'next/link'
import { Activity, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-2xl font-bold">MotionPlay</span>
        </div>

        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>

        {/* Message */}
        <h1 className="font-serif text-3xl font-bold mb-3">Something went wrong</h1>
        <p className="text-muted-foreground mb-4">
          We encountered an error during authentication.
        </p>
        
        {params?.error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-8">
            Error: {params.error}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <Button asChild className="w-full h-12">
            <Link href="/auth/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try again
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-12 bg-transparent">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}