import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdAdd, MdAccountBalance, MdSync, MdCheck, MdLink, MdLinkOff } from 'react-icons/md'
import { useApi } from '../../hooks/useApi'
import { brokersService } from '../../services/apiServices'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

// Backend: GET /brokers/ → [{id, broker_name, broker_user_id, status}]
// POST /brokers/connect → {broker_name, api_key, api_secret}

const BROKER_META = {
  zerodha: { logo: '🟦', desc: "India's largest discount broker" },
  groww:   { logo: '🟩', desc: 'Commission-free investing platform' },
  upstox:  { logo: '🟨', desc: 'Next-gen trading platform' },
  angel:   { logo: '🟧', desc: 'Full-service broker with AI tools' },
  icici:   { logo: '🔴', desc: 'Integrated banking & trading' },
  hdfc:    { logo: '🔵', desc: "HDFC Bank's trading platform" },
}
const ALL_BROKERS = ['zerodha','groww','upstox','angel','icici','hdfc']

const Brokers = () => {
  const { data: connected, loading, execute: refetch, setData: setConnected } = useApi(brokersService.getBrokers, [], { defaultData: [] })
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState('zerodha')
  const [apiKey, setApiKey] = useState('')
  const [secret, setSecret] = useState('')
  const [connecting, setConnecting] = useState(false)

  const list = connected || []
  const connectedNames = list.map(c => c.broker_name)
  const available = ALL_BROKERS.filter(b => !connectedNames.includes(b))

  const handleConnect = async () => {
    if (!apiKey) return toast.error('Enter API key')
    setConnecting(true)
    try {
      await brokersService.connectBroker({ broker_name: selected, api_key: apiKey, api_secret: secret })
      await refetch()
      setModal(false)
      setApiKey('')
      setSecret('')
      toast.success(`${selected} connected successfully`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Connection failed')
    } finally { setConnecting(false) }
  }

  const handleDisconnect = async (id, name) => {
    try {
      await brokersService.disconnectBroker(id)
      setConnected(p => (p||[]).filter(c => c.id !== id))
      toast.success(`${name} disconnected`)
    } catch { toast.error('Failed to disconnect') }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Connected', value: list.length },
          { label: 'Available', value: ALL_BROKERS.length },
          { label: 'Auto-Sync', value: list.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border-subtle rounded-2xl p-5 text-center">
            <div className="font-display font-bold text-3xl text-white">{value}</div>
            <div className="text-text-secondary text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Connected */}
      {list.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-white text-base mb-4 flex items-center gap-2">
            <MdLink className="text-success"/> Connected Brokers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.map(broker => {
              const meta = BROKER_META[broker.broker_name] || { logo: '🏦', desc: 'Broker' }
              return (
                <motion.div key={broker.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
                  className="bg-card border border-success/20 rounded-2xl p-5 hover:border-success/40 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{meta.logo}</div>
                      <div>
                        <div className="font-semibold text-white capitalize">{broker.broker_name}</div>
                        <div className="flex items-center gap-1 text-success text-xs"><MdCheck className="text-sm"/> Connected</div>
                      </div>
                    </div>
                    <button onClick={() => handleDisconnect(broker.id, broker.broker_name)}
                      className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-all">
                      <MdLinkOff className="text-lg"/>
                    </button>
                  </div>
                  <div className="text-text-secondary text-xs font-mono">ID: {broker.broker_user_id}</div>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}

      {/* Available */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-white text-base flex items-center gap-2">
            <MdAccountBalance className="text-accent"/> Available Brokers
          </h2>
          <Button onClick={() => { setSelected(available[0] || 'zerodha'); setModal(true) }} icon={<MdAdd/>} size="sm">
            Connect Broker
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {available.map((brokerKey, i) => {
            const meta = BROKER_META[brokerKey] || { logo: '🏦', desc: 'Broker' }
            return (
              <motion.div key={brokerKey} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                className="bg-card border border-border-subtle rounded-2xl p-5 hover:border-accent/30 transition-all group cursor-pointer"
                onClick={() => { setSelected(brokerKey); setModal(true) }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{meta.logo}</div>
                  <div>
                    <div className="font-semibold text-white capitalize">{brokerKey}</div>
                    <div className="text-text-secondary text-xs">{meta.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <MdLink/> Connect
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Zerodha OAuth shortcut */}
      <div className="bg-card border border-accent/20 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🟦</div>
          <div className="flex-1">
            <div className="text-white font-semibold text-sm">Zerodha OAuth Login</div>
            <div className="text-text-secondary text-xs">Connect via official Zerodha Kite API OAuth flow</div>
          </div>
          <a href="http://localhost:8000/broker/zerodha/login" target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost">Open OAuth</Button>
          </a>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={`Connect ${selected}`}>
        <div className="space-y-4">
          <div className="bg-card-dark border border-border-subtle rounded-xl p-4 text-sm text-text-secondary">
            Enter your broker API credentials from the developer portal.
          </div>
          <div className="grid grid-cols-3 gap-2">
            {available.map(b => {
              const meta = BROKER_META[b] || { logo: '🏦' }
              return (
                <button key={b} onClick={() => setSelected(b)}
                  className={`p-3 rounded-xl border text-center transition-all ${selected===b?'border-accent bg-accent/10':'border-border-subtle hover:border-accent/50'}`}>
                  <div className="text-2xl mb-1">{meta.logo}</div>
                  <div className="text-white text-xs font-medium capitalize">{b}</div>
                </button>
              )
            })}
          </div>
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">API Key</label>
            <input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Enter API key" className="input-field"/>
          </div>
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">API Secret (optional)</label>
            <input type="password" value={secret} onChange={e => setSecret(e.target.value)} placeholder="Enter API secret" className="input-field"/>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModal(false)} className="flex-1 justify-center">Cancel</Button>
            <Button onClick={handleConnect} loading={connecting} className="flex-1 justify-center">Connect</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Brokers
