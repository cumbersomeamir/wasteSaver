import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SIZES, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const quickActions = [
    {
      title: 'Find Rescue Bags',
      subtitle: 'Discover nearby deals',
      icon: '🔍',
      onPress: () => navigation.navigate('Discover'),
      color: COLORS.primary,
    },
    {
      title: 'My Orders',
      subtitle: 'Track your pickups',
      icon: '📦',
      onPress: () => navigation.navigate('OrderHistory'),
      color: COLORS.secondary,
    },
    {
      title: 'Favorites',
      subtitle: 'Your saved businesses',
      icon: '❤️',
      onPress: () => navigation.navigate('Favorites'),
      color: COLORS.accent,
    },
    {
      title: 'Impact Stats',
      subtitle: 'See your contribution',
      icon: '🌱',
      onPress: () => navigation.navigate('Profile'),
      color: COLORS.success,
    },
  ];

  const renderQuickAction = (action, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.actionCard, { backgroundColor: action.color + '15' }]}
      onPress={action.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIconContainer, { backgroundColor: action.color + '25' }]}>
        <Text style={styles.actionIcon}>{action.icon}</Text>
      </View>
      <Text style={styles.actionTitle}>{action.title}</Text>
      <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
      <View style={[styles.actionBadge, { backgroundColor: action.color + '30' }]}>
        <Text style={[styles.actionBadgeText, { color: action.color }]}>→</Text>
      </View>
    </TouchableOpacity>
  );

  const renderImpactCard = () => (
    <View style={styles.impactCard}>
      <View style={styles.impactHeader}>
        <Text style={styles.impactTitle}>Your Impact This Month</Text>
        <Text style={styles.impactSubtitle}>Making a difference, one rescue at a time</Text>
      </View>
      <View style={styles.impactStats}>
        <View style={styles.impactStat}>
          <View style={[styles.impactStatIcon, { backgroundColor: COLORS.moneySaved + '20' }]}>
            <Text style={styles.impactStatIconText}>💰</Text>
          </View>
          <Text style={styles.impactValue}>${user?.totalSaved || 0}</Text>
          <Text style={styles.impactLabel}>Money Saved</Text>
          <View style={[styles.impactTrend, { backgroundColor: COLORS.moneySaved + '10' }]}>
            <Text style={[styles.impactTrendText, { color: COLORS.moneySaved }]}>↗ +12%</Text>
          </View>
        </View>
        <View style={styles.impactStat}>
          <View style={[styles.impactStatIcon, { backgroundColor: COLORS.co2Saved + '20' }]}>
            <Text style={styles.impactStatIconText}>🌱</Text>
          </View>
          <Text style={styles.impactValue}>{user?.totalCO2eSaved || 0}kg</Text>
          <Text style={styles.impactLabel}>CO₂ Saved</Text>
          <View style={[styles.impactTrend, { backgroundColor: COLORS.co2Saved + '10' }]}>
            <Text style={[styles.impactTrendText, { color: COLORS.co2Saved }]}>↗ +8%</Text>
          </View>
        </View>
        <View style={styles.impactStat}>
          <View style={[styles.impactStatIcon, { backgroundColor: COLORS.waterSaved + '20' }]}>
            <Text style={styles.impactStatIconText}>💧</Text>
          </View>
          <Text style={styles.impactValue}>{user?.totalWaterSaved || 0}L</Text>
          <Text style={styles.impactLabel}>Water Saved</Text>
          <View style={[styles.impactTrend, { backgroundColor: COLORS.waterSaved + '10' }]}>
            <Text style={[styles.impactTrendText, { color: COLORS.waterSaved }]}>↗ +15%</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'User'}! 👋</Text>
            <Text style={styles.subtitle}>Ready to rescue some food today?</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {renderImpactCard()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => renderQuickAction(action, index))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityIcon}>📦</Text>
            <Text style={styles.activityText}>No recent activity</Text>
            <Text style={styles.activitySubtext}>Start by finding your first rescue bag!</Text>
            <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate('Discover')}>
              <Text style={styles.exploreButtonText}>Explore Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips & Tricks</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>
              Check the app regularly for new rescue bags. Popular items sell out quickly!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: SIZES.title1,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    opacity: 0.8,
  },
  logoutButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radius * 1.2,
    backgroundColor: COLORS.lightGray,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoutText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  impactCard: {
    marginHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  impactHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  impactTitle: {
    fontSize: SIZES.title3,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  impactSubtitle: {
    fontSize: SIZES.caption1,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactStat: {
    alignItems: 'center',
    flex: 1,
  },
  impactStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  impactStatIconText: {
    fontSize: 20,
  },
  impactValue: {
    fontSize: SIZES.title2,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  impactLabel: {
    fontSize: SIZES.caption1,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  impactTrend: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.radius,
  },
  impactTrendText: {
    fontSize: SIZES.caption2,
    fontFamily: FONTS.bold,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: SIZES.title3,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.screenPadding,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.screenPadding,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - SPACING.screenPadding * 2 - SPACING.md) / 2,
    padding: SPACING.lg,
    borderRadius: SIZES.radius * 1.2,
    alignItems: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: SIZES.caption1,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  actionBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  activityCard: {
    marginHorizontal: SPACING.screenPadding,
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activityIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
    opacity: 0.6,
  },
  activityText: {
    fontSize: SIZES.title3,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  activitySubtext: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.textHint,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: SIZES.radius * 1.5,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  exploreButtonText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  tipCard: {
    marginHorizontal: SPACING.screenPadding,
    padding: SPACING.lg,
    backgroundColor: COLORS.accent + '10',
    borderRadius: SIZES.radius * 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tipIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  tipText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
});

export default HomeScreen;
