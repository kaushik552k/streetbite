import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, TextInput, Alert, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useCartStore } from '../store/cart'
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme'

export default function CheckoutScreen() {
  const router = useRouter()
  const { items, total, truckName, clearCart, updateQty, removeItem } = useCartStore()
  const [promoCode, setPromoCode] = useState('')
  const [note, setNote] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [loading, setLoading] = useState(false)

  const subtotal = total()
  const discount = promoApplied ? subtotal * 0.10 : 0
  const grandTotal = subtotal - discount

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'FIRST10') {
      setPromoApplied(true)
    } else {
      Alert.alert('Invalid Code', 'This promo code is not valid.')
    }
  }

  const handlePlaceOrder = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      clearCart()
      router.replace('/order/order-new')
    }, 1500)
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Truck Name */}
        <View style={styles.truckTag}>
          <Text style={styles.truckTagEmoji}>🚚</Text>
          <Text style={styles.truckTagText}>{truckName}</Text>
        </View>

        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.card}>
            {items.map((item, index) => (
              <View key={item.menuItemId}>
                <View style={styles.cartItem}>
                  {item.image && <Image source={{ uri: item.image }} style={styles.itemImg} />}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.menuItemId, item.quantity - 1)}>
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyCount}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.menuItemId, item.quantity + 1)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {index < items.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Promo Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Enter code (try FIRST10)"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="characters"
              editable={!promoApplied}
            />
            <TouchableOpacity
              style={[styles.promoBtn, promoApplied && styles.promoBtnApplied]}
              onPress={applyPromo}
              disabled={promoApplied || !promoCode}
            >
              <Text style={styles.promoBtnText}>{promoApplied ? '✓ Applied' : 'Apply'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Note (optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Any special requests or instructions…"
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Totals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.card}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            {promoApplied && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: Colors.success }]}>Discount (10%)</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>−${discount.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment note */}
        <View style={styles.paymentNote}>
          <Text style={styles.paymentNoteIcon}>💳</Text>
          <Text style={styles.paymentNoteText}>Payment processed securely via Stripe</Text>
        </View>
      </ScrollView>

      {/* Place Order CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.orderBtn, loading && styles.orderBtnLoading]}
          onPress={handlePlaceOrder}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.orderBtnText}>Place Order · ${grandTotal.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
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
  backText: { fontSize: 20, color: Colors.text },
  headerTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.huge },
  truckTag: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginTop: Spacing.lg, marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.primarySurface, borderRadius: Radius.full, alignSelf: 'flex-start',
  },
  truckTagEmoji: { fontSize: 16 },
  truckTagText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semiBold, color: Colors.primary },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, ...Shadow.sm, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  itemImg: { width: 52, height: 44, borderRadius: Radius.sm, backgroundColor: Colors.surface },
  itemName: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium, color: Colors.text },
  itemPrice: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 52 + Spacing.md * 2 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: Colors.primary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, lineHeight: 22 },
  qtyCount: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.text, minWidth: 20, textAlign: 'center' },
  promoRow: { flexDirection: 'row', gap: Spacing.sm },
  promoInput: {
    flex: 1, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: 12,
    fontSize: Typography.sizes.md, color: Colors.text,
  },
  promoBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg, justifyContent: 'center',
  },
  promoBtnApplied: { backgroundColor: Colors.success },
  promoBtnText: { color: Colors.white, fontWeight: Typography.weights.bold, fontSize: Typography.sizes.sm },
  noteInput: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: 12,
    fontSize: Typography.sizes.md, color: Colors.text, minHeight: 80, textAlignVertical: 'top',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.md, paddingVertical: Spacing.sm + 2 },
  summaryLabel: { fontSize: Typography.sizes.md, color: Colors.textSecondary },
  summaryValue: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium, color: Colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 2, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  totalLabel: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text },
  totalValue: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.extraBold, color: Colors.text },
  paymentNote: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, justifyContent: 'center', marginTop: -Spacing.sm },
  paymentNoteIcon: { fontSize: 14 },
  paymentNoteText: { fontSize: Typography.sizes.sm, color: Colors.textTertiary },
  footer: {
    paddingHorizontal: Spacing.xl, paddingBottom: 34, paddingTop: Spacing.md,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  orderBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center', ...Shadow.md },
  orderBtnLoading: { opacity: 0.8 },
  orderBtnText: { color: Colors.white, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
})
