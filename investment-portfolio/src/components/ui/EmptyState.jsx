import { MdInbox } from 'react-icons/md'

const EmptyState = ({ icon: Icon = MdInbox, title = 'No data found', description = '', action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-card border border-border-subtle flex items-center justify-center mb-4">
      <Icon className="text-3xl text-text-secondary" />
    </div>
    <h3 className="text-white font-semibold text-base mb-1">{title}</h3>
    {description && <p className="text-text-secondary text-sm max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

export default EmptyState
