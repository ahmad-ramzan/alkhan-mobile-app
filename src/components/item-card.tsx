import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { resolveImageUrl } from '@/constants/config';
import { useAppTheme } from '@/state/theme-context';

export type MenuItemData = {
  item_name: string;
  course?: string;
  rate?: number;
  item_image?: string | null;
};

export function ItemCard({
  item,
  avgRating,
  onPress,
  onAdd,
}: {
  item: MenuItemData;
  avgRating?: number;
  onPress: () => void;
  onAdd: () => void;
}) {
  const { colors } = useAppTheme();
  const imageUrl = resolveImageUrl(item.item_image);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.imageBox, { backgroundColor: colors.imagePlaceholder }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <Ionicons name="restaurant-outline" size={32} color={colors.primary} />
        )}
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {item.item_name}
      </Text>
      {avgRating != null && (
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={colors.primary} />
          <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{avgRating.toFixed(1)}</Text>
        </View>
      )}
      <View style={styles.footerRow}>
        <Text style={[styles.price, { color: colors.text }]}>Rs {(item.rate ?? 0).toFixed(0)}</Text>
        <Pressable
          onPress={onAdd}
          hitSlop={6}
          style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={18} color="#2A2007" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 10,
    borderRadius: 16,
    gap: 6,
  },
  imageBox: {
    aspectRatio: 1.2,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
