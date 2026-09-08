import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { StarRating } from '@/components/ui/star-rating';
import * as reviewService from '@/services/review-service';
import { useAppTheme } from '@/state/theme-context';

export default function MyReviewsScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    reviewService.listMyReviews().then((list) => {
      setReviews(list);
      setLoading(false);
    });
  }, []);

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
        data={reviews}
        keyExtractor={(item, index) => item.invoice ?? String(index)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
            You haven't written any reviews yet.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={() => router.push({ pathname: '/account/order/[invoice]', params: { invoice: item.invoice } })}>
            <View style={styles.rowBetween}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.invoice}</Text>
              <StarRating rating={Number(item.overall_rating ?? 0)} size={14} />
            </View>
            {!!item.review_text && (
              <Text style={{ color: colors.text, fontSize: 13, marginTop: 8 }}>{item.review_text}</Text>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, gap: 10 },
  card: { padding: 16, borderRadius: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
