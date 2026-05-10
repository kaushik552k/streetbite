import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  SafeAreaView, StatusBar, Animated, Platform,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme'
import { MOCK_MENU, MOCK_TRUCKS } from '../../lib/mockData'
import { useCartStore } from '../../store/cart'

type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  image: string
  isVeg: boolean
  isAvailable: boolean
}

function MenuCard({ item, truckId, truckName }: { item: MenuItem; truckId: string; truckName: string }) {
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)
  const updateQty = useCartStore((s) => s.updateQty)
  const cartItem = cartItems.find((c) => c.menuItemId === item.id)
  const qty = cartItem?.quantity ?? 0

  return (
    <View style={styles.menuCard}>
      <View style={{ flex: 1, gap: Spacing.xs }}>
        <View style={styles.vegRow}>
          <View style={[styles.vegBadge, item.isVeg ? styles.vegBadgeGreen : styles.vegBadgeRed]}>
            <View style={[styles.vegDot, item.isVeg ? styles.vegDotGreen : styles.vegDotRed]} />
          </View>
          <Text style={styles.menuName}>{item.name}</Text>
        </View>
        <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.menuRight}>
        <Image source={{ uri: item.image }} style={styles.menuImg} />
        {qty === 0 ? (
          <TouchableOpacity
            style={[styles.addBtn, !item.isAvailable && styles.addBtnDisabled]}
            onPress={() => addItem({ id: item.id, truckId, truckName, menuItemId: item.id, name: item.name, price: item.price, image: item.image, quantity: 1 })}
            disabled={!item.isAvailable}
          >
            <Text style={styles.addBtnText}>{item.isAvailable ? '+' : '—'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.qtyControl}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, qty - 1)}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyCount}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, qty + 1)}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

export default function TruckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState(0)

  const truck = MOCK_TRUCKS.find((t) => t.id === id) ?? MOCK_TRUCKS[0]
  const menu = MOCK_MENU[id as keyof typeof MOCK_MENU] ?? MOCK_MENU['1']

  const itemCount = useCartStore((s) => s.itemCount())
  const total = useCartStore((s) => s.total())

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[2]}>
        {/* Hero Image */}
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: truck.coverImage }} style={styles.hero} />
          <SafeAreaView style={styles.heroOverlay}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>‹</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Truck Info */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Image source={{ uri: truck.logo }} style={styles.truckLogo} />
            <View style={{ flex: 1 }}>
              <Text style={styles.truckName}>{truck.name}</Text>
              <Text style={styles.truckCuisine}>{truck.cuisine.join(' · ')}</Text>
            </View>
            <View style={[styles.statusBadge, truck.isActive ? styles.statusOpen : styles.statusClosed]}>
              <Text style={[styles.statusText, { color: truck.isActive ? Colors.success : Colors.error }]}>
                {truck.isActive ? '● Open' : '● Closed'}
              </Text>
            </View>
          </View>

          <Text style={styles.truckDesc}>{truck.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}><Text style={styles.metaChipText}>⭐ {truck.rating} ({truck.reviewCount})</Text></View>
            <View style={styles.metaChip}><Text style={styles.metaChipText}>📍 {truck.distance} mi</Text></View>
            <View style={styles.metaChip}><Text style={styles.metaChipText}>⏱ ~{truck.estimatedMins} min</Text></View>
          </View>

          {/* Offer Banner */}
          <View style={styles.offerBanner}>
            <Text style={styles.offerEmoji}>🏷️</Text>
            <Text style={styles.offerText}>Use code <Text style={styles.offerCode}>FIRST10</Text> — 10% off your first order!</Text>
          </View>
        </View>

        {/* Sticky Category Tabs */}
        <View style={styles.categoryTabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
            {menu.map((cat, i) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catTab, activeCategory === i && styles.catTabActive]}
                onPress={() => setActiveCategory(i)}
              >
                <Text style={[styles.catTabText, activeCategory === i && styles.catTabTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items */}
        {menu.map((cat, i) => (
          <View key={cat.id} style={styles.menuSection}>
            <Text style={styles.catTitle}>{cat.name}</Text>
            {cat.items.map((item) => (
              <MenuCard key={item.id} item={item} truckId={truck.id} truckName={truck.name} />
            ))}
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Cart Footer */}
      {itemCount > 0 && (
        <View style={styles.cartFooter}>
          <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/checkout')} activeOpacity={0.88}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
            <Text style={styles.cartBtnText}>View Cart</Text>
            <Text style={styles.cartTotal}>${total.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 260 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  backBtn: {
    margin: Spacing.lg, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: Colors.white, fontSize: 26, fontWeight: '300', lineHeight: 30 },

  infoBox: { backgroundColor: Colors.white, padding: Spacing.xl },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
  truckLogo: { width: 60, height: 60, borderRadius: Radius.lg, backgroundColor: Colors.surface },
  truckName: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.extraBold, color: Colors.text },
  truckCuisine: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  statusOpen: { backgroundColor: '#E8F8EF' },
  statusClosed: { backgroundColor: '#FEF2F2' },
  statusText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semiBold },
  truckDesc: { fontSize: Typography.sizes.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.md },
  metaRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: Spacing.md },
  metaChip: {
    backgroundColor: Colors.surface, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  metaChipText: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: Typography.weights.medium },
  offerBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: '#FFF8F0', borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: '#FFD6B3',
  },
  offerEmoji: { fontSize: 18 },
  offerText: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.text },
  offerCode: { fontWeight: Typography.weights.bold, color: Colors.primary },

  categoryTabs: {
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  catTab: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, backgroundColor: Colors.surface,
  },
  catTabActive: { backgroundColor: Colors.primary },
  catTabText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semiBold, color: Colors.textSecondary },
  catTabTextActive: { color: Colors.white },

  menuSection: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  catTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.extraBold, color: Colors.text, marginBottom: Spacing.md },
  menuCard: {
    flexDirection: 'row', gap: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    ...Shadow.sm, borderWidth: 1, borderColor: Colors.border,
  },
  vegRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  vegBadge: {
    width: 16, height: 16, borderRadius: 3, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  vegBadgeGreen: { borderColor: Colors.success },
  vegBadgeRed: { borderColor: Colors.error },
  vegDot: { width: 8, height: 8, borderRadius: 4 },
  vegDotGreen: { backgroundColor: Colors.success },
  vegDotRed: { backgroundColor: Colors.error },
  menuName: { flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semiBold, color: Colors.text },
  menuDesc: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 18 },
  menuPrice: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.text },
  menuRight: { alignItems: 'center', gap: Spacing.sm, width: 90 },
  menuImg: { width: 88, height: 72, borderRadius: Radius.md, backgroundColor: Colors.surface },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  addBtnDisabled: { backgroundColor: Colors.surface },
  addBtnText: { color: Colors.white, fontSize: 22, fontWeight: '300', lineHeight: 26 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { color: Colors.primary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, lineHeight: 22 },
  qtyCount: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.text, minWidth: 20, textAlign: 'center' },

  cartFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: 34,
  },
  cartBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', ...Shadow.md,
  },
  cartBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm,
  },
  cartBadgeText: { color: Colors.white, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
  cartBtnText: { flex: 1, color: Colors.white, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, textAlign: 'center' },
  cartTotal: { color: Colors.white, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semiBold },
})
