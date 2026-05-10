import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useUser, useClerk } from '@clerk/clerk-expo'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme'

function MenuItem({ icon, label, onPress, danger = false }: { icon: string; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Text style={styles.menuChevron}>›</Text>
    </TouchableOpacity>
  )
}

export default function ProfileScreen() {
  const router = useRouter()
  const { user } = useUser()
  const { signOut } = useClerk()

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut(() => router.replace('/(auth)/welcome')) },
    ])
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.header}>Profile</Text>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitials}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.fullName ?? 'Guest'}</Text>
            <Text style={styles.userEmail}>{user?.primaryEmailAddress?.emailAddress}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Orders', value: '12' },
            { label: 'Favourites', value: '5' },
            { label: 'Reviews', value: '8' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statBox}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="📋" label="My Orders" onPress={() => router.push('/(tabs)/orders')} />
            <View style={styles.divider} />
            <MenuItem icon="❤️" label="Saved Trucks" onPress={() => {}} />
            <View style={styles.divider} />
            <MenuItem icon="📍" label="Saved Addresses" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="🎧" label="Help & Support" onPress={() => {}} />
            <View style={styles.divider} />
            <MenuItem icon="⭐" label="Rate the App" onPress={() => {}} />
            <View style={styles.divider} />
            <MenuItem icon="📄" label="Privacy Policy" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.menuCard}>
            <MenuItem icon="🚪" label="Sign Out" onPress={handleSignOut} danger />
          </View>
        </View>

        <Text style={styles.version}>StreetBite v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.huge },
  header: { fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.extraBold, color: Colors.text, marginTop: Spacing.lg, marginBottom: Spacing.lg },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: Spacing.lg, ...Shadow.sm, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.primarySurface, alignItems: 'center', justifyContent: 'center',
  },
  avatarImage: { width: 60, height: 60, borderRadius: 30 },
  avatarInitials: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.primary },
  userName: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text },
  userEmail: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  editBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.primarySurface, borderRadius: Radius.full,
  },
  editBtnText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semiBold, color: Colors.primary },

  statsRow: {
    flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1, backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center', ...Shadow.sm, borderWidth: 1, borderColor: Colors.border,
  },
  statValue: { fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.extraBold, color: Colors.text },
  statLabel: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },

  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm },
  menuCard: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    ...Shadow.sm, borderWidth: 1, borderColor: Colors.border,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  menuIcon: { fontSize: 20, width: 28 },
  menuLabel: { flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium, color: Colors.text },
  menuLabelDanger: { color: Colors.error },
  menuChevron: { fontSize: Typography.sizes.xl, color: Colors.textTertiary },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 60 },
  version: { textAlign: 'center', fontSize: Typography.sizes.sm, color: Colors.textTertiary, marginTop: Spacing.md },
})
