import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { login } from '../../services/auth.service'
import { useAuthStore } from '../../stores/auth.store'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export default function LoginScreen() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const { control, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => login(data),
    onSuccess: async ({ user, tokens }) => {
      await setAuth(user, tokens.accessToken, tokens.refreshToken)
      if (!user.hasCompletedOnboarding) { router.replace('/(auth)/onboarding'); return }
      router.replace('/(app)')
    },
    onError: () => setError('root', { message: 'Email ou senha incorretos.' }),
  })

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-6 py-16 gap-8">
      <View className="gap-1">
        <Text className="text-zinc-100 text-2xl font-bold">Entrar no Cortex</Text>
        <Text className="text-zinc-500 text-base">Continue sua jornada de evolução.</Text>
      </View>
      <View className="gap-4">
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
        {errors.root && <Text className="text-red-400 text-sm">{errors.root.message}</Text>}
      </View>
      <Button
        label="Entrar"
        onPress={handleSubmit((d) => mutation.mutate(d))}
        loading={mutation.isPending}
      />
      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text className="text-zinc-500 text-sm text-center">
          Não tem conta? <Text className="text-indigo-500 font-semibold">Cadastre-se</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
