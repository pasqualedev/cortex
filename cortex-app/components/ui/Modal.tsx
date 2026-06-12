import { Modal as RNModal, View, Text } from 'react-native'
import { Button } from './Button'

interface ModalProps {
  readonly visible: boolean
  readonly title: string
  readonly message: string
  readonly confirmLabel?: string
  readonly cancelLabel?: string
  readonly onConfirm: () => void
  readonly onCancel: () => void
}

/** Confirmation modal for destructive actions (e.g., exit challenge). */
export const Modal = ({
  visible, title, message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm, onCancel,
}: ModalProps) => (
  <RNModal visible={visible} transparent animationType="fade">
    <View className="flex-1 bg-black/60 justify-center items-center px-6">
      <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full gap-4">
        <Text className="text-zinc-100 text-lg font-bold">{title}</Text>
        <Text className="text-zinc-400 text-sm">{message}</Text>
        <View className="gap-2">
          <Button label={confirmLabel} onPress={onConfirm} variant="secondary" />
          <Button label={cancelLabel} onPress={onCancel} />
        </View>
      </View>
    </View>
  </RNModal>
)
