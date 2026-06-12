import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface InputProps extends TextInputProps {
  readonly label: string
  readonly error?: string
  readonly isPassword?: boolean
}

/** Form input with label, inline error, and optional password toggle. */
export const Input = ({ label, error, isPassword = false, ...props }: InputProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <View className="gap-1">
      <Text className="text-zinc-400 text-sm font-medium">{label}</Text>
      <View className="relative">
        <TextInput
          className={`bg-zinc-900 border rounded-xl px-4 h-14 text-zinc-100 text-base ${error ? 'border-red-500' : 'border-zinc-800'}`}
          placeholderTextColor="#71717a"
          secureTextEntry={isPassword && !visible}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setVisible((v) => !v)}
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color="#71717a" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-400 text-sm">{error}</Text>}
    </View>
  )
}
