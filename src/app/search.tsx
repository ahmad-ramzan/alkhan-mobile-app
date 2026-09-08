import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { ItemCard } from '@/components/item-card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { CardShadow, Radius } from '@/constants/layout';
import { useCartStore } from '@/state/cart-store';
import { useMenuData } from '@/state/menu-context';
import { useAppTheme } from '@/state/theme-context';

const PRICE_RANGES = [
  { label: 'Any price', min: 0, max: Infinity },
  { label: 'Under Rs 500', min: 0, max: 500 },
  { label: 'Rs 500–1500', min: 500, max: 1500 },
  { label: 'Rs 1500+', min: 1500, max: Infinity },
];

export default function SearchScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { menuItems, itemRatings } = useMenuData();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);

  const categories = useMemo(() => {
    const real = Array.from(new Set(menuItems.map((i) => String(i.course ?? '')).filter(Boolean))).sort();
    return ['All', ...real];
  }, [menuItems]);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const base = trimmed
      ? menuItems.filter((item) => String(item.item_name).toLowerCase().includes(trimmed))
      : menuItems;
    return base.filter((item) => {
      const matchesCategory = category === 'All' || String(item.course ?? '') === category;
      const rate = Number(item.rate ?? 0);
      const matchesPrice = rate >= priceRange.min && rate < priceRange.max;
      return matchesCategory && matchesPrice;
    });
  }, [menuItems, query, category, priceRange]);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBar, { backgroundColor: colors.surface }, CardShadow]}>
        <Ionicons name="search" size={17} color={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search 150+ dishes"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.text }]}
          autoFocus
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(c) => c}
        style={styles.filterRow}
        contentContainerStyle={styles.filterRowContent}
        renderItem={({ item }) => (
          <Chip label={item} selected={item === category} onPress={() => setCategory(item)} />
        )}
      />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={PRICE_RANGES}
        keyExtractor={(r) => r.label}
        style={styles.filterRow}
        contentContainerStyle={styles.filterRowContent}
        renderItem={({ item }) => (
          <Chip label={item.label} selected={item.label === priceRange.label} onPress={() => setPriceRange(item)} />
        )}
      />

      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.item_name}-${index}`}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        ListEmptyComponent={
          <EmptyState icon="search-outline" title="No dishes found" message="Try a different search or filter." />
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
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 16,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  input: { flex: 1, fontSize: 13.5 },
  filterRow: { marginBottom: 10, maxHeight: 36 },
  filterRowContent: { paddingHorizontal: 14, gap: 6 },
  gridContent: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 24 },
  gridRow: { gap: 12 },
  gridItem: { flex: 1, marginBottom: 12 },
});
