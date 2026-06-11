import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdTrendingUp, MdLock } from 'react-icons/md'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return toast.error('Passwords do not match')
    if (!token) return toast.error('Invalid reset link')
    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch {
      toast.error('Failed to reset password')
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
          <h1 className="font-display font-bold text-white text-2xl mb-1">New password</h1>
          <p className="text-text-secondary text-sm mb-7">Enter your new password below</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[['password', 'New Password', password, setPassword], ['confirm', 'Confirm Password', confirm, setConfirm]].map(([key, label, val, setter]) => (
              <div key={key}>
                <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">{label}</label>
                <div className="relative">
                  <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-lg" />
                  <input type="password" value={val} onChange={e => setter(e.target.value)}
                    placeholder="••••••••" className="input-field pl-11" />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Resetting...</> : 'Reset Password'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-accent text-sm hover:underline">Back to login</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPassword
