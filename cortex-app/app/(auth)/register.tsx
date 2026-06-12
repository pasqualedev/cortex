import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { register } from '../../services/auth.service'
import { useAuthStore } from '../../stores/auth.store'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { colors, font, spacing } from '../../lib/theme'

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export default function RegisterScreen() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const { control, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => register(data),
    onSuccess: async ({ user, tokens }) => {
      await setAuth(user, tokens.accessToken, tokens.refreshToken)
      router.replace('/(auth)/onboarding')
    },
    onError: () => setError('root', { message: 'Este email já está em uso.' }),
  })

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerGroup}>
        <Text style={styles.heading}>Criar conta</Text>
        <Text style={styles.subheading}>Comece sua jornada de evolução.</Text>
      </View>
      <View style={styles.fieldGroup}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email"
              placeholder="seu@email.com"
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Senha"
              placeholder="••••••"
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
              isPassword
            />
          )}
        />
        {errors.root && <Text style={styles.errorText}>{errors.root.message}</Text>}
      </View>
      <Button
        label="Criar conta"
        onPress={handleSubmit((d) => mutation.mutate(d))}
        loading={mutation.isPending}
      />
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.linkText}>
          Já tem conta? <Text style={styles.linkAccent}>Entrar</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg950,
  },
  contentContainer: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[8] * 2,
    gap: spacing[8],
  },
  headerGroup: {
    gap: spacing[1],
  },
  heading: {
    color: colors.text100,
    fontSize: font['2xl'],
    fontWeight: 'bold',
  },
  subheading: {
    color: colors.text500,
    fontSize: font.base,
  },
  fieldGroup: {
    gap: spacing[4],
  },
  errorText: {
    color: colors.red400,
    fontSize: font.sm,
  },
  linkText: {
    color: colors.text500,
    fontSize: font.sm,
    textAlign: 'center',
  },
  linkAccent: {
    color: colors.indigo500,
    fontWeight: '600',
  },
})
