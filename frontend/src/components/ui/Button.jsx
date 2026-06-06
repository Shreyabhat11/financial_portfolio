import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-accent text-black hover:bg-accent-dark font-semibold',
  ghost: 'border border-border-subtle text-text-secondary hover:border-accent hover:text-accent',
  danger: 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
  success: 'bg-success/10 text-success border border-success/30 hover:bg-success/20',
  dark: 'bg-card border border-border-subtle text-white hover:border-accent/50',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

const Button = ({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, onClick, className = '', type = 'button', icon
}) => (
  <motion.button
    whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
    whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={`
      inline-flex items-center gap-2 font-medium transition-all duration-200
      ${variants[variant]} ${sizes[size]}
      ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${className}
    `}
  >
    {loading ? (
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    ) : icon ? (
      <span className="text-base">{icon}</span>
    ) : null}
    {children}
  </motion.button>
)

export default Button
