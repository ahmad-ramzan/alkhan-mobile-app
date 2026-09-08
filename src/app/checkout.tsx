import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { FloatingShadow, Radius } from '@/constants/layout';
import { Fonts } from '@/constants/theme';
import * as mobileAuthService from '@/services/mobile-auth-service';
import * as selfOrderingService from '@/services/self-ordering-service';
import { cartGrandTotal, useCartStore } from '@/state/cart-store';
import { useAppTheme } from '@/state/theme-context';

export default function CheckoutScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ orderType?: string }>();
  const cartItems = useCartStore((s) => s.items);

  const [loadingContext, setLoadingContext] = useState(true);
  const [capabilities, setCapabilities] = useState<Record<string, any>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Record<string, any>[]>([]);
  const [orderType, setOrderType] = useState(params.orderType === 'Delivery' ? 'Delivery' : 'Takeaway');
  const [selectedAddress, setSelectedAddress] = useState<Record<string, any> | null>(null);
  const [addressPickerVisible, setAddressPickerVisible] = useState(false);
  const [addAddressVisible, setAddAddressVisible] = useState(false);
  const [newAddressLine1, setNewAddressLine1] = useState('');
  const [newAddressCity, setNewAddressCity] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const loadContext = async () => {
    const caps = await selfOrderingService.getCapabilities();
    const loggedIn = await mobileAuthService.isLoggedIn();
    let name: string | null = null;
    let phone: string | null = null;
    let addressList: Record<string, any>[] = [];
    if (loggedIn) {
      try {
        const profile = await mobileAuthService.getProfile();
        name = profile.name ?? null;
        phone = profile.phone ?? null;
        addressList = await mobileAuthService.listAddresses();
      } catch {
        // Keep defaults on failure.
      }
    }
    setCapabilities(caps);
    setIsLoggedIn(loggedIn);
    setCustomerName(name);
    setCustomerPhone(phone);
    setAddresses(addressList);
    if (addressList.length > 0) setSelectedAddress(addressList[0]);
    setLoadingContext(false);
  };

  useEffect(() => {
    loadContext();
  }, []);

  useEffect(() => {
    if (!successRef) return;
    const timer = setTimeout(() => {
      router.dismissAll();
      router.replace('/orders');
    }, 3000);
    return () => clearTimeout(timer);
  }, [successRef]);

  const deliveryEnabled = capabilities.delivery_enabled === true;
  const payAtCounter = capabilities.pay_at_counter_enabled === true;
  const payOnline = capabilities.customer_payment_enabled === true || capabilities.payment_link_enabled === true;
  const grandTotal = cartGrandTotal(cartItems);

  const addNewAddress = async () => {
    if (!newAddressLine1.trim() || !newAddressCity.trim()) return;
    try {
      await mobileAuthService.addAddress({ addressLine1: newAddressLine1.trim(), city: newAddressCity.trim() });
      setAddAddressVisible(false);
      setNewAddressLine1('');
      setNewAddressCity('');
      await loadContext();
    } catch (e) {
      Alert.alert('Could not add address', e instanceof Error ? e.message : String(e));
    }
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) return;
    if (orderType === 'Delivery') {
      if (!isLoggedIn) {
        Alert.alert('Please sign in to use delivery');
        return;
      }
      if (!selectedAddress) {
        Alert.alert('Please select a delivery address');
        return;
      }
    }

    setIsPlacingOrder(true);
    try {
      const itemsPayload = cartItems.map((item) => ({
        item: item.itemCode,
        qty: item.quantity,
        comment: item.comment,
      }));
      const response = await selfOrderingService.addCustomerItems(itemsPayload, {
        orderType: orderType === 'Delivery' ? 'Delivery' : undefined,
        deliveryAddressName: orderType === 'Delivery' ? selectedAddress!.name : undefined,
      });
      setSuccessRef(response.pickup_code ?? response.invoice ?? '');
      useCartStore.getState().clearCart();
    } catch (e) {
      Alert.alert('Could not place order', e instanceof Error ? e.message : String(e));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (successRef !== null) {
    return (
      <View style={[styles.successScreen, { backgroundColor: colors.background }]}>
        <View style={[styles.successIconRing, { borderColor: colors.primary }]}>
          <Ionicons name="checkmark" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.successTitle, { color: colors.text }]}>Order Placed Successfully!</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 13 }}>Reference: {successRef}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4, fontSize: 12 }}>
          {orderType === 'Delivery' ? "We'll deliver to your address." : 'Pay at the counter when you pick up.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="CUSTOMER INFORMATION" />
        {isLoggedIn ? (
          <Card>
            <InfoRow label="Name" value={customerName ?? '—'} />
            <InfoRow label="Phone" value={customerPhone ?? '—'} />
          </Card>
        ) : (
          <Card style={styles.signInCard}>
            <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>
              Sign in to attach your name & phone to this order
            </Text>
            <Pressable onPress={() => router.push('/auth/otp-login')}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign In</Text>
            </Pressable>
          </Card>
        )}

        <SectionHeader title="ORDER TYPE" />
        {['Takeaway', 'Delivery'].map((type) => {
          const enabled = type === 'Takeaway' || deliveryEnabled;
          const selected = orderType === type;
          return (
            <Pressable
              key={type}
              style={styles.radioRow}
              onPress={() => (enabled ? setOrderType(type) : Alert.alert('Delivery is not available right now'))}>
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={enabled ? (selected ? colors.primary : colors.textSecondary) : colors.border}
              />
              <Text style={{ color: enabled ? colors.text : colors.textSecondary, fontSize: 14, marginLeft: 12 }}>
                {type}
              </Text>
            </Pressable>
          );
        })}

        {orderType === 'Delivery' && (
          <>
            <SectionHeader title="DELIVERY ADDRESS" />
            <Pressable onPress={() => (isLoggedIn ? setAddressPickerVisible(true) : router.push('/auth/otp-login'))}>
              <Card style={styles.addressRow}>
                <Ionicons name="location-outline" size={18} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 13, flex: 1 }} numberOfLines={1}>
                  {selectedAddress ? `${selectedAddress.address_line1}, ${selectedAddress.city}` : 'Select Address'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Card>
            </Pressable>
          </>
        )}

        <SectionHeader title="PAYMENT METHOD" />
        {!payAtCounter && !payOnline ? (
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            No payment method is currently configured for this restaurant.
          </Text>
        ) : (
          <>
            {payAtCounter && (
              <PaymentOption label={orderType === 'Delivery' ? 'Cash on Delivery' : 'Cash'} selected />
            )}
            {payOnline && <PaymentOption label="Online Payment" selected={!payAtCounter} />}
          </>
        )}

        <SectionHeader title="ORDER SUMMARY" />
        <Card>
          <SummaryRow label="Subtotal" value={`Rs. ${grandTotal.toFixed(0)}`} />
          <SummaryRow label="Discount" value="Rs. 0" />
          <SummaryRow label="Tax" value="Rs. 0" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SummaryRow label="Total" value={`Rs. ${grandTotal.toFixed(0)}`} isTotal />
        </Card>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 16 },
          FloatingShadow,
        ]}>
        <PrimaryButton label="Place Order" onPress={placeOrder} loading={isPlacingOrder || loadingContext} />
      </View>

      <Modal visible={addressPickerVisible} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setAddressPickerVisible(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Select Address</Text>
            {addresses.length === 0 ? (
              <Text style={{ color: colors.textSecondary, marginVertical: 12 }}>No saved addresses yet.</Text>
            ) : (
              addresses.map((addr) => {
                const selected = selectedAddress?.name === addr.name;
                return (
                  <Pressable
                    key={addr.name}
                    style={styles.radioRow}
                    onPress={() => {
                      setSelectedAddress(addr);
                      setAddressPickerVisible(false);
                    }}>
                    <Ionicons
                      name={selected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={selected ? colors.primary : colors.textSecondary}
                    />
                    <Text style={{ color: colors.text, fontSize: 13, marginLeft: 10 }}>
                      {addr.address_line1}, {addr.city}
                    </Text>
                  </Pressable>
                );
              })
            )}
            <Pressable
              style={styles.addAddressButton}
              onPress={() => {
                setAddressPickerVisible(false);
                setAddAddressVisible(true);
              }}>
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Add new address</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={addAddressVisible} transparent animationType="fade">
        <View style={styles.modalCenterBackdrop}>
          <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Add Delivery Address</Text>
            <TextInput
              value={newAddressLine1}
              onChangeText={setNewAddressLine1}
              placeholder="Address"
              placeholderTextColor={colors.textSecondary}
              style={[styles.textInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
            <TextInput
              value={newAddressCity}
              onChangeText={setNewAddressCity}
              placeholder="City"
              placeholderTextColor={colors.textSecondary}
              style={[styles.textInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
            <View style={styles.dialogActions}>
              <Pressable onPress={() => setAddAddressVisible(false)}>
                <Text style={{ color: colors.textSecondary, marginRight: 20 }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={addNewAddress}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { colors } = useAppTheme();
  return <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{title}</Text>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.infoRow}>
      <Text style={{ width: 60, color: colors.textSecondary, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>{value}</Text>
    </View>
  );
}

function PaymentOption({ label, selected }: { label: string; selected: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.radioRow}>
      <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={20} color={selected ? colors.primary : colors.textSecondary} />
      <Text style={{ color: colors.text, fontSize: 14, marginLeft: 12 }}>{label}</Text>
    </View>
  );
}

function SummaryRow({ label, value, isTotal }: { label: string; value: string; isTotal?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.summaryRow}>
      <Text style={{ color: isTotal ? colors.text : colors.textSecondary, fontSize: isTotal ? 15 : 13, fontWeight: isTotal ? '700' : '400' }}>
        {label}
      </Text>
      <Text style={{ color: isTotal ? colors.primary : colors.text, fontSize: isTotal ? 15 : 13, fontWeight: isTotal ? '700' : '400' }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 24 },
  sectionHeader: { fontSize: 11.5, letterSpacing: 1.2, fontWeight: '700', marginBottom: 10, marginTop: 22 },
  signInCard: { flexDirection: 'row', alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 8 },
  footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successIconRing: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 19, fontWeight: '700', fontFamily: Fonts.displayBold, marginTop: 20, textAlign: 'center' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalCenterBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: 24 },
  sheet: { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: 20, paddingBottom: 36 },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  addAddressButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingVertical: 8 },
  dialog: { width: '100%', borderRadius: Radius.lg, padding: 22 },
  textInput: { borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: 14, paddingVertical: 12, marginTop: 12, fontSize: 13.5 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
});
