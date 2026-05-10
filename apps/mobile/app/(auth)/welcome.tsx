import { useRouter } from 'expo-router'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Dimensions, SafeAreaView,
} from 'react-native'
import { Colors, Typography, Spacing, Radius } from '../../constants/theme'

const { width, height } = Dimensions.get('window')

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&q=80' }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* Gradient Overlay */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.content}>
        {/* Logo area */}
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>🚚</Text>
          <Text style={styles.logoText}>StreetBite</Text>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottom}>
          <Text style={styles.headline}>Street Food,{'\n'}Your Way.</Text>
          <Text style={styles.tagline}>Discover food trucks near you and order for pickup in minutes.</Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/sign-up')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(auth)/sign-in')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  heroImage: { position: 'absolute', width, height },
  overlay: {
    position: 'absolute', width, height,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: Spacing.xl },
  logoArea: { marginTop: Spacing.xxxl, flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoEmoji: { fontSize: 32 },
  logoText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.extraBold,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  bottom: { marginBottom: Spacing.xxxl },
  headline: {
    fontSize: Typography.sizes.display,
    fontWeight: Typography.weights.extraBold,
    color: Colors.white,
    lineHeight: Typography.sizes.display * 1.2,
    marginBottom: Spacing.md,
  },
  tagline: {
    fontSize: Typography.sizes.md,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: Spacing.xxxl,
    lineHeight: 22,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.full,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  secondaryBtn: {
    paddingVertical: 16,
    borderRadius: Radius.full,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  secondaryBtnText: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
})
