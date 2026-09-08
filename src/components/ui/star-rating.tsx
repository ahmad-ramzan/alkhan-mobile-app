import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/state/theme-context';

export function StarRating({
  rating,
  onChange,
  size = 20,
}: {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
}) {
  const { colors } = useAppTheme();
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.row}>
      {stars.map((star) => {
        const icon = star <= rating ? 'star' : 'star-outline';
        const content = (
          <Ionicons
            key={star}
            name={icon}
            size={size}
            color={star <= rating ? colors.primary : colors.textSecondary}
          />
        );
        return onChange ? (
          <Pressable key={star} onPress={() => onChange(star)} hitSlop={6}>
            {content}
          </Pressable>
        ) : (
          content
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
});
