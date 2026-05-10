import { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, SafeAreaView, TextInput, Image, FlatList,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useUser } from '@clerk/clerk-expo'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme'
import { MOCK_TRUCKS, CUISINE_CATEGORIES } from '../../lib/mockData'

function TruckCard({ truck }: { truck: typeof MOCK_TRUCKS[0] }) {
  const router = useRouter()
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/truck/${truck.id}`)}
      activeOpacity={0.92}
    >
      <Image source={{ uri: truck.coverImage }} style={styles.cardImage} />
      {!truck.isActive && (
        <View style={styles.closedOverlay}>
          <Text style={styles.closedText}>Closed</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName} numberOfLines={1}>{truck.name}</Text>
            <Text style={styles.cardCuisine}>{truck.cuisine.join(' · ')}</Text>
          </View>
          <Image source={{ uri: truck.logo }} style={styles.truckLogo} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.metaPill}>⭐ {truck.rating}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{truck.distance} mi</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>~{truck.estimatedMins} min</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useUser()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const firstName = user?.firstName ?? 'there'

  const filteredTrucks = selectedCategory === 'all'
    ? MOCK_TRUCKS
    : MOCK_TRUCKS.filter(t =>
        t.cuisine.some(c => c.toLowerCase().includes(selectedCategory))
      )

  const onRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day, {firstName}! 👋</Text>
            <TouchableOpacity style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>New York, NY</Text>
              <Text style={styles.locationChevron}>›</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.8}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search food trucks, cuisines…</Text>
        </TouchableOpacity>

        {/* Active Order Banner */}
        <TouchableOpacity style={styles.activeBanner} onPress={() => router.push('/order/order-1')}>
          <View>
            <Text style={styles.activeBannerTitle}>🔥 Order in progress</Text>
            <Text style={styles.activeBannerSub}>The Burger Lab · Ready for pickup!</Text>
          </View>
          <Text style={styles.activeBannerChevron}>›</Text>
        </TouchableOpacity>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          {CUISINE_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={styles.chipEmoji}>{cat.emoji}</Text>
              <Text style={[styles.chipLabel, selectedCategory === cat.id && styles.chipLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Trucks</Text>
          <Text style={styles.sectionSub}>{filteredTrucks.length} found</Text>
        </View>

        {/* Truck List */}
        <View style={styles.truckList}>
          {filteredTrucks.map(truck => (
            <TruckCard key={truck.id} truck={truck} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  greeting: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 2 },
  locationIcon: { fontSize: 12 },
  locationText: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: Typography.weights.medium },
  locationChevron: { fontSize: Typography.sizes.md, color: Colors.primary, marginLeft: 2 },
  notifBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  notifIcon: { fontSize: 18 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.xl, marginBottom: Spacing.lg,
    backgroundColor: Colors.surface, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: 13,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16 },
  searchPlaceholder: { fontSize: Typography.sizes.md, color: Colors.textTertiary },

  activeBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: Spacing.xl, marginBottom: Spacing.lg,
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  activeBannerTitle: { color: Colors.white, fontWeight: Typography.weights.bold, fontSize: Typography.sizes.md },
  activeBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: Typography.sizes.sm, marginTop: 2 },
  activeBannerChevron: { color: Colors.white, fontSize: 22, fontWeight: '300' },

  chipScroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg, gap: Spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipEmoji: { fontSize: 14 },
  chipLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semiBold, color: Colors.textSecondary },
  chipLabelActive: { color: Colors.white },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text },
  sectionSub: { fontSize: Typography.sizes.sm, color: Colors.textTertiary },

  truckList: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.huge, gap: Spacing.lg },
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    overflow: 'hidden', ...Shadow.md,
  },
  cardImage: { width: '100%', height: 180 },
  closedOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 180,
    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  closedText: { color: Colors.white, fontWeight: Typography.weights.bold, fontSize: Typography.sizes.lg },
  cardBody: { padding: Spacing.lg },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  cardName: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text },
  cardCuisine: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  truckLogo: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.surface },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  metaPill: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semiBold, color: Colors.text },
  metaDot: { color: Colors.textTertiary },
  metaText: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
})
