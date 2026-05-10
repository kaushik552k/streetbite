import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme'
import { MOCK_ORDERS } from '../../lib/mockData'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  PENDING:    { label: 'Pending',    color: Colors.warning, bg: '#FEF9EE', emoji: '⏳' },
  CONFIRMED:  { label: 'Confirmed',  color: Colors.info,    bg: '#EEF5FF', emoji: '✅' },
  PREPARING:  { label: 'Preparing', color: Colors.primary,  bg: '#FFF1EC', emoji: '👨‍🍳' },
  READY:      { label: 'Ready!',    color: Colors.success,  bg: '#E8F8EF', emoji: '🎉' },
  COMPLETED:  { label: 'Completed', color: Colors.textTertiary, bg: Colors.surface, emoji: '✓' },
  CANCELLED:  { label: 'Cancelled', color: Colors.error,   bg: '#FEF2F2', emoji: '✕' },
}

function timeAgo(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-expo'

export default function OrdersScreen() {
  const router = useRouter()
  const { getToken } = useAuth()

  const { data: response, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/orders`, {
        headers: { Authorization: 'Bearer dev_bypass' }
      })
      if (!res.ok) throw new Error('Failed to fetch orders')
      return res.json()
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  })

  const orders = response?.data || []
  
  const activeOrders = orders.filter((o: any) => !['COMPLETED', 'CANCELLED'].includes(o.status))
  const pastOrders = orders.filter((o: any) => ['COMPLETED', 'CANCELLED'].includes(o.status))

  const renderOrder = ({ item }: { item: any }) => {
    const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG['PENDING']
    const isActive = !['COMPLETED', 'CANCELLED'].includes(item.status)
    const logoImg = item.truck?.logo || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=150&q=80'
    const itemCount = item.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/order/${item.id}`)}
        activeOpacity={0.88}
      >
        <View style={styles.cardLeft}>
          <Image source={{ uri: logoImg }} style={styles.logo} />
          {isActive && <View style={styles.activeDot} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.truckName}>{item.truck?.name || 'Unknown Truck'}</Text>
          <Text style={styles.orderMeta}>{itemCount} items · ${item.total.toFixed(2)}</Text>
          <Text style={styles.timeAgo}>{timeAgo(item.createdAt)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
          <Text style={styles.badgeEmoji}>{sc.emoji}</Text>
          <Text style={[styles.badgeText, { color: sc.color }]}>{sc.label}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={[...activeOrders, ...pastOrders]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListHeaderComponent={() => (
          <>
            <Text style={styles.header}>My Orders</Text>
            {activeOrders.length > 0 && <Text style={styles.sectionTitle}>Active</Text>}
          </>
        )}
        renderItem={renderOrder}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListFooterComponent={() =>
          pastOrders.length > 0 ? (
            <View style={{ marginTop: Spacing.xl }}>
              <Text style={styles.sectionTitle}>Past Orders</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>
              {isLoading ? 'Loading orders...' : 'No orders yet'}
            </Text>
            <Text style={styles.emptySub}>
              {isLoading ? 'Please wait' : 'Find a food truck and place your first order!'}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.huge },
  header: { fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.extraBold, color: Colors.text, marginTop: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.md },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.md, ...Shadow.sm, borderWidth: 1, borderColor: Colors.border,
  },
  cardLeft: { position: 'relative' },
  logo: { width: 52, height: 52, borderRadius: Radius.md, backgroundColor: Colors.surface },
  activeDot: {
    position: 'absolute', top: -2, right: -2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.white,
  },
  truckName: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.text },
  orderMeta: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  timeAgo: { fontSize: Typography.sizes.xs, color: Colors.textTertiary, marginTop: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: Radius.full,
  },
  badgeEmoji: { fontSize: 12 },
  badgeText: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold },
  empty: { alignItems: 'center', paddingTop: Spacing.huge * 2, gap: Spacing.sm },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text },
  emptySub: { fontSize: Typography.sizes.md, color: Colors.textSecondary, textAlign: 'center' },
})
