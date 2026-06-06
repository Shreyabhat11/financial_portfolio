import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdPerson, MdLock, MdNotifications, MdPalette, MdSave, MdEdit, MdCamera } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'profile', label: 'Profile', icon: MdPerson },
  { id: 'security', label: 'Security', icon: MdLock },
  { id: 'notifications', label: 'Notifications', icon: MdNotifications },
  { id: 'appearance', label: 'Appearance', icon: MdPalette },
]

const SectionCard = ({ title, children }) => (
  <div className="bg-card border border-border-subtle rounded-2xl p-6">
    <h3 className="font-display font-bold text-white text-base mb-5">{title}</h3>
    {children}
  </div>
)

const Field = ({ label, children }) => (
  <div>
    <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">{label}</label>
    {children}
  </div>
)

const Toggle = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-border-subtle/50 last:border-0">
    <div>
      <div className="text-white text-sm font-medium">{label}</div>
      {desc && <div className="text-text-secondary text-xs mt-0.5">{desc}</div>}
    </div>
    <button onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${checked ? 'bg-accent' : 'bg-border-subtle'}`}>
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${checked ? 'translate-x-5' : ''}`} />
    </button>
  </div>
)

const ProfileTab = ({ user }) => {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', bio: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    toast.success('Profile updated')
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Personal Information">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-accent/20 border-2 border-accent/40 flex items-center justify-center text-accent font-bold text-2xl">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent rounded-lg flex items-center justify-center shadow-lg">
              <MdCamera className="text-black text-sm" />
            </button>
          </div>
          <div>
            <div className="text-white font-semibold">{user?.name || 'User'}</div>
            <div className="text-text-secondary text-sm">{user?.email || ''}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="input-field" placeholder="John Doe" />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              type="email" className="input-field" placeholder="you@example.com" />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="input-field" placeholder="+91 98765 43210" />
          </Field>
          <Field label="Bio">
            <input value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              className="input-field" placeholder="Short bio..." />
          </Field>
        </div>

        <Button onClick={handleSave} loading={saving} icon={<MdSave />} className="mt-4">Save Changes</Button>
      </SectionCard>
    </div>
  )
}

const SecurityTab = () => {
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [twoFA, setTwoFA] = useState(false)

  const handleSave = async () => {
    if (!form.current || !form.newPw) return toast.error('Fill all fields')
    if (form.newPw !== form.confirm) return toast.error('Passwords do not match')
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    setForm({ current: '', newPw: '', confirm: '' })
    toast.success('Password updated')
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Change Password">
        <div className="space-y-4">
          {[['current', 'Current Password'], ['newPw', 'New Password'], ['confirm', 'Confirm New Password']].map(([key, label]) => (
            <Field key={key} label={label}>
              <input type="password" value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder="••••••••" className="input-field" />
            </Field>
          ))}
          <Button onClick={handleSave} loading={saving} icon={<MdSave />}>Update Password</Button>
        </div>
      </SectionCard>

      <SectionCard title="Two-Factor Authentication">
        <Toggle
          label="Enable 2FA"
          desc="Add an extra layer of security to your account"
          checked={twoFA}
          onChange={v => { setTwoFA(v); toast.success(v ? '2FA enabled' : '2FA disabled') }}
        />
      </SectionCard>

      <SectionCard title="Active Sessions">
        {[
          { device: 'Chrome on Windows', location: 'Mumbai, IN', time: 'Active now' },
          { device: 'Mobile App (Android)', location: 'Mumbai, IN', time: '2 hours ago' },
        ].map(({ device, location, time }) => (
          <div key={device} className="flex items-center justify-between py-3 border-b border-border-subtle/50 last:border-0">
            <div>
              <div className="text-white text-sm font-medium">{device}</div>
              <div className="text-text-secondary text-xs">{location} · {time}</div>
            </div>
            <button className="text-danger text-xs hover:underline">Revoke</button>
          </div>
        ))}
      </SectionCard>
    </div>
  )
}

const NotificationsTab = () => {
  const [prefs, setPrefs] = useState({
    priceAlerts: true, aiSignals: true, newsDigest: false,
    weeklyReport: true, emailAlerts: true, pushAlerts: false,
  })
  const toggle = (k) => setPrefs(p => ({ ...p, [k]: !p[k] }))

  return (
    <div className="space-y-6">
      <SectionCard title="Price & AI Alerts">
        <Toggle label="Price Alerts" desc="Get notified when your price targets are hit" checked={prefs.priceAlerts} onChange={() => toggle('priceAlerts')} />
        <Toggle label="AI Signals" desc="Receive AI-generated buy/sell recommendations" checked={prefs.aiSignals} onChange={() => toggle('aiSignals')} />
        <Toggle label="News Digest" desc="Daily market news summary" checked={prefs.newsDigest} onChange={() => toggle('newsDigest')} />
        <Toggle label="Weekly Report" desc="Weekly portfolio performance report" checked={prefs.weeklyReport} onChange={() => toggle('weeklyReport')} />
      </SectionCard>

      <SectionCard title="Delivery Channels">
        <Toggle label="Email Notifications" desc="Receive alerts via email" checked={prefs.emailAlerts} onChange={() => toggle('emailAlerts')} />
        <Toggle label="Push Notifications" desc="Browser push notifications" checked={prefs.pushAlerts} onChange={() => toggle('pushAlerts')} />
      </SectionCard>
    </div>
  )
}

const AppearanceTab = () => {
  const accents = ['#00d2d3', '#7c4dff', '#ff6d00', '#00c853', '#f50057']
  const [accent, setAccent] = useState('#00d2d3')

  return (
    <SectionCard title="Theme & Appearance">
      <div className="mb-6">
        <div className="text-text-secondary text-sm mb-3">Theme Mode</div>
        <div className="flex gap-2">
          {['Dark', 'Light', 'System'].map(t => (
            <button key={t} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${t === 'Dark' ? 'border-accent bg-accent/10 text-accent' : 'border-border-subtle text-text-secondary hover:border-accent/50'}`}>
              {t}
            </button>
          ))}
        </div>
        <p className="text-text-secondary text-xs mt-2">Currently locked to dark mode for optimal experience</p>
      </div>

      <div>
        <div className="text-text-secondary text-sm mb-3">Accent Color</div>
        <div className="flex gap-3">
          {accents.map(color => (
            <button key={color} onClick={() => setAccent(color)}
              style={{ background: color, boxShadow: accent === color ? `0 0 12px ${color}80` : 'none' }}
              className={`w-8 h-8 rounded-full transition-all ${accent === color ? 'ring-2 ring-white ring-offset-2 ring-offset-bg scale-110' : ''}`} />
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const { user } = useAuth()

  const tabContent = {
    profile: <ProfileTab user={user} />,
    security: <SecurityTab />,
    notifications: <NotificationsTab />,
    appearance: <AppearanceTab />,
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Tab nav */}
      <div className="flex gap-1 bg-card border border-border-subtle rounded-2xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === id ? 'bg-accent text-black' : 'text-text-secondary hover:text-white'
            }`}>
            <Icon className="text-base" />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {tabContent[activeTab]}
      </motion.div>
    </div>
  )
}

export default Settings
