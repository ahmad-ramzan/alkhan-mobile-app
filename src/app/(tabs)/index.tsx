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
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ItemCard } from '@/components/item-card';
import { Chip } from '@/components/ui/chip';
import { DEFAULT_PICKUP_TOKEN } from '@/constants/config';
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
        <Text style={{ color: colors.text, paddingHorizontal: 24, textAlign: 'center' }}>
          {errorMessage}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => setBranchPickerVisible(true)}>
          <Text style={[styles.brand, { color: colors.text }]}>ALKHAN</Text>
          <View style={styles.branchRow}>
            <Ionicons name="location" size={14} color={colors.primary} />
            <Text style={[styles.branchText, { color: colors.primary }]}>{selectedBranch}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.primary} />
          </View>
        </Pressable>
        <Pressable style={styles.cartIconWrap} onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={22} color={colors.textSecondary} />
          {cartItemCount(cartItems) > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>
                {cartItemCount(cartItems) > 9 ? '9+' : cartItemCount(cartItems)}
              </Text>
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
              style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/search')}>
              <Ionicons name="search" size={16} color={colors.textSecondary} />
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

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
              {categories.map((category) => (
                <View key={category} style={styles.categoryChip}>
                  <Chip
                    label={category}
                    selected={category === selectedCategory}
                    onPress={() => setSelectedCategory(category)}
                  />
                </View>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ALL ITEMS</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 24 }}>
            No items found
          </Text>
        }
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
                  }}>
                  {branch}
                </Text>
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
    <Pressable style={styles.offerCard} onPress={onPress}>
      <View style={styles.offerCodeRow}>
        <Ionicons name="pricetag" size={16} color="#C9A24A" />
        <Text style={styles.offerCode}>{offer.code}</Text>
      </View>
      <Text style={styles.offerDiscount}>{discountLabel}</Text>
      {minOrder > 0 && <Text style={styles.offerMinOrder}>On orders above Rs. {minOrder.toFixed(0)}</Text>}
      <View style={styles.offerButton}>
        <Text style={styles.offerButtonText}>View Offers</Text>
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
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  brand: { fontSize: 11, letterSpacing: 1.5, fontWeight: '700' },
  branchRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  branchText: { fontSize: 13, fontWeight: '500' },
  cartIconWrap: { padding: 4 },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: { color: '#000', fontSize: 8, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 14,
    marginBottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchPlaceholder: { fontSize: 12 },
  offersSection: { marginBottom: 16 },
  offerCard: {
    width: 300,
    marginLeft: 14,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#251A13',
  },
  offerCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  offerCode: { color: '#C9A24A', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  offerDiscount: { color: '#fff', fontSize: 26, fontWeight: '800' },
  offerMinOrder: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 6 },
  offerButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#BC471B',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  offerButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { height: 6, borderRadius: 3 },
  categoriesRow: { marginHorizontal: 14, marginBottom: 12 },
  categoryChip: { marginRight: 6 },
  sectionTitle: { fontSize: 9, letterSpacing: 1.4, fontWeight: '700', marginHorizontal: 14, marginBottom: 6 },
  gridContent: { paddingHorizontal: 14, paddingBottom: 24 },
  gridRow: { gap: 12 },
  gridItem: { flex: 1, marginBottom: 12 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  branchSheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, paddingBottom: 32 },
  branchSheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  branchOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
});
