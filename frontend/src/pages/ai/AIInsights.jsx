import { motion } from 'framer-motion'
import { MdPsychology, MdTrendingUp, MdTrendingDown, MdShield, MdAutoAwesome } from 'react-icons/md'
import { MdSentimentSatisfied, MdSentimentDissatisfied, MdSentimentNeutral } from 'react-icons/md'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { useApi } from '../../hooks/useApi'
import { aiService } from '../../services/apiServices'

const ConfidenceBar = ({ value }) => (
  <div className="w-full bg-border-subtle rounded-full h-1.5 mt-2">
    <motion.div initial={{width:0}} animate={{width:`${value}%`}} transition={{duration:0.8}}
      className={`h-full rounded-full ${value>=80?'bg-success':value>=60?'bg-warning':'bg-danger'}`}/>
  </div>
)

const SignalBadge = ({ signal, confidence }) => {
  const map = { BUY:'tag-buy', SELL:'tag-sell', HOLD:'tag-hold' }
  return (
    <div className="flex items-center gap-2">
      <span className={map[signal]||'tag-hold'}>{signal||'HOLD'}</span>
      {confidence && <span className="text-text-secondary text-xs">{confidence}% confidence</span>}
    </div>
  )
}

const SentimentIcon = ({ s }) => ({
  bullish: <MdSentimentSatisfied className="text-success text-xl"/>,
  bearish: <MdSentimentDissatisfied className="text-danger text-xl"/>,
  neutral: <MdSentimentNeutral className="text-warning text-xl"/>,
}[s] || <MdSentimentNeutral className="text-warning text-xl"/>)

const AIInsights = () => {
  const { data: recs, loading: recLoading } = useApi(aiService.getRecommendations, [], { defaultData: [] })
  const { data: riskData, loading: riskLoading } = useApi(aiService.getRiskAnalysis, [], { defaultData: {} })
  const { data: sentiment } = useApi(aiService.getSentiment, [], { defaultData: [] })

  const recList = recs || []
  const riskMetrics = riskData?.riskMetrics || []
  const sentimentList = sentiment || []

  return (
    <div className="space-y-6">
      {/* Signal counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label:'Buy Signals', value: recList.filter(r=>r.signal==='BUY').length, color:'text-success', bg:'bg-success/10 border-success/20', icon:MdTrendingUp },
          { label:'Sell Signals', value: recList.filter(r=>r.signal==='SELL').length, color:'text-danger', bg:'bg-danger/10 border-danger/20', icon:MdTrendingDown },
          { label:'Hold Signals', value: recList.filter(r=>r.signal==='HOLD').length, color:'text-warning', bg:'bg-warning/10 border-warning/20', icon:MdShield },
        ].map(({label,value,color,bg,icon:Icon},i)=>(
          <motion.div key={label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
            className={`rounded-2xl border p-5 ${bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-xs uppercase tracking-wider">{label}</span>
              <Icon className={`text-xl ${color}`}/>
            </div>
            <div className={`font-display font-bold text-3xl ${color}`}>
              {recLoading ? <div className="skeleton h-8 w-12"/> : value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendations */}
        <div className="lg:col-span-2 bg-card border border-border-subtle rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 p-5 border-b border-border-subtle">
            <MdAutoAwesome className="text-accent text-lg"/>
            <h3 className="font-display font-bold text-white text-base">AI Recommendations</h3>
            <span className="ml-auto text-text-secondary text-xs">Powered by Gemini</span>
          </div>
          {recLoading ? (
            <div className="p-5 space-y-4">
              {Array.from({length:3}).map((_,i)=>(
                <div key={i} className="space-y-2">
                  <div className="skeleton h-5 w-32"/>
                  <div className="skeleton h-4 w-full"/>
                  <div className="skeleton h-4 w-3/4"/>
                </div>
              ))}
            </div>
          ) : recList.length === 0 ? (
            <div className="p-8 text-center">
              <MdAutoAwesome className="text-text-secondary text-4xl mx-auto mb-3"/>
              <p className="text-text-secondary text-sm">Add holdings to your portfolio to get AI recommendations</p>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle/50">
              {recList.map((rec,i)=>(
                <motion.div key={rec.symbol} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                  className="p-5 hover:bg-card-dark transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="font-semibold text-white">{rec.symbol}</div>
                      <div className="text-text-secondary text-xs">{rec.name}</div>
                    </div>
                    <SignalBadge signal={rec.signal} confidence={rec.confidence}/>
                  </div>
                  <p className="text-text-secondary text-sm mb-3 leading-relaxed">{rec.reason}</p>
                  <div className="flex items-center gap-6 text-xs">
                    <div><span className="text-text-secondary">Current: </span><span className="text-white font-mono">₹{rec.current?.toLocaleString('en-IN')}</span></div>
                    <div><span className="text-text-secondary">Target: </span><span className="text-white font-mono">₹{rec.target?.toLocaleString('en-IN')}</span></div>
                    <div><span className="text-text-secondary">Upside: </span><span className={`font-mono font-semibold ${(rec.upside||0)>=0?'text-success':'text-danger'}`}>{(rec.upside||0)>=0?'+':''}{rec.upside}%</span></div>
                  </div>
                  <ConfidenceBar value={rec.confidence||75}/>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Risk + Sentiment */}
        <div className="space-y-6">
          <div className="bg-card border border-border-subtle rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MdShield className="text-accent text-lg"/>
              <h3 className="font-display font-bold text-white text-base">Risk Analysis</h3>
            </div>
            {riskMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={riskMetrics} margin={{top:10,right:20,bottom:10,left:20}}>
                  <PolarGrid stroke="#232b38"/>
                  <PolarAngleAxis dataKey="subject" tick={{fill:'#8892a4',fontSize:10}}/>
                  <Radar name="Portfolio" dataKey="A" stroke="#00d2d3" fill="#00d2d3" fillOpacity={0.2} strokeWidth={2}/>
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-text-secondary text-sm text-center py-8">Add holdings for risk analysis</div>
            )}
            {riskData?.analysis && (
              <p className="text-text-secondary text-xs leading-relaxed mt-2 line-clamp-4">{riskData.analysis}</p>
            )}
          </div>

          <div className="bg-card border border-border-subtle rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MdPsychology className="text-accent text-lg"/>
              <h3 className="font-display font-bold text-white text-base">Sector Sentiment</h3>
            </div>
            <div className="space-y-3">
              {sentimentList.map(({sector,sentiment:sent,score})=>(
                <div key={sector} className="flex items-center gap-3">
                  <SentimentIcon s={sent}/>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm">{sector}</span>
                      <span className={`text-xs font-mono ${score>0?'text-success':score<0?'text-danger':'text-warning'}`}>
                        {score>0?'+':''}{score.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-border-subtle rounded-full h-1.5">
                      <div className={`h-full rounded-full ${score>0.3?'bg-success':score<-0.1?'bg-danger':'bg-warning'}`}
                        style={{width:`${Math.min(Math.abs(score)*100,100)}%`}}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIInsights
