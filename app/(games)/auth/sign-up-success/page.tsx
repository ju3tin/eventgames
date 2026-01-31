import Link from 'next/link'
import { Activity, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
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

        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="w-10 h-10 text-primary" />
        </div>

        {/* Message */}
        <h1 className="font-serif text-3xl font-bold mb-3">Check your email</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {"We've sent you a confirmation link. Please check your email and click the link to activate your account."}
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <Button asChild className="w-full h-12">
            <Link href="/auth/login">
              Continue to login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-12 bg-transparent">
            <Link href="/">Back to home</Link>
          </Button>
        </div>

        {/* Help text */}
        <p className="text-xs text-muted-foreground mt-8">
          {"Didn't receive an email? Check your spam folder or try signing up again."}
        </p>
      </div>
    </div>
  )
}