import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { resolveImageUrl } from '@/constants/config';
import { CardShadow, Radius } from '@/constants/layout';
import * as mobileAuthService from '@/services/mobile-auth-service';
import { useCartStore } from '@/state/cart-store';
import { useAppTheme } from '@/state/theme-context';

export default function FavoritesScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Record<string, any>[]>([]);

  const load = () => {
    mobileAuthService.listFavorites().then((list) => {
      setFavorites(list);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const removeFavorite = async (itemCode: string) => {
    const previous = favorites;
    setFavorites(favorites.filter((f) => f.item_code !== itemCode));
    try {
      await mobileAuthService.removeFavorite(itemCode);
    } catch {
      setFavorites(previous);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.item_code}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        ListEmptyComponent={
          <EmptyState icon="heart-outline" title="No favorites yet" message="Tap the heart on any dish to save it here." />
        }
        renderItem={({ item }) => {
          const imageUrl = resolveImageUrl(item.image);
          return (
            <View style={styles.gridItem}>
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: colors.surface },
                  CardShadow,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/item/[itemCode]',
                    params: { itemCode: item.item_code, rate: String(item.rate ?? 0), image: item.image ?? '' },
                  })
                }>
                <View style={[styles.imageBox, { backgroundColor: colors.imagePlaceholder }]}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  ) : (
                    <Ionicons name="restaurant-outline" size={32} color={colors.primary} />
                  )}
                  <Pressable
                    style={[styles.heartButton, { backgroundColor: colors.surface }]}
                    onPress={() => removeFavorite(item.item_code)}
                    hitSlop={6}>
                    <Ionicons name="heart" size={16} color={colors.primary} />
                  </Pressable>
                </View>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  {item.item_name}
                </Text>
                <View style={styles.footerRow}>
                  <Text style={[styles.price, { color: colors.text }]}>Rs {Number(item.rate ?? 0).toFixed(0)}</Text>
                  <Pressable
                    onPress={() =>
                      useCartStore.getState().addItem({
                        itemCode: item.item_code,
                        itemName: item.item_name,
                        rate: Number(item.rate ?? 0),
                      })
                    }
                    hitSlop={6}
                    style={[styles.addButton, { backgroundColor: colors.primary }]}>
                    <Ionicons name="add" size={18} color="#2A2007" />
                  </Pressable>
                </View>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gridContent: { padding: 14 },
  gridRow: { gap: 12 },
  gridItem: { flex: 1, marginBottom: 12 },
  card: { flex: 1, padding: 10, borderRadius: Radius.lg, gap: 6 },
  imageBox: {
    aspectRatio: 1.15,
    borderRadius: Radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 13, fontWeight: '600' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 13, fontWeight: '700' },
  addButton: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
});
