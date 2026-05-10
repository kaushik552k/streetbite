import { useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, Image, SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme'
import { MOCK_TRUCKS } from '../../lib/mockData'

export default function SearchScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const filtered = query.length > 1
    ? MOCK_TRUCKS.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.cuisine.some(c => c.toLowerCase().includes(query.toLowerCase()))
      )
    : []

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <View style={styles.searchRow}>
          <Text style={styles.icon}>🔍</Text>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Food truck, cuisine, or dish…"
            placeholderTextColor={Colors.textTertiary}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.length < 2 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🌮</Text>
          <Text style={styles.emptyTitle}>What are you craving?</Text>
          <Text style={styles.emptySub}>Search for your favourite food trucks or cuisines</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>😕</Text>
          <Text style={styles.emptyTitle}>No results for "{query}"</Text>
          <Text style={styles.emptySub}>Try a different search term</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => router.push(`/truck/${item.id}`)}
              activeOpacity={0.88}
            >
              <Image source={{ uri: item.logo }} style={styles.logo} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.cuisine}>{item.cuisine.join(' · ')}</Text>
                <Text style={styles.meta}>⭐ {item.rating} · {item.distance} mi · ~{item.estimatedMins} min</Text>
              </View>
              <View style={[styles.badge, !item.isActive && styles.badgeClosed]}>
                <Text style={styles.badgeText}>{item.isActive ? 'Open' : 'Closed'}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.extraBold, color: Colors.text, marginBottom: Spacing.md },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  icon: { fontSize: 16 },
  input: { flex: 1, fontSize: Typography.sizes.md, color: Colors.text },
  clearIcon: { fontSize: Typography.sizes.md, color: Colors.textTertiary, paddingHorizontal: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xxxl },
  emptyEmoji: { fontSize: 52, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text, textAlign: 'center' },
  emptySub: { fontSize: Typography.sizes.md, color: Colors.textSecondary, textAlign: 'center' },
  list: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm, gap: Spacing.md },
  resultCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.md, ...Shadow.sm, borderWidth: 1, borderColor: Colors.border,
  },
  logo: { width: 56, height: 56, borderRadius: Radius.md, backgroundColor: Colors.surface },
  name: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.text },
  cuisine: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  meta: { fontSize: Typography.sizes.sm, color: Colors.textTertiary, marginTop: 4 },
  badge: {
    backgroundColor: '#E8F8EF', paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeClosed: { backgroundColor: Colors.surface },
  badgeText: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, color: Colors.success },
})
