import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useAppTheme } from '@/state/theme-context';

export default function TabsLayout() {
  const { colors } = useAppTheme();

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundSelected}
      tintColor={colors.primary}
      disableTransparentOnScrollEdge>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Menu</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="fork.knife" md="restaurant" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="orders">
        <NativeTabs.Trigger.Label>Orders</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bag" md="receipt_long" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="reserve">
        <NativeTabs.Trigger.Label>Reserve</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="event" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="offers">
        <NativeTabs.Trigger.Label>Offers</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="tag" md="local_offer" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle" md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
