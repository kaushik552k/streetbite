import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme'

const STEPS = [
  { key: 'PENDING',    label: 'Order Placed',   emoji: '📋', desc: 'Your order has been received' },
  { key: 'CONFIRMED',  label: 'Confirmed',       emoji: '✅', desc: 'The truck has accepted your order' },
  { key: 'PREPARING',  label: 'Preparing',       emoji: '👨‍🍳', desc: 'Your food is being prepared' },
  { key: 'READY',      label: 'Ready for Pickup', emoji: '🎉', desc: 'Head over to pick up your order!' },
]

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(2) // PREPARING
  const [minutesLeft, setMinutesLeft] = useState(8)

  // Simulate order progressing in demo
  useEffect(() => {
    const timer = setInterval(() => {
      setMinutesLeft((m) => Math.max(0, m - 1))
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const activeStatus = STEPS[currentStep]

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Live Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusEmoji}>{activeStatus.emoji}</Text>
          <Text style={styles.statusTitle}>{activeStatus.label}</Text>
          <Text style={styles.statusDesc}>{activeStatus.desc}</Text>

          {minutesLeft > 0 && currentStep < 3 && (
            <View style={styles.etaBox}>
              <Text style={styles.etaNumber}>{minutesLeft}</Text>
              <Text style={styles.etaLabel}>minutes{'\n'}estimated</Text>
            </View>
          )}

          {currentStep === 3 && (
            <View style={[styles.etaBox, { backgroundColor: '#E8F8EF' }]}>
              <Text style={[styles.etaNumber, { color: Colors.success }]}>🎉</Text>
              <Text style={[styles.etaLabel, { color: Colors.success }]}>Ready{'\n'}now!</Text>
            </View>
          )}
        </View>

        {/* Progress Timeline */}
        <View style={styles.timeline}>
          {STEPS.map((step, index) => {
            const done = index < currentStep
            const active = index === currentStep
            return (
              <View key={step.key} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.dot,
                    done && styles.dotDone,
                    active && styles.dotActive,
                  ]}>
                    <Text style={styles.dotText}>{done ? '✓' : (index + 1).toString()}</Text>
                  </View>
                  {index < STEPS.length - 1 && (
                    <View style={[styles.line, done && styles.lineDone]} />
                  )}
                </View>
                <View style={styles.timelineBody}>
                  <Text style={[styles.stepLabel, (done || active) && styles.stepLabelActive]}>
                    {step.emoji} {step.label}
                  </Text>
                  {active && <Text style={styles.stepDesc}>{step.desc}</Text>}
                </View>
              </View>
            )
          })}
        </View>

        {/* Order ID */}
        <View style={styles.orderIdRow}>
          <Text style={styles.orderIdLabel}>Order ID</Text>
          <Text style={styles.orderIdValue}>#{id?.toUpperCase()}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {currentStep === 3 && (
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => router.replace('/(tabs)/orders')}
            >
              <Text style={styles.doneBtnText}>Back to Orders</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.supportBtn} onPress={() => router.back()}>
            <Text style={styles.supportBtnText}>🎧 Need help?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backText: { fontSize: 26, color: Colors.text, fontWeight: '300' },
  headerTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text },
  content: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },

  statusCard: {
    backgroundColor: Colors.primary, borderRadius: Radius.xl,
    padding: Spacing.xxxl, alignItems: 'center', marginBottom: Spacing.xl, ...Shadow.md,
  },
  statusEmoji: { fontSize: 52, marginBottom: Spacing.md },
  statusTitle: { fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.extraBold, color: Colors.white, marginBottom: Spacing.sm },
  statusDesc: { fontSize: Typography.sizes.md, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: Spacing.lg },
  etaBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  etaNumber: { fontSize: 48, fontWeight: Typography.weights.extraBold, color: Colors.white },
  etaLabel: { fontSize: Typography.sizes.md, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },

  timeline: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, ...Shadow.sm, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg },
  timelineRow: { flexDirection: 'row', gap: Spacing.lg },
  timelineLeft: { alignItems: 'center', width: 28 },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  dotDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dotActive: { backgroundColor: Colors.white, borderColor: Colors.primary, borderWidth: 3 },
  dotText: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, color: Colors.textTertiary },
  line: { width: 2, flex: 1, backgroundColor: Colors.border, marginVertical: 4 },
  lineDone: { backgroundColor: Colors.primary },
  timelineBody: { flex: 1, paddingBottom: Spacing.lg },
  stepLabel: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semiBold, color: Colors.textTertiary, lineHeight: 28 },
  stepLabelActive: { color: Colors.text },
  stepDesc: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },

  orderIdRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md, marginBottom: Spacing.xl,
  },
  orderIdLabel: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  orderIdValue: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.text },

  actions: { gap: Spacing.md },
  doneBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
  doneBtnText: { color: Colors.white, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
  supportBtn: { paddingVertical: 14, alignItems: 'center', borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border },
  supportBtnText: { color: Colors.textSecondary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium },
})
