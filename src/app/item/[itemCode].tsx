import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/primary-button';
import { resolveImageUrl } from '@/constants/config';
import { CardShadow, FloatingShadow, Radius } from '@/constants/layout';
import { Fonts } from '@/constants/theme';
import * as mobileAuthService from '@/services/mobile-auth-service';
import { useCartStore } from '@/state/cart-store';
import { useAppTheme } from '@/state/theme-context';

const SPICE_LEVELS = ['Mild', 'Medium', 'Hot'];
const PORTIONS = ['Half', 'Full'];

export default function ItemDetailScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    itemCode: string;
    itemName?: string;
    rate?: string;
    image?: string;
    description?: string;
  }>();

  const itemCode = params.itemCode;
  const itemName = params.itemName ?? itemCode;
  const rate = Number(params.rate ?? 0);
  const imageUrl = resolveImageUrl(params.image);

  const [quantity, setQuantity] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState('Medium');
  const [portion, setPortion] = useState('Half');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  useEffect(() => {
    mobileAuthService.getFavoriteItemCodes().then((codes) => setIsFavorite(codes.has(itemCode)));
  }, [itemCode]);

  const toggleFavorite = async () => {
    const loggedIn = await mobileAuthService.isLoggedIn();
    if (!loggedIn) {
      router.push('/auth/otp-login');
      return;
    }
    setFavoriteBusy(true);
    try {
      if (isFavorite) {
        await mobileAuthService.removeFavorite(itemCode);
        setIsFavorite(false);
      } else {
        await mobileAuthService.addFavorite(itemCode);
        setIsFavorite(true);
      }
    } catch {
      // Best-effort — leave state unchanged on failure.
    } finally {
      setFavoriteBusy(false);
    }
  };

  const addToCart = () => {
    useCartStore.getState().addItem({
      itemCode,
      itemName,
      itemImage: imageUrl,
      rate,
      quantity,
      comment: `${spiceLevel} · ${portion}`,
    });
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.imageBox, { backgroundColor: colors.imagePlaceholder }, CardShadow]}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Ionicons name="restaurant-outline" size={48} color={colors.primary} />
          )}
          <Pressable
            style={[styles.favoriteButton, { backgroundColor: colors.surface }, CardShadow]}
            onPress={toggleFavorite}
            disabled={favoriteBusy}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.primary : colors.textSecondary}
            />
          </Pressable>
        </View>

        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.text }]}>{itemName}</Text>
            {!!params.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]}>{params.description}</Text>
            )}
          </View>
          <Text style={[styles.price, { color: colors.primary }]}>Rs {rate.toFixed(0)}</Text>
        </View>

        <SectionLabel title="SPICE LEVEL" />
        <View style={styles.optionsRow}>
          {SPICE_LEVELS.map((level) => (
            <OptionChip key={level} label={level} selected={level === spiceLevel} onPress={() => setSpiceLevel(level)} />
          ))}
        </View>

        <SectionLabel title="PORTION" />
        <View style={styles.optionsRow}>
          {PORTIONS.map((p) => (
            <OptionChip key={p} label={p} selected={p === portion} onPress={() => setPortion(p)} />
          ))}
        </View>

        <SectionLabel title="QUANTITY" />
        <View style={styles.quantityRow}>
          <Pressable
            style={[styles.stepperButton, { borderColor: colors.border }]}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
            <Ionicons name="remove" size={18} color={colors.text} />
          </Pressable>
          <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
          <Pressable
            style={[styles.stepperButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => setQuantity((q) => q + 1)}>
            <Ionicons name="add" size={18} color="#2A2007" />
          </Pressable>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 14 },
          FloatingShadow,
        ]}>
        <PrimaryButton label={`Add · Rs ${(rate * quantity).toFixed(0)}`} onPress={addToCart} />
      </View>
    </View>
  );
}

function SectionLabel({ title }: { title: string }) {
  const { colors } = useAppTheme();
  return <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{title}</Text>;
}

function OptionChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.optionChip,
        { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.surface },
      ]}>
      <Text style={{ color: selected ? '#2A2007' : colors.text, fontSize: 12.5, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  imageBox: {
    height: 230,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  name: { fontSize: 19, fontWeight: '700', fontFamily: Fonts.displayBold },
  description: { fontSize: 12.5, marginTop: 6, lineHeight: 18 },
  price: { fontSize: 17, fontWeight: '800', fontFamily: Fonts.displayBold },
  sectionLabel: { fontSize: 10.5, letterSpacing: 1.2, fontWeight: '700', marginTop: 22, marginBottom: 10 },
  optionsRow: { flexDirection: 'row', gap: 8 },
  optionChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.pill, borderWidth: 1 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: { fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
});
