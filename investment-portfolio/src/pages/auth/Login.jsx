import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdTrendingUp, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-success/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center">
            <MdTrendingUp className="text-accent text-2xl" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-xl leading-tight">InvestAI</div>
            <div className="text-text-secondary text-xs">Portfolio Management</div>
          </div>
        </div>

        <div className="bg-card border border-border-subtle rounded-2xl p-8">
          <h1 className="font-display font-bold text-white text-2xl mb-1">Welcome back</h1>
          <p className="text-text-secondary text-sm mb-7">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Email</label>
              <div className="relative">
                <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-lg" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-lg" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                >
                  {showPw ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-accent text-sm hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center flex items-center gap-2 py-3"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:underline font-medium">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
