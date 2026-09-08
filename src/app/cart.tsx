import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import { FloatingShadow, Radius } from '@/constants/layout';
import { Fonts } from '@/constants/theme';
import * as selfOrderingService from '@/services/self-ordering-service';
import { cartGrandTotal, useCartStore, type CartItem } from '@/state/cart-store';
import { useAppTheme } from '@/state/theme-context';

const ORDER_TYPES = ['Takeaway', 'Delivery'];

export default function CartScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useCartStore((s) => s.items);
  const [orderType, setOrderType] = useState('Takeaway');
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);

  useEffect(() => {
    selfOrderingService.getCapabilities().then((caps) => setDeliveryEnabled(!!caps.delivery_enabled));
  }, []);

  const grandTotal = cartGrandTotal(items);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.itemCode}-${item.comment}-${index}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState icon="cart-outline" title="Your cart is empty" message="Add some dishes from the menu to get started." />
        }
        renderItem={({ item }) => <CartRow item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListFooterComponent={
          items.length > 0 ? (
            <View style={styles.orderTypeSection}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ORDER TYPE</Text>
              <View style={styles.orderTypeRow}>
                {ORDER_TYPES.map((type) => {
                  const disabled = type === 'Delivery' && !deliveryEnabled;
                  const selected = type === orderType;
                  return (
                    <Pressable
                      key={type}
                      disabled={disabled}
                      onPress={() => setOrderType(type)}
                      style={[
                        styles.orderTypeChip,
                        {
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? colors.primary : colors.surface,
                          opacity: disabled ? 0.4 : 1,
                        },
                      ]}>
                      <Text style={{ color: selected ? '#2A2007' : colors.text, fontWeight: '600', fontSize: 13.5 }}>
                        {type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null
        }
      />

      {items.length > 0 && (
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 16 },
            FloatingShadow,
          ]}>
          <View style={styles.totalRow}>
            <Text style={{ color: colors.textSecondary, fontSize: 12.5 }}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>Rs {grandTotal.toFixed(0)}</Text>
          </View>
          <PrimaryButton
            label="Proceed to Checkout"
            onPress={() => router.push({ pathname: '/checkout', params: { orderType } })}
          />
        </View>
      )}
    </View>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const { colors } = useAppTheme();
  return (
    <Card style={styles.row}>
      <View style={[styles.rowImage, { backgroundColor: colors.imagePlaceholder }]}>
        {item.itemImage ? (
          <Image source={{ uri: item.itemImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
        )}
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowName, { color: colors.text }]}>{item.itemName}</Text>
        {!!item.comment && <Text style={{ color: colors.textSecondary, fontSize: 11.5 }}>{item.comment}</Text>}
        <Text style={{ color: colors.textSecondary, fontSize: 11.5 }}>Qty {item.quantity}</Text>
      </View>
      <Text style={[styles.rowPrice, { color: colors.text }]}>Rs {(item.rate * item.quantity).toFixed(0)}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 8 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12 },
  rowImage: { width: 52, height: 52, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rowContent: { flex: 1, gap: 2 },
  rowName: { fontSize: 13.5, fontWeight: '700' },
  rowPrice: { fontSize: 13.5, fontWeight: '700' },
  orderTypeSection: { marginTop: 20 },
  sectionLabel: { fontSize: 10.5, letterSpacing: 1.2, fontWeight: '700', marginBottom: 10 },
  orderTypeRow: { flexDirection: 'row', gap: 10 },
  orderTypeChip: { flex: 1, paddingVertical: 12, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center' },
  footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth, gap: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalValue: { fontSize: 18, fontWeight: '800', fontFamily: Fonts.displayBold },
});
