import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/primary-button';
import { Radius } from '@/constants/layout';
import { Fonts } from '@/constants/theme';
import * as mobileAuthService from '@/services/mobile-auth-service';
import { useAuth } from '@/state/auth-context';
import { useAppTheme } from '@/state/theme-context';

export default function OtpLoginScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { refresh } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+92');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    if (phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Enter a valid phone number');
      return;
    }
    setBusy(true);
    try {
      await mobileAuthService.requestOtp(phone);
      setStep('otp');
    } catch (e) {
      Alert.alert('Could not send OTP', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Enter the 6-digit code');
      return;
    }
    setBusy(true);
    try {
      const success = await mobileAuthService.verifyOtp(phone, otp);
      if (success) {
        await refresh();
        router.back();
      } else {
        Alert.alert('Incorrect OTP', 'Please check the code and try again.');
      }
    } catch (e) {
      Alert.alert('Could not verify OTP', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
        <Ionicons name={step === 'phone' ? 'call-outline' : 'shield-checkmark-outline'} size={26} color={colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {step === 'phone' ? 'Sign in with your phone' : 'Enter the code'}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13.5, marginBottom: 28, lineHeight: 19 }}>
        {step === 'phone'
          ? "We'll text you a 6-digit verification code."
          : `Enter the 6-digit code sent to ${phone}.`}
      </Text>

      {step === 'phone' ? (
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+923001234567"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        />
      ) : (
        <TextInput
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="123456"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            styles.otpInput,
            { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        />
      )}

      <PrimaryButton
        label={step === 'phone' ? 'Send Code' : 'Verify'}
        onPress={step === 'phone' ? sendOtp : verifyOtp}
        loading={busy}
      />

      {step === 'otp' && (
        <Pressable onPress={() => setStep('phone')} style={styles.changeNumber}>
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>Change phone number</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 48 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 21, fontWeight: '700', fontFamily: Fonts.displayBold, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    marginBottom: 22,
  },
  otpInput: { textAlign: 'center', fontSize: 24, letterSpacing: 10, fontWeight: '700' },
  changeNumber: { alignSelf: 'center', marginTop: 18, padding: 6 },
});
