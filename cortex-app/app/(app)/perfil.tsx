import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/auth.store'
import { Button } from '../../components/ui/Button'
import { colors, spacing, font, radius } from '../../lib/theme'

export default function PerfilScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const handleLogout = async () => {
    await clearAuth()
    router.replace('/(auth)/login')
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Avatar & Identity */}
      <View style={styles.identitySection}>
        <View style={styles.avatar} accessibilityLabel="Avatar do usuário">
          <Text style={styles.avatarInitial}>
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <View style={styles.identityText}>
          <Text style={styles.userName}>{user?.name ?? '—'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? '—'}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.level ?? 0}</Text>
            <Text style={styles.statLabel}>Nível</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.xp ?? 0}</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.streakDays ?? 0}</Text>
            <Text style={styles.statLabel}>Sequência</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button label="Sair da Conta" onPress={handleLogout} variant="secondary" />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg950,
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
    gap: spacing[6],
  },
  identitySection: {
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.indigo500_10,
    borderWidth: 1,
    borderColor: colors.indigo500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: colors.indigo400,
    fontSize: 30,
    fontWeight: 'bold',
  },
  identityText: {
    alignItems: 'center',
    gap: spacing['0.5'],
  },
  userName: {
    color: colors.text100,
    fontSize: font.lg,
    fontWeight: 'bold',
  },
  userEmail: {
    color: colors.text500,
    fontSize: font.sm,
  },
  statsCard: {
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: spacing['0.5'],
  },
  statValue: {
    color: colors.text100,
    fontWeight: 'bold',
    fontSize: font['2xl'],
  },
  statLabel: {
    color: colors.text500,
    fontSize: font.xs,
  },
  divider: {
    width: 1,
    backgroundColor: colors.bg800,
  },
  actionsContainer: {
    gap: spacing[2],
  },
})
