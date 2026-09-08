import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/primary-button';
import { StarRating } from '@/components/ui/star-rating';
import * as reviewService from '@/services/review-service';
import { useAppTheme } from '@/state/theme-context';

export default function OrderReviewScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { invoice, items: itemsParam } = useLocalSearchParams<{ invoice: string; items: string }>();

  const items = useMemo<{ item_code: string; item_name?: string }[]>(() => {
    try {
      return JSON.parse(itemsParam ?? '[]');
    } catch {
      return [];
    }
  }, [itemsParam]);

  const [overallRating, setOverallRating] = useState(0);
  const [itemRatings, setItemRatings] = useState<Record<string, number>>(
    () => Object.fromEntries(items.map((item) => [item.item_code, 0]))
  );
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (overallRating === 0) {
      Alert.alert('Please rate your overall experience');
      return;
    }
    setSubmitting(true);
    try {
      const ratedItems = Object.entries(itemRatings)
        .filter(([, rating]) => rating > 0)
        .map(([item_code, rating]) => ({ item_code, rating }));
      await reviewService.submitReview({
        invoice,
        overallRating,
        reviewText: reviewText.trim(),
        itemRatings: ratedItems,
      });
      router.back();
    } catch (e) {
      Alert.alert('Could not submit review', e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>How was your experience?</Text>
      <View style={styles.overallRow}>
        <StarRating rating={overallRating} onChange={setOverallRating} size={34} />
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>RATE YOUR FOOD</Text>
      {items.map((item) => (
        <View key={item.item_code} style={styles.itemRow}>
          <Text style={{ flex: 1, color: colors.text, fontSize: 14 }}>{item.item_name ?? item.item_code}</Text>
          <StarRating
            rating={itemRatings[item.item_code] ?? 0}
            onChange={(rating) => setItemRatings((prev) => ({ ...prev, [item.item_code]: rating }))}
            size={20}
          />
        </View>
      ))}

      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>WRITE A REVIEW</Text>
      <TextInput
        value={reviewText}
        onChangeText={setReviewText}
        multiline
        numberOfLines={4}
        placeholder="Tell us what you liked or what we can improve..."
        placeholderTextColor={colors.textSecondary}
        style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
      />

      <View style={{ marginTop: 24 }}>
        <PrimaryButton label="Submit Review" onPress={submit} loading={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 18, fontWeight: '600' },
  overallRow: { alignItems: 'center', marginVertical: 24 },
  sectionLabel: { fontSize: 12, letterSpacing: 1.2, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  textArea: { borderRadius: 8, padding: 14, fontSize: 14, textAlignVertical: 'top', minHeight: 100 },
});
