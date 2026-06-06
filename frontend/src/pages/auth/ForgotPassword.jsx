import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdTrendingUp, MdEmail, MdArrowBack } from 'react-icons/md'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

export const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent!')
    } catch {
      toast.error('Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center">
            <MdTrendingUp className="text-accent text-2xl" />
          </div>
        </div>
        <div className="bg-card border border-border-subtle rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-4">
                <MdEmail className="text-success text-3xl" />
              </div>
              <h2 className="font-display font-bold text-white text-xl mb-2">Check your email</h2>
              <p className="text-text-secondary text-sm mb-6">We sent a password reset link to <span className="text-white">{email}</span></p>
              <Link to="/login" className="text-accent text-sm hover:underline flex items-center justify-center gap-1">
                <MdArrowBack /> Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display font-bold text-white text-2xl mb-1">Reset password</h1>
              <p className="text-text-secondary text-sm mb-7">Enter your email to receive a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-lg" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" className="input-field pl-11" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                  {loading ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Sending...</> : 'Send Reset Link'}
                </button>
              </form>
              <div className="mt-4 text-center">
                <Link to="/login" className="text-accent text-sm hover:underline flex items-center justify-center gap-1">
                  <MdArrowBack /> Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
