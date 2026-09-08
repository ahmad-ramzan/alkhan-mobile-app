import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StarRating } from '@/components/ui/star-rating';
import { CardShadow, Radius } from '@/constants/layout';
import { Fonts } from '@/constants/theme';
import * as mobileAuthService from '@/services/mobile-auth-service';
import * as reviewService from '@/services/review-service';
import { useAppTheme } from '@/state/theme-context';

const STATUS_COLORS: Record<string, string> = {
  Paid: '#4CAF7D',
  Draft: '#E0A93B',
  Unpaid: '#E0A93B',
  Return: '#E06B6B',
  Overdue: '#E06B6B',
};

const ORDER_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Delivery: 'car-outline',
  'Dine In': 'restaurant-outline',
  'Take Away': 'bag-outline',
};

function formatTime(raw?: string) {
  if (!raw) return '';
  const parts = raw.split(':');
  if (parts.length < 2) return raw;
  const hour = Number(parts[0]) || 0;
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${displayHour}:${parts[1]} ${period}`;
}

function formatAddress(raw: string) {
  return raw
    .split(/<br>\s*/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(', ');
}

export default function OrderDetailScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { invoice } = useLocalSearchParams<{ invoice: string }>();

  const [order, setOrder] = useState<Record<string, any> | null>(null);
  const [review, setReview] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const detail = await mobileAuthService.getOrderDetail(invoice);
      let orderReview: Record<string, any> | null = null;
      if (detail.status === 'Paid') orderReview = await reviewService.getReview(invoice);
      setOrder(detail);
      setReview(orderReview);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [invoice]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>{error}</Text>
      </View>
    );
  }

  const items: any[] = order.items ?? [];
  const payments: any[] = order.payments ?? [];
  const discount = Number(order.discount_amount ?? 0);
  const statusColor = STATUS_COLORS[order.status] ?? colors.textSecondary;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
          <Ionicons name={ORDER_TYPE_ICONS[order.order_type] ?? 'receipt-outline'} size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.orderType, { color: colors.text }]}>{order.order_type ?? 'Order'}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
            {order.table ? `Table ${order.table}` : invoice}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}26` }]}>
          <Text style={{ color: statusColor, fontSize: 11, fontWeight: '700' }}>{order.status}</Text>
        </View>
      </View>
      <View style={styles.timeRow}>
        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 6 }}>
          {order.posting_date} · {formatTime(order.posting_time)}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>ITEMS</Text>
        {items.map((item, index) => (
          <View key={index} style={[styles.itemRow, index === items.length - 1 && { marginBottom: 0 }]}>
            <View style={[styles.qtyBox, { backgroundColor: colors.background }]}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>{item.qty}</Text>
            </View>
            <Text style={{ flex: 1, color: colors.text, fontSize: 13.5, marginLeft: 12 }}>{item.item_name}</Text>
            <Text style={{ color: colors.text, fontSize: 13.5, fontWeight: '500' }}>Rs {item.amount}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <TotalRow label="Subtotal" value={order.net_total} />
        {discount > 0 && <TotalRow label="Discount" value={-discount} />}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <TotalRow label="Total" value={order.grand_total} isBold />
        {payments.length > 0 && (
          <View style={styles.paymentRow}>
            <Ionicons name="card-outline" size={14} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 6 }}>
              Paid via {payments[0].mode_of_payment}
            </Text>
          </View>
        )}
      </View>

      {!!order.shipping_address?.trim() && (
        <View style={[styles.card, styles.addressCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>DELIVERED TO</Text>
            <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>
              {formatAddress(order.shipping_address)}
            </Text>
          </View>
        </View>
      )}

      {order.status === 'Paid' && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {review ? (
            <View>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>YOUR REVIEW</Text>
              <View style={{ marginTop: 10 }}>
                <StarRating rating={Number(review.overall_rating ?? 0)} size={18} />
              </View>
              {!!review.review_text && (
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8 }}>{review.review_text}</Text>
              )}
            </View>
          ) : (
            <View style={styles.reviewPrompt}>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '500', flex: 1 }}>
                How was your experience?
              </Text>
              <PrimaryButtonSmall
                onPress={() =>
                  router.push({
                    pathname: '/account/order/[invoice]/review',
                    params: { invoice, items: JSON.stringify(items) },
                  })
                }
              />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function TotalRow({ label, value, isBold }: { label: string; value: number; isBold?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.totalRow}>
      <Text style={{ color: isBold ? colors.text : colors.textSecondary, fontSize: isBold ? 14.5 : 13, fontWeight: isBold ? '700' : '400' }}>
        {label}
      </Text>
      <Text style={{ color: isBold ? colors.primary : colors.textSecondary, fontSize: isBold ? 16 : 13, fontWeight: isBold ? '700' : '400' }}>
        Rs {value ?? 0}
      </Text>
    </View>
  );
}

function PrimaryButtonSmall({ onPress }: { onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable style={[styles.rateButton, { backgroundColor: colors.primary }]} onPress={onPress}>
      <Text style={{ color: '#2A2007', fontWeight: '700', fontSize: 12 }}>Rate & Review</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  orderType: { fontSize: 16, fontWeight: '700', fontFamily: Fonts.displayBold },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  card: { padding: 18, borderRadius: Radius.lg, marginTop: 16, ...CardShadow },
  cardLabel: { fontSize: 11, letterSpacing: 1.2, fontWeight: '700' },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 14 },
  qtyBox: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  addressCard: { flexDirection: 'row', gap: 12 },
  reviewPrompt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rateButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
});
