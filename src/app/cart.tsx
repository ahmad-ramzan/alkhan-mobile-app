import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/primary-button';
import * as selfOrderingService from '@/services/self-ordering-service';
import { cartGrandTotal, useCartStore, type CartItem } from '@/state/cart-store';
import { useAppTheme } from '@/state/theme-context';

const ORDER_TYPES = ['Takeaway', 'Delivery'];

export default function CartScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
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
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
            Your cart is empty
          </Text>
        }
        renderItem={({ item }) => <CartRow item={item} />}
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
                          backgroundColor: selected ? colors.primary : 'transparent',
                          opacity: disabled ? 0.4 : 1,
                        },
                      ]}>
                      <Text style={{ color: selected ? '#2A2007' : colors.text, fontWeight: '500' }}>{type}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null
        }
      />

      {items.length > 0 && (
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View style={styles.totalRow}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>Rs {grandTotal.toFixed(0)}</Text>
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
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.rowImage, { backgroundColor: colors.imagePlaceholder }]}>
        {item.itemImage ? (
          <Image source={{ uri: item.itemImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
        )}
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowName, { color: colors.text }]}>{item.itemName}</Text>
        {!!item.comment && <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{item.comment}</Text>}
        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Qty {item.quantity}</Text>
      </View>
      <Text style={[styles.rowPrice, { color: colors.text }]}>Rs {(item.rate * item.quantity).toFixed(0)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { padding: 14 },
  row: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  rowImage: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rowContent: { flex: 1, gap: 2 },
  rowName: { fontSize: 13, fontWeight: '600' },
  rowPrice: { fontSize: 13, fontWeight: '700' },
  orderTypeSection: { marginTop: 16 },
  sectionLabel: { fontSize: 10, letterSpacing: 1.2, fontWeight: '700', marginBottom: 8 },
  orderTypeRow: { flexDirection: 'row', gap: 8 },
  orderTypeChip: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  footer: { padding: 14, borderTopWidth: StyleSheet.hairlineWidth, gap: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalValue: { fontSize: 16, fontWeight: '700' },
});
