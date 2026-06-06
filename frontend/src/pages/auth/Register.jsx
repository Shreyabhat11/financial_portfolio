import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdTrendingUp, MdEmail, MdLock, MdPerson, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields')
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) })

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
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
          <h1 className="font-display font-bold text-white text-2xl mb-1">Create account</h1>
          <p className="text-text-secondary text-sm mb-7">Start managing your portfolio with AI</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', icon: MdPerson, type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email', icon: MdEmail, type: 'email', placeholder: 'you@example.com' },
            ].map(({ key, label, icon: Icon, type, placeholder }) => (
              <div key={key}>
                <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-lg" />
                  <input type={type} {...field(key)} placeholder={placeholder} className="input-field pl-11" />
                </div>
              </div>
            ))}

            {['password', 'confirm'].map((key, i) => (
              <div key={key}>
                <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">
                  {key === 'password' ? 'Password' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-lg" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    {...field(key)}
                    placeholder="••••••••"
                    className="input-field pl-11 pr-11"
                  />
                  {i === 0 && (
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors">
                      {showPw ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center flex items-center gap-2 py-3 mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Creating account...</>
                : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Register
