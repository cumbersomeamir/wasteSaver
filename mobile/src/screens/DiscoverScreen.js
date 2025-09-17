import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../constants/theme';

const DiscoverScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: '🍽️' },
    { id: 'bakery', name: 'Bakery', icon: '🥐' },
    { id: 'restaurant', name: 'Restaurant', icon: '🍕' },
    { id: 'grocery', name: 'Grocery', icon: '🥬' },
    { id: 'cafe', name: 'Cafe', icon: '☕' },
  ];

  const mockRescueBags = [
    {
      id: '1',
      title: 'Fresh Bakery Surprise',
      business: 'Sweet Dreams Bakery',
      price: 4.99,
      originalPrice: 15.99,
      distance: '0.8 km',
      category: 'bakery',
      pickupTime: '2:00 PM - 4:00 PM',
      rating: 4.5,
    },
    {
      id: '2',
      title: 'Restaurant Leftovers',
      business: 'Taste of Italy',
      price: 6.99,
      originalPrice: 22.99,
      distance: '1.2 km',
      category: 'restaurant',
      pickupTime: '8:00 PM - 9:00 PM',
      rating: 4.3,
    },
    {
      id: '3',
      title: 'Fresh Produce Box',
      business: 'Green Market',
      price: 3.99,
      originalPrice: 12.99,
      distance: '0.5 km',
      category: 'grocery',
      pickupTime: '6:00 PM - 7:00 PM',
      rating: 4.7,
    },
  ];

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContainer}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.categoryButtonActive,
          ]}
          onPress={() => {
            setSelectedCategory(category.id);
            setIsLoading(true);
            // Simulate loading
            setTimeout(() => setIsLoading(false), 500);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderRescueBag = (bag) => (
    <TouchableOpacity
      key={bag.id}
      style={styles.bagCard}
      onPress={() => navigation.navigate('RescueBagDetail', { bagId: bag.id })}
      activeOpacity={0.9}
    >
      <View style={styles.bagHeader}>
        <View style={styles.bagInfo}>
          <View style={styles.bagTitleContainer}>
            <Text style={styles.bagTitle}>{bag.title}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: COLORS[bag.category] + '20' }]}>
              <Text style={[styles.categoryBadgeText, { color: COLORS[bag.category] }]}>
                {bag.category.charAt(0).toUpperCase() + bag.category.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.businessName}>{bag.business}</Text>
        </View>
        <View style={styles.bagPrice}>
          <Text style={styles.currentPrice}>${bag.price}</Text>
          <Text style={styles.originalPrice}>${bag.originalPrice}</Text>
        </View>
      </View>

      <View style={styles.bagDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>{bag.distance}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>⏰</Text>
          <Text style={styles.detailText}>{bag.pickupTime}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>⭐</Text>
          <Text style={styles.detailText}>{bag.rating}</Text>
        </View>
      </View>

      <View style={styles.bagFooter}>
        <View style={styles.bagFooterLeft}>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((bag.originalPrice - bag.price) / bag.originalPrice) * 100)}% OFF
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.ratingText}>{bag.rating}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.reserveButton} activeOpacity={0.8}>
          <Text style={styles.reserveButtonText}>Reserve Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Find amazing rescue bags near you</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search rescue bags..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {renderCategoryFilter()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.bagsContainer}>
          {mockRescueBags.length > 0 ? (
            mockRescueBags.map((bag) => renderRescueBag(bag))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🔍</Text>
              <Text style={styles.emptyStateTitle}>No rescue bags found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Try adjusting your search or check back later for new deals!
              </Text>
            </View>
          )}
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
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: SIZES.title1,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.md,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.screenPadding,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: SIZES.radius * 1.5,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  categoryText: {
    fontSize: SIZES.caption1,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  bagsContainer: {
    paddingHorizontal: SPACING.screenPadding,
  },
  bagCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.2,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  bagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  bagInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  bagTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    flexWrap: 'wrap',
  },
  bagTitle: {
    fontSize: SIZES.title3,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.radius,
  },
  categoryBadgeText: {
    fontSize: SIZES.caption2,
    fontFamily: FONTS.bold,
  },
  businessName: {
    fontSize: SIZES.body,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  bagPrice: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: SIZES.title2,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  originalPrice: {
    fontSize: SIZES.caption1,
    fontFamily: FONTS.regular,
    color: COLORS.textDisabled,
    textDecorationLine: 'line-through',
  },
  bagDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  detailText: {
    fontSize: SIZES.caption1,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  bagFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bagFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  discountBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.radius,
    marginRight: SPACING.sm,
  },
  discountText: {
    fontSize: SIZES.caption1,
    fontFamily: FONTS.bold,
    color: COLORS.success,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.radius,
  },
  ratingIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  ratingText: {
    fontSize: SIZES.caption1,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  reserveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: SIZES.radius * 1.2,
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
  reserveButtonText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: SIZES.title3,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default DiscoverScreen;
