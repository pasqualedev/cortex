import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, TextInputProps, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, spacing, font } from '../../lib/theme'

interface InputProps extends TextInputProps {
  readonly label: string
  readonly error?: string
  readonly isPassword?: boolean
}

/**
 * Form input with label, inline error, and optional password toggle.
 * @param label - Accessible and visible field label.
 * @param error - Optional validation error string rendered below the input.
 * @param isPassword - When true shows a visibility toggle icon.
 */
export const Input = ({ label, error, isPassword = false, ...props }: InputProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error ? styles.inputError : styles.inputDefault]}
          placeholderTextColor={colors.text500}
          secureTextEntry={isPassword && !visible}
          accessibilityLabel={label}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setVisible((v) => !v)}
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.text500} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing[1],
  },
  label: {
    color: colors.text400,
    fontSize: font.sm,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    height: spacing[14],
    color: colors.text100,
    fontSize: font.base,
  },
  inputDefault: {
    borderColor: colors.bg800,
  },
  inputError: {
    borderColor: colors.red500,
  },
  eyeButton: {
    position: 'absolute',
    right: spacing[4],
    top: spacing[4],
  },
  errorText: {
    color: colors.red400,
    fontSize: font.sm,
  },
})
