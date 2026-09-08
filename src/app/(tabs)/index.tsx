import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ItemCard } from '@/components/item-card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { DEFAULT_PICKUP_TOKEN } from '@/constants/config';
import { CardShadow, Radius } from '@/constants/layout';
import { BottomTabInset, Fonts } from '@/constants/theme';
import * as offersService from '@/services/offers-service';
import * as reservationService from '@/services/reservation-service';
import * as reviewService from '@/services/review-service';
import * as selfOrderingService from '@/services/self-ordering-service';
import { useCartStore, cartItemCount } from '@/state/cart-store';
import { useMenuData } from '@/state/menu-context';
import { useAppTheme } from '@/state/theme-context';

export default function MenuScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const cartItems = useCartStore((s) => s.items);
  const { menuItems, itemRatings, setMenuData } = useMenuData();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeOffers, setActiveOffers] = useState<Record<string, any>[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branchPickerVisible, setBranchPickerVisible] = useState(false);
  const [offersPageIndex, setOffersPageIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        await selfOrderingService.getOrderingContext(DEFAULT_PICKUP_TOKEN);
        const [menuData, ratings, branchList, offers] = await Promise.all([
          selfOrderingService.getCustomerMenu(),
          reviewService.getItemRatings(),
          reservationService.getBranches(),
          offersService.listActiveOffers(),
        ]);
        setMenuData(menuData.items ?? [], ratings);
        setBranches(branchList);
        if (branchList.length > 0) setSelectedBranch(branchList[0]);
        setActiveOffers(offers);
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : String(e));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const real = Array.from(
      new Set(menuItems.map((item) => String(item.course ?? '')).filter(Boolean))
    ).sort();
    return ['All', ...real];
  }, [menuItems]);

  const filteredItems = useMemo(
    () =>
      selectedCategory === 'All'
        ? menuItems
        : menuItems.filter((item) => String(item.course ?? '') === selectedCategory),
    [menuItems, selectedCategory]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <EmptyState icon="cloud-offline-outline" title="Couldn't load the menu" message={errorMessage} />
      </SafeAreaView>
    );
  }

  const cartCount = cartItemCount(cartItems);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => setBranchPickerVisible(true)} hitSlop={4}>
          <Text style={[styles.brand, { color: colors.primary }]}>ALKHAN</Text>
          <View style={styles.branchRow}>
            <Ionicons name="location" size={13} color={colors.textSecondary} />
            <Text style={[styles.branchText, { color: colors.text }]}>{selectedBranch}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
          </View>
        </Pressable>
        <Pressable
          style={[styles.cartIconWrap, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={20} color={colors.text} />
          {cartCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
              <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => `${item.item_name}-${index}`}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={
          <View>
            <Pressable
              style={[styles.searchBar, { backgroundColor: colors.surface }, CardShadow]}
              onPress={() => router.push('/search')}>
              <Ionicons name="search" size={17} color={colors.textSecondary} />
              <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
                Search 150+ dishes
              </Text>
            </Pressable>

            {activeOffers.length > 0 && (
              <View style={styles.offersSection}>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) =>
                    setOffersPageIndex(Math.round(e.nativeEvent.contentOffset.x / 300))
                  }>
                  {activeOffers.map((offer, index) => (
                    <OfferCard key={index} offer={offer} onPress={() => router.push('/offers')} />
                  ))}
                </ScrollView>
                {activeOffers.length > 1 && (
                  <View style={styles.dotsRow}>
                    {activeOffers.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          {
                            width: index === offersPageIndex ? 16 : 6,
                            backgroundColor: index === offersPageIndex ? colors.primary : colors.border,
                          },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesRow}
              contentContainerStyle={styles.categoriesRowContent}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  selected={category === selectedCategory}
                  onPress={() => setSelectedCategory(category)}
                />
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ALL ITEMS</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="fast-food-outline" title="No items found" />}
        renderItem={({ item }) => {
          const rating = itemRatings[item.item_name];
          return (
            <View style={styles.gridItem}>
              <ItemCard
                item={item}
                avgRating={rating?.avg_rating}
                onPress={() =>
                  router.push({
                    pathname: '/item/[itemCode]',
                    params: { itemCode: item.item_name, rate: String(item.rate ?? 0), image: item.item_image ?? '' },
                  })
                }
                onAdd={() =>
                  useCartStore.getState().addItem({
                    itemCode: item.item_name,
                    itemName: item.item_name,
                    rate: Number(item.rate ?? 0),
                  })
                }
              />
            </View>
          );
        }}
      />

      <Modal visible={branchPickerVisible} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setBranchPickerVisible(false)}>
          <View style={[styles.branchSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.branchSheetTitle, { color: colors.text }]}>Select Branch</Text>
            {branches.map((branch) => (
              <Pressable
                key={branch}
                style={styles.branchOption}
                onPress={() => {
                  setSelectedBranch(branch);
                  setBranchPickerVisible(false);
                }}>
                <Ionicons
                  name="storefront-outline"
                  size={18}
                  color={branch === selectedBranch ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={{
                    color: branch === selectedBranch ? colors.primary : colors.text,
                    fontWeight: branch === selectedBranch ? '700' : '400',
                    flex: 1,
                  }}>
                  {branch}
                </Text>
                {branch === selectedBranch && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function OfferCard({ offer, onPress }: { offer: Record<string, any>; onPress: () => void }) {
  const discountLabel =
    offer.discount_type === 'Fixed Amount' ? `Rs. ${offer.discount_value} OFF` : `${offer.discount_value}% OFF`;
  const minOrder = Number(offer.minimum_order_amount ?? 0);

  return (
    <Pressable style={({ pressed }) => [styles.offerCard, pressed && { opacity: 0.92 }]} onPress={onPress}>
      <View style={styles.offerCodeRow}>
        <Ionicons name="pricetag" size={16} color="#D9B872" />
        <Text style={styles.offerCode}>{offer.code}</Text>
      </View>
      <Text style={styles.offerDiscount}>{discountLabel}</Text>
      {minOrder > 0 && <Text style={styles.offerMinOrder}>On orders above Rs. {minOrder.toFixed(0)}</Text>}
      <View style={styles.offerButton}>
        <Text style={styles.offerButtonText}>View Offers</Text>
        <Ionicons name="arrow-forward" size={13} color="#fff" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brand: { fontSize: 15, letterSpacing: 1, fontFamily: Fonts.displayBold },
  branchRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  branchText: { fontSize: 12.5, fontWeight: '600' },
  cartIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#2A2007', fontSize: 9, fontWeight: '800' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: Radius.md,
  },
  searchPlaceholder: { fontSize: 13 },
  offersSection: { marginBottom: 20 },
  offerCard: {
    width: 300,
    marginLeft: 16,
    padding: 20,
    borderRadius: Radius.xl,
    backgroundColor: '#241811',
  },
  offerCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  offerCode: { color: '#D9B872', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  offerDiscount: { color: '#fff', fontSize: 27, fontWeight: '800', fontFamily: Fonts.displayBold },
  offerMinOrder: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 8 },
  offerButton: {
    marginTop: 18,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C9A24A',
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  offerButtonText: { color: '#2A2007', fontWeight: '800', fontSize: 12.5 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { height: 6, borderRadius: 3 },
  categoriesRow: { marginBottom: 18 },
  categoriesRowContent: { paddingHorizontal: 16, gap: 8 },
  sectionTitle: { fontSize: 11, letterSpacing: 1.6, fontWeight: '700', marginHorizontal: 16, marginBottom: 10 },
  gridContent: { paddingHorizontal: 16, paddingBottom: 28 + BottomTabInset },
  gridRow: { gap: 14 },
  gridItem: { flex: 1, marginBottom: 14 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  branchSheet: { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: 20, paddingBottom: 36 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  branchSheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  branchOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
});
