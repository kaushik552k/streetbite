import { useState } from 'react'
import { useRouter } from 'expo-router'
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Colors, Typography, Spacing, Radius } from '../../constants/theme'

export default function SignUpScreen() {
  const router = useRouter()
  const { signUp, setActive, isLoaded } = useSignUp()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignUp = async () => {
    if (!isLoaded) return
    setLoading(true)
    setError('')
    try {
      await signUp.create({ firstName: name.split(' ')[0], lastName: name.split(' ').slice(1).join(' '), emailAddress: email, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!isLoaded) return
    setLoading(true)
    setError('')
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(tabs)')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? 'Incorrect code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => setPendingVerification(false)}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Check your email ✉️</Text>
          <Text style={styles.subtitle}>We sent a 6-digit code to{'\n'}<Text style={{ color: Colors.primary, fontWeight: '600' }}>{email}</Text></Text>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={code}
                onChangeText={setCode}
                placeholder="000000"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
              />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.btn, (loading || code.length < 6) && styles.btnDisabled]}
              onPress={handleVerify}
              disabled={loading || code.length < 6}
              activeOpacity={0.85}
            >
              {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Verify & Continue</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create account 🎉</Text>
          <Text style={styles.subtitle}>Join StreetBite and find food trucks near you</Text>

          <View style={styles.form}>
            {[
              { label: 'Full Name', value: name, setter: setName, placeholder: 'John Doe', type: 'default' as const },
              { label: 'Email', value: email, setter: setEmail, placeholder: 'your@email.com', type: 'email-address' as const },
              { label: 'Password', value: password, setter: setPassword, placeholder: '••••••••', type: 'default' as const, secure: true },
            ].map((field) => (
              <View key={field.label} style={styles.inputGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={field.placeholder}
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType={field.type}
                  autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
                  secureTextEntry={field.secure}
                />
              </View>
            ))}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, (loading || !name || !email || !password) && styles.btnDisabled]}
              onPress={handleSignUp}
              disabled={loading || !name || !email || !password}
              activeOpacity={0.85}
            >
              {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Create Account</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
              <Text style={styles.footerLink}>Sign In</Text>
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
  subtitle: { fontSize: Typography.sizes.md, color: Colors.textSecondary, marginBottom: Spacing.xxxl, lineHeight: 22 },
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
  codeInput: { fontSize: 28, fontWeight: '700', letterSpacing: 8, paddingVertical: 20 },
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxxl, marginBottom: Spacing.xxxl },
  footerText: { color: Colors.textSecondary, fontSize: Typography.sizes.md },
  footerLink: { color: Colors.primary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semiBold },
})
