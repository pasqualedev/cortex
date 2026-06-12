import { Modal as RNModal, View, Text, StyleSheet } from 'react-native'
import { Button } from './Button'
import { colors, radius, spacing, font } from '../../lib/theme'

interface ModalProps {
  readonly visible: boolean
  readonly title: string
  readonly message: string
  readonly confirmLabel?: string
  readonly cancelLabel?: string
  readonly onConfirm: () => void
  readonly onCancel: () => void
}

/**
 * Confirmation modal for destructive actions (e.g., exit challenge).
 * @param visible - Controls modal visibility.
 * @param title - Bold heading text.
 * @param message - Supporting body text.
 * @param confirmLabel - Label for the confirm button; defaults to 'Confirmar'.
 * @param cancelLabel - Label for the cancel button; defaults to 'Cancelar'.
 * @param onConfirm - Callback fired when confirm is pressed.
 * @param onCancel - Callback fired when cancel is pressed or modal is dismissed.
 */
export const Modal = ({
  visible, title, message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm, onCancel,
}: ModalProps) => (
  <RNModal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <View style={styles.container} accessibilityViewIsModal>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <Button label={confirmLabel} onPress={onConfirm} variant="secondary" />
          <Button label={cancelLabel} onPress={onCancel} />
        </View>
      </View>
    </View>
  </RNModal>
)

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.black60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  container: {
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.lg,
    padding: spacing[6],
    width: '100%',
    gap: spacing[4],
  },
  title: {
    color: colors.text100,
    fontSize: font.lg,
    fontWeight: 'bold',
  },
  message: {
    color: colors.text400,
    fontSize: font.sm,
  },
  actions: {
    gap: spacing[2],
  },
})
