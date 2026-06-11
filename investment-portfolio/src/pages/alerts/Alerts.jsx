import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdDelete, MdNotifications, MdNotificationsActive, MdCheck, MdHistory } from 'react-icons/md'
import { useApi } from '../../hooks/useApi'
import { alertsService } from '../../services/apiServices'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import toast from 'react-hot-toast'

// Backend returns: { id, stock_symbol, condition_type, condition_value, is_active }
const Alerts = () => {
  const { data: alerts, loading, execute: refetch, setData: setAlerts } = useApi(alertsService.getAlerts, [], { defaultData: [] })
  const [modal, setModal] = useState(false)
  const [tab, setTab] = useState('active')
  const [form, setForm] = useState({ symbol: '', type: 'ABOVE', price: '' })
  const [saving, setSaving] = useState(false)

  const list = alerts || []

  const handleCreate = async () => {
    if (!form.symbol || !form.price) return toast.error('Fill all fields')
    setSaving(true)
    try {
      await alertsService.createAlert({ symbol: form.symbol, type: form.type, price: form.price })
      await refetch()
      setModal(false)
      setForm({ symbol: '', type: 'ABOVE', price: '' })
      toast.success('Alert created')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create alert')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try {
      await alertsService.deleteAlert(id)
      setAlerts(p => (p || []).filter(a => a.id !== id))
      toast.success('Alert deleted')
    } catch { toast.error('Failed to delete alert') }
  }

  const activeAlerts = list.filter(a => a.is_active)
  const inactiveAlerts = list.filter(a => !a.is_active)
  const filtered = tab === 'active' ? activeAlerts : inactiveAlerts

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Alerts', value: activeAlerts.length, color: 'text-accent' },
          { label: 'Triggered', value: inactiveAlerts.length, color: 'text-success' },
          { label: 'Total Alerts', value: list.length, color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border-subtle rounded-2xl p-5 text-center">
            <div className={`font-display font-bold text-3xl ${color}`}>{value}</div>
            <div className="text-text-secondary text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border-subtle rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-border-subtle">
          <div className="flex gap-1">
            {[['active','Active'],['triggered','Triggered']].map(([key,label])=>(
              <button key={key} onClick={()=>setTab(key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab===key?'bg-accent text-black':'text-text-secondary hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
          <Button onClick={() => setModal(true)} icon={<MdAdd />} className="ml-auto" size="sm">New Alert</Button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="skeleton h-14 w-full rounded-xl"/>)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={MdNotifications} title={tab==='active'?'No active alerts':'No triggered alerts'}
            description="Create price alerts to get notified when stocks hit your targets."
            action={<Button onClick={() => setModal(true)} icon={<MdAdd />} size="sm">Create Alert</Button>} />
        ) : (
          <div className="divide-y divide-border-subtle/50">
            <AnimatePresence>
              {filtered.map((alert, i) => (
                <motion.div key={alert.id} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{delay:i*0.04}}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-card-dark transition-colors group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.is_active?'bg-accent/10':'bg-success/10'}`}>
                    {alert.is_active
                      ? <MdNotificationsActive className="text-accent text-lg"/>
                      : <MdCheck className="text-success text-lg"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{alert.stock_symbol}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                        alert.condition_type==='ABOVE'?'bg-success/10 text-success':'bg-danger/10 text-danger'}`}>
                        {alert.condition_type} ₹{alert.condition_value?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-text-secondary text-xs">
                      Status: <span className={alert.is_active?'text-accent':'text-success'}>{alert.is_active?'Active':'Triggered'}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(alert.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-all">
                    <MdDelete className="text-lg"/>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Price Alert">
        <div className="space-y-4">
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Stock Symbol (NSE)</label>
            <input value={form.symbol} onChange={e => setForm(p=>({...p, symbol:e.target.value.toUpperCase()}))}
              placeholder="e.g. RELIANCE" className="input-field"/>
          </div>
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Condition</label>
            <div className="flex gap-2">
              {['ABOVE','BELOW'].map(t=>(
                <button key={t} onClick={()=>setForm(p=>({...p,type:t}))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    form.type===t?'bg-accent text-black border-accent':'border-border-subtle text-text-secondary hover:border-accent/50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Target Price (₹)</label>
            <input type="number" value={form.price} onChange={e => setForm(p=>({...p,price:e.target.value}))}
              placeholder="Enter price" className="input-field"/>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={()=>setModal(false)} className="flex-1 justify-center">Cancel</Button>
            <Button onClick={handleCreate} loading={saving} className="flex-1 justify-center">Create Alert</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Alerts
