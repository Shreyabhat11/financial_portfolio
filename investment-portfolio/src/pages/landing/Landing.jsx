import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MdTrendingUp, MdPsychology, MdShield, MdBarChart,
  MdNotifications, MdAccountBalance, MdArrowForward,
  MdCheck, MdStar, MdAutoAwesome
} from 'react-icons/md'
import TickerBar from '../../components/layout/TickerBar'

// ─── Animated Brain SVG ───────────────────────────────────────────────────────
const BrainNetwork = () => {
  const nodes = [
    { x: 320, y: 80 },  { x: 420, y: 60 },  { x: 500, y: 100 }, { x: 550, y: 180 },
    { x: 480, y: 260 }, { x: 380, y: 290 }, { x: 300, y: 240 }, { x: 260, y: 150 },
    { x: 370, y: 170 }, { x: 450, y: 140 }, { x: 430, y: 210 }, { x: 340, y: 120 },
  ]
  const edges = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],
    [8,9],[9,10],[10,8],[0,8],[2,9],[4,10],[6,8],[3,9],[5,10],[1,9],[7,8],[0,11],[11,1],[11,8],
  ]
  return (
    <svg viewBox="200 40 400 300" className="w-full h-full"
      style={{ filter: 'drop-shadow(0 0 20px rgba(0,210,211,0.3))' }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {edges.map(([a, b], i) => (
        <motion.line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="#00d2d3" strokeWidth="0.8" strokeOpacity="0.4"
          initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0.3] }}
          transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatType: 'mirror', repeatDelay: 1 }} />
      ))}
      {nodes.map((n, i) => (
        <motion.circle key={i} cx={n.x} cy={n.y} r="5" fill="#00d2d3" filter="url(#glow)"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, delay: i * 0.15, repeat: Infinity }} />
      ))}
      <motion.path
        d="M340,80 Q360,50 400,60 Q450,50 480,80 Q520,90 540,130 Q560,170 550,210 Q540,250 510,270 Q480,290 450,280 Q420,300 390,290 Q360,300 330,280 Q300,260 280,230 Q260,200 265,165 Q260,130 290,105 Q310,85 340,80 Z"
        fill="none" stroke="#00d2d3" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="8 4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} />
      {[0,1,2,3,4,5].map((i) => {
        const h = [40,60,35,75,50,85][i]
        const x = 430 + i * 22
        return (
          <motion.rect key={i} x={x} y={300 - h} width="16" height={h}
            fill="#00d2d3" fillOpacity="0.7" rx="3"
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
            style={{ transformOrigin: x + 'px 300px' }} />
        )
      })}
      <motion.path d="M420,310 L560,200 L565,215 M560,200 L550,212"
        stroke="#00d2d3" strokeWidth="2.5" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 1.2 }} />
      {[{x:250,y:250},{x:580,y:110},{x:230,y:100}].map((p,i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r="3" fill="#00d2d3" fillOpacity="0.5"
          animate={{ y: [0,-8,0], opacity: [0.3,0.8,0.3] }}
          transition={{ duration: 3, delay: i*0.8, repeat: Infinity }} />
      ))}
    </svg>
  )
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, desc, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }}
    whileHover={{ y: -6, transition: { duration: 0.2 } }}
    className="bg-card border border-border-subtle rounded-2xl p-6 hover:border-accent/30 transition-colors"
  >
    <div className={'w-12 h-12 rounded-xl flex items-center justify-center mb-4 ' + color}>
      <Icon className="text-2xl text-white" />
    </div>
    <h3 className="font-display font-bold text-white text-base mb-2">{title}</h3>
    <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
  </motion.div>
)

// ─── Stat ─────────────────────────────────────────────────────────────────────
const Stat = ({ value, label, index }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center">
    <div className="font-display font-bold text-4xl text-accent mb-1">{value}</div>
    <div className="text-text-secondary text-sm">{label}</div>
  </motion.div>
)

