import { View, Text, StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { colors, spacing, font } from '../lib/theme'

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>Tela não encontrada</Text>
      <Link href="/" style={styles.link}>Voltar ao início</Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg950,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
  },
  message: {
    color: colors.text100,
    fontSize: font.lg,
    fontWeight: 'bold',
  },
  link: {
    color: colors.indigo500,
    fontSize: font.base,
  },
})
