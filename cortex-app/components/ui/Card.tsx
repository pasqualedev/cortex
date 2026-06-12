import { View } from 'react-native'

interface CardProps {
  readonly children: React.ReactNode
  readonly className?: string
}

/** Surface card following bg-zinc-900 + border-zinc-800 design token. */
export const Card = ({ children, className = '' }: CardProps) => (
  <View className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 ${className}`}>
    {children}
  </View>
)
