import { View, Text, StyleSheet } from 'react-native'
import { AnswerOption } from './AnswerOption'
import { colors, font, spacing, radius } from '../../lib/theme'
import type { OptionState } from './AnswerOption'
import type { QuestionDTO } from '../../types/domain'

interface QuestionCardProps {
  readonly question: QuestionDTO
  readonly selectedKey: string | null
  readonly correctKey: string | null   // null until submitted
  readonly onSelect: (key: string) => void
}

/** Renders the question statement and its answer options. */
export const QuestionCard = ({ question, selectedKey, correctKey, onSelect }: QuestionCardProps) => {
  const getState = (key: string): OptionState => {
    if (!correctKey) {
      return key === selectedKey ? 'selected' : 'idle'
    }
    if (key === correctKey) return 'correct'
    if (key === selectedKey && key !== correctKey) return 'wrong'
    return 'idle'
  }

  return (
    <View style={styles.container}>
      <View style={styles.statementCard}>
        <Text style={styles.meta}>{question.topic.name} • ENEM {question.year}</Text>
        <Text style={styles.statement}>{question.statement}</Text>
      </View>
      <View style={styles.optionsList}>
        {question.alternatives.map((alt) => (
          <AnswerOption
            key={alt.key}
            optionKey={alt.key}
            text={alt.text}
            state={getState(alt.key)}
            onPress={() => onSelect(alt.key)}
            disabled={correctKey !== null}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[4],
  },
  statementCard: {
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  meta: {
    color: colors.text400,
    fontSize: font.xs,
    marginBottom: spacing[2],
  },
  statement: {
    color: colors.text100,
    fontSize: font.sm,
    lineHeight: 24,
  },
  optionsList: {
    gap: spacing[2],
  },
})
