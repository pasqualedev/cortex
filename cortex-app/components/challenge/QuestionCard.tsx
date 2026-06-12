import { View, Text, ScrollView } from 'react-native'
import { AnswerOption } from './AnswerOption'
import type { QuestionDTO } from '../../types/domain'

type OptionState = 'idle' | 'selected' | 'correct' | 'wrong'

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
    <View className="gap-4">
      <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <Text className="text-zinc-400 text-xs mb-2">{question.topic.name} • ENEM {question.year}</Text>
        <Text className="text-zinc-100 text-sm leading-6">{question.statement}</Text>
      </View>
      <View className="gap-2">
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