// ─── Landing Page ─────────────────────────────────────────────────────────────
const Landing = () => (
  <div className="min-h-screen bg-bg text-white overflow-x-hidden">

    {/* Navbar */}
    <nav className="border-b border-border-subtle bg-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center">
            <MdTrendingUp className="text-accent text-xl" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-sm leading-none block">INVESTMENT</span>
            <span className="font-display font-bold text-accent text-sm leading-none block">PORTFOLIO</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How it Works', 'Pricing'].map(item => (
            <a key={item} href={'#' + item.toLowerCase().replace(/ /g,'-')}
              className="text-text-secondary text-sm hover:text-white transition-colors">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-text-secondary text-sm hover:text-white transition-colors px-4 py-2">Sign In</Link>
          <Link to="/register" className="bg-accent text-black font-semibold text-sm px-5 py-2 rounded-xl hover:bg-accent-dark transition-all active:scale-95">
            Get Started
          </Link>
        </div>
      </div>
    </nav>

    {/* Live Ticker */}
    <TickerBar />

    {/* Hero */}
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 via-transparent to-success/3" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/8 rounded-full blur-3xl" />
        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-transparent via-accent to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-40" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5 text-accent text-xs font-semibold mb-6">
              <MdAutoAwesome className="text-sm" /> AI-Powered Investment Platform
            </motion.div>
            <h1 className="font-display font-bold text-5xl lg:text-6xl leading-tight mb-6">
              <span className="text-accent">UNLOCK SMARTER</span><br />
              <span className="text-white">INVESTMENT WITH</span><br />
              <span className="text-accent">AI INSIGHTS</span>
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed mb-8 max-w-xl">
              Track your Indian stock portfolio, get real-time NSE/BSE market data,
              and receive AI-powered buy/sell signals — all in one premium dashboard.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/register">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 bg-transparent border-2 border-accent text-accent font-bold px-7 py-3 rounded-xl hover:bg-accent hover:text-black transition-all duration-200 text-sm">
                  GET STARTED <MdArrowForward className="text-lg" />
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 border border-border-subtle text-white font-semibold px-7 py-3 rounded-xl hover:border-accent/50 transition-all duration-200 text-sm">
                  SIGN IN
                </motion.button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary">
              {['No credit card required', 'Free to start', 'Real NSE/BSE data'].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <MdCheck className="text-success text-base" /><span>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }} className="relative h-80 lg:h-[420px]">
            <BrainNetwork />
          </motion.div>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="border-y border-border-subtle bg-card/40 py-12">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { value: '50K+', label: 'Active Investors' },
          { value: '₹500Cr+', label: 'Portfolio Value Tracked' },
          { value: '99.9%', label: 'Uptime SLA' },
          { value: '4.9★', label: 'Average Rating' },
        ].map((s, i) => <Stat key={i} {...s} index={i} />)}
      </div>
    </section>

    {/* Features */}
    <section id="features" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5 text-accent text-xs font-semibold mb-4">
            Everything You Need
          </div>
          <h2 className="font-display font-bold text-4xl text-white mb-3">AI-Powered Portfolio Management</h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            From real-time market data to intelligent analysis — manage your entire investment journey in one place.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: MdBarChart,       title: 'Live Portfolio Tracking', color: 'bg-accent/20',
              desc: 'Track NSE/BSE holdings with real-time P&L, day change, and performance metrics.' },
            { icon: MdPsychology,     title: 'AI Insights Engine',      color: 'bg-purple-500/20',
              desc: 'Get intelligent buy/sell/hold signals. Understand risk, sentiment, and actionable market outlook.' },
            { icon: MdTrendingUp,     title: 'Market Overview',         color: 'bg-success/20',
              desc: 'Monitor NIFTY 50, BANKNIFTY, SENSEX, and stocks with live prices via real-time data.' },
            { icon: MdNotifications,  title: 'Smart Price Alerts',      color: 'bg-warning/20',
              desc: 'Set custom price thresholds. Get notified the moment your target is hit.' },
            { icon: MdAccountBalance, title: 'Broker Integration',      color: 'bg-blue-500/20',
              desc: 'Connect your Zerodha account via official API. Auto-sync holdings and transactions.' },
            { icon: MdShield,         title: 'Portfolio Health Score',  color: 'bg-danger/20',
              desc: 'Health score analysing diversification, risk exposure, and sector concentration.' },
          ].map((f, i) => <FeatureCard key={i} {...f} index={i} />)}
        </div>
      </div>
    </section>

    {/* How it Works */}
    <section id="how-it-works" className="py-20 bg-card/30 border-y border-border-subtle">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14">
          <h2 className="font-display font-bold text-4xl text-white mb-3">How It Works</h2>
          <p className="text-text-secondary">Up and running in three simple steps</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Create Account', desc: 'Register for free. Set up your profile in under 2 minutes.' },
            { step: '02', title: 'Add Holdings',   desc: 'Enter stock holdings manually or connect Zerodha for auto-sync.' },
            { step: '03', title: 'Get AI Insights', desc: 'Receive AI analysis, health scores, and buy/sell recommendations.' },
          ].map(({ step, title, desc }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-accent/10 border-2 border-accent/30 flex items-center justify-center mx-auto mb-5">
                <span className="font-display font-bold text-accent text-2xl">{step}</span>
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing */}
    <section id="pricing" className="py-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14">
          <h2 className="font-display font-bold text-4xl text-white mb-3">Simple Pricing</h2>
          <p className="text-text-secondary">Start free, upgrade when you are ready</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Free',       price: '₹0',     period: '/month', desc: 'Perfect to get started', accent: false, cta: 'Get Started Free',
              features: ['Up to 10 holdings', 'Market overview', 'Basic portfolio tracking', '5 watchlist stocks'] },
            { name: 'Pro',        price: '₹499',   period: '/month', desc: 'For serious investors',   accent: true,  cta: 'Start Pro Trial', badge: 'Most Popular',
              features: ['Unlimited holdings', 'AI recommendations', 'Price alerts', 'Broker sync', 'Portfolio health score', 'Priority support'] },
            { name: 'Enterprise', price: '₹1,999', period: '/month', desc: 'For teams and advisors',  accent: false, cta: 'Contact Sales',
              features: ['Everything in Pro', 'Multi-portfolio', 'API access', 'Custom reports', 'Dedicated support', 'White-label option'] },
          ].map(({ name, price, period, desc, features, cta, accent, badge }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={'relative rounded-2xl p-7 border ' + (accent ? 'bg-accent/5 border-accent/40 shadow-accent-glow' : 'bg-card border-border-subtle')}>
              {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black text-xs font-bold px-3 py-1 rounded-full">{badge}</div>
              )}
              <div className="mb-5">
                <div className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1">{name}</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className={'font-display font-bold text-4xl ' + (accent ? 'text-accent' : 'text-white')}>{price}</span>
                  <span className="text-text-secondary text-sm pb-1">{period}</span>
                </div>
                <div className="text-text-secondary text-sm">{desc}</div>
              </div>
              <ul className="space-y-2.5 mb-7">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <MdCheck className={'text-base flex-shrink-0 ' + (accent ? 'text-accent' : 'text-success')} />
                    <span className="text-text-secondary">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <button className={'w-full py-3 rounded-xl font-semibold text-sm transition-all ' +
                  (accent ? 'bg-accent text-black hover:bg-accent-dark' : 'border border-border-subtle text-white hover:border-accent/50 hover:text-accent')}>
                  {cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="py-20 bg-card/30 border-y border-border-subtle">
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="font-display font-bold text-3xl text-white text-center mb-12">Trusted by Investors</motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Arjun Sharma', role: 'Retail Investor', stars: 5,
              text: 'The AI signals are remarkably accurate. Got a BUY signal on BAJFINANCE before a 12% run. Love this platform.' },
            { name: 'Priya Nair', role: 'Swing Trader', stars: 5,
              text: 'Clean, fast, and the portfolio health score keeps me disciplined. Finally a tool built for Indian markets!' },
            { name: 'Vikram Mehta', role: 'Long-term Investor', stars: 5,
              text: 'The Zerodha integration saved me hours of manual data entry. Everything auto-syncs perfectly.' },
          ].map(({ name, role, text, stars }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border-subtle rounded-2xl p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: stars }).map((_, j) => (
                  <MdStar key={j} className="text-warning text-base" />
                ))}
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-5">"{text}"</p>
              <div className="text-white font-semibold text-sm">{name}</div>
              <div className="text-text-secondary text-xs">{role}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-full bg-accent/5 blur-3xl rounded-full" />
      </div>
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} className="relative max-w-2xl mx-auto px-6 text-center">
        <h2 className="font-display font-bold text-5xl text-white mb-4">
          Start Investing<br /><span className="text-accent">Smarter Today</span>
        </h2>
        <p className="text-text-secondary text-lg mb-8">Join thousands of investors using AI to make better portfolio decisions.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-accent text-black font-bold px-8 py-3.5 rounded-xl hover:bg-accent-dark transition-all text-sm shadow-accent-glow">
              Create Free Account <MdArrowForward className="text-lg" />
            </motion.button>
          </Link>
          <Link to="/login">
            <button className="border border-border-subtle text-white font-semibold px-8 py-3.5 rounded-xl hover:border-accent/50 transition-all text-sm">
              Sign In
            </button>
          </Link>
        </div>
      </motion.div>
    </section>

    {/* Footer */}
    <footer className="border-t border-border-subtle py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center">
            <MdTrendingUp className="text-accent text-lg" />
          </div>
          <span className="font-display font-bold text-white text-sm">InvestAI Portfolio</span>
        </div>
        <div className="flex gap-6 text-text-secondary text-xs">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div className="text-text-secondary text-xs">2026 InvestAI. All rights reserved.</div>
      </div>
    </footer>

  </div>
)

export default Landing
