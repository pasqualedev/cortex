import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'

interface ButtonProps {
  readonly label: string
  readonly onPress: () => void
  readonly variant?: 'primary' | 'secondary' | 'ghost'
  readonly loading?: boolean
  readonly disabled?: boolean
}

/** Reusable button following the Cortex design system. */
export const Button = ({ label, onPress, variant = 'primary', loading = false, disabled = false }: ButtonProps) => {
  const variants = {
    primary: 'bg-indigo-500',
    secondary: 'bg-zinc-800 border border-zinc-800',
    ghost: 'bg-transparent',
  }
  const textVariants = {
    primary: 'text-white font-bold text-base',
    secondary: 'text-zinc-100 font-semibold text-base',
    ghost: 'text-zinc-400 text-base',
  }

  return (
    <TouchableOpacity
      className={`h-14 w-full rounded-xl items-center justify-center ${variants[variant]} ${disabled || loading ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#6366f1'} />
      ) : (
        <Text className={textVariants[variant]}>{label}</Text>
      )}
    </TouchableOpacity>
  )
}
