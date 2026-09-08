import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/empty-state';
import { CardShadow, Radius } from '@/constants/layout';
import { BottomTabInset, Fonts } from '@/constants/theme';
import * as selfOrderingService from '@/services/self-ordering-service';
import { useAppTheme } from '@/state/theme-context';

function formatTime(isoTimestamp?: string) {
  if (!isoTimestamp) return '';
  try {
    const dt = new Date(isoTimestamp);
    const hour = dt.getHours() % 12 === 0 ? 12 : dt.getHours() % 12;
    const minute = String(dt.getMinutes()).padStart(2, '0');
    const period = dt.getHours() >= 12 ? 'PM' : 'AM';
    return `${hour}:${minute} ${period}`;
  } catch {
    return '';
  }
}

export default function OrderTrackingScreen() {
  const { colors } = useAppTheme();
  const [status, setStatus] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const result = await selfOrderingService.getOrderStatus();
      setStatus(result);
      setError(null);
    } catch {
      if (!silent) setError('Could not load order status.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    pollRef.current = setInterval(() => load(true), 10000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [load]);

  const hasActiveOrder = !!status && status.invoice != null && status.billed !== true;
  const stages: any[] = status?.stages ?? [];

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!hasActiveOrder) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="receipt-outline"
          title="No active order"
          message="Place an order to see live status here."
        />
      </SafeAreaView>
    );
  }

  const currentStage = stages.find((s) => s.current === true) ?? { label: 'Order Placed' };
  const orderType = status!.order_type ?? (status!.table ? 'Dine In' : 'Take Away');
  const subtitle = status!.table ? `${orderType} · Table ${status!.table}` : orderType;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primary}
          />
        }>
        <View style={[styles.headerCard, { backgroundColor: colors.surface }, CardShadow]}>
          <Text style={[styles.headline, { color: colors.text }]}>{currentStage.label}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }}>{subtitle}</Text>
          {status!.order_placed_at && (
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
              Placed at {formatTime(status!.order_placed_at)}
            </Text>
          )}
          {status!.order_rejected === true && status!.rejection_reason && (
            <Text style={{ color: '#E06B6B', fontSize: 13, marginTop: 10 }}>{status!.rejection_reason}</Text>
          )}
        </View>

        <View style={styles.timeline}>
          {stages.map((stage, index) => {
            const isDone = stage.done === true;
            const isCurrent = stage.current === true;
            const isLast = index === stages.length - 1;
            return (
              <View key={index} style={styles.timelineRow}>
                <View style={styles.markerColumn}>
                  <StageMarker isDone={isDone} isCurrent={isCurrent} />
                  {!isLast && (
                    <View style={[styles.connector, { backgroundColor: isDone ? colors.primary : colors.border }]} />
                  )}
                </View>
                <Text
                  style={[
                    styles.stageLabel,
                    {
                      color: isDone || isCurrent ? colors.text : colors.textSecondary,
                      fontWeight: isCurrent ? '700' : isDone ? '500' : '400',
                    },
                  ]}>
                  {stage.label ?? ''}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StageMarker({ isDone, isCurrent }: { isDone: boolean; isCurrent: boolean }) {
  const { colors } = useAppTheme();
  if (isCurrent) return <View style={[styles.dotMarker, { backgroundColor: colors.primary }]} />;
  if (isDone) return <Ionicons name="checkmark-circle" size={16} color={colors.primary} />;
  return <View style={[styles.dotMarker, styles.dotMarkerEmpty, { borderColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 20 + BottomTabInset },
  headerCard: { padding: 20, borderRadius: Radius.lg },
  headline: { fontSize: 22, fontWeight: '700', fontFamily: Fonts.displayBold },
  timeline: { marginTop: 28 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  markerColumn: { alignItems: 'center', width: 16 },
  dotMarker: { width: 14, height: 14, borderRadius: 7 },
  dotMarkerEmpty: { backgroundColor: 'transparent', borderWidth: 2 },
  connector: { width: 2, flex: 1, minHeight: 24 },
  stageLabel: { flex: 1, fontSize: 15, paddingBottom: 28 },
});
