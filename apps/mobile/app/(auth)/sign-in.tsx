import { useState } from 'react'
import { useRouter } from 'expo-router'
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { useSignIn } from '@clerk/clerk-expo'
import { Colors, Typography, Spacing, Radius } from '../../constants/theme'

export default function SignInScreen() {
  const router = useRouter()
  const { signIn, setActive, isLoaded } = useSignIn()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async () => {
    if (!isLoaded) return
    setLoading(true)
    setError('')
    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(tabs)')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <Text style={styles.title}>Welcome back 👋</Text>
          <Text style={styles.subtitle}>Sign in to continue ordering</Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSignIn}
              disabled={loading || !email || !password}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.btnText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-up')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  back: { marginBottom: Spacing.xxxl },
  backText: { fontSize: Typography.sizes.md, color: Colors.primary, fontWeight: Typography.weights.medium },
  title: { fontSize: Typography.sizes.xxxl, fontWeight: Typography.weights.extraBold, color: Colors.text, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.sizes.md, color: Colors.textSecondary, marginBottom: Spacing.xxxl },
  form: { gap: Spacing.lg },
  inputGroup: { gap: Spacing.sm },
  label: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semiBold, color: Colors.textSecondary },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  error: { fontSize: Typography.sizes.sm, color: Colors.error, textAlign: 'center' },
  btn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.full,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: Colors.white, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxxl },
  footerText: { color: Colors.textSecondary, fontSize: Typography.sizes.md },
  footerLink: { color: Colors.primary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semiBold },
})
