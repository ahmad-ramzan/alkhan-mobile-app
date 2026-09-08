import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { resolveImageUrl } from '@/constants/config';
import { CardShadow, Radius } from '@/constants/layout';
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
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface },
        CardShadow,
        pressed && styles.pressed,
      ]}
      onPress={onPress}>
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
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}>
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
    borderRadius: Radius.lg,
    gap: 6,
  },
  pressed: {
    opacity: 0.85,
  },
  imageBox: {
    aspectRatio: 1.15,
    borderRadius: Radius.md,
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
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  price: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm + 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
