import { View, Text, StyleSheet } from 'react-native'
import type { AchievementsResponse } from '../../types/domain'
import { colors, spacing, font, radius } from '../../lib/theme'

interface AchievementGridProps {
  readonly data: AchievementsResponse
}

/** Grid of unlocked achievements + locked achievements with progress. */
export const AchievementGrid = ({ data }: AchievementGridProps) => (
  <View style={styles.container}>
    <Text style={styles.heading}>Conquistas</Text>
    <View style={styles.grid}>
      {data.unlocked.map((a) => (
        <View key={a.id} style={styles.card}>
          <Text style={styles.icon}>{a.icon}</Text>
          <Text style={styles.cardName}>{a.name}</Text>
          <Text style={styles.unlockedBadge}>Desbloqueada</Text>
        </View>
      ))}
      {data.locked.map((a) => (
        <View key={a.id} style={[styles.card, styles.cardLocked]}>
          <Text style={styles.icon}>{a.icon}</Text>
          <Text style={styles.cardNameLocked}>{a.name}</Text>
          <Text style={styles.lockedProgress}>{a.progress}/{a.threshold}</Text>
        </View>
      ))}
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
  heading: {
    color: colors.text100,
    fontWeight: '600',
    fontSize: font.base,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  card: {
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.md,
    padding: spacing[3],
    alignItems: 'center',
    gap: spacing[1],
    width: '30%',
  },
  cardLocked: {
    opacity: 0.5,
  },
  icon: {
    fontSize: font['2xl'],
  },
  cardName: {
    color: colors.text100,
    fontSize: font.xs,
    textAlign: 'center',
    fontWeight: '500',
  },
  cardNameLocked: {
    color: colors.text400,
    fontSize: font.xs,
    textAlign: 'center',
  },
  unlockedBadge: {
    color: colors.emerald400,
    fontSize: font.xs,
  },
  lockedProgress: {
    color: colors.text600,
    fontSize: font.xs,
  },
})
