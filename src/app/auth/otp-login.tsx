import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/primary-button';
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
      <Text style={[styles.title, { color: colors.text }]}>
        {step === 'phone' ? 'Sign in with your phone' : 'Enter the code'}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 24 }}>
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
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
      ) : (
        <TextInput
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="123456"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, styles.otpInput, { color: colors.text, borderColor: colors.border }]}
        />
      )}

      <PrimaryButton
        label={step === 'phone' ? 'Send Code' : 'Verify'}
        onPress={step === 'phone' ? sendOtp : verifyOtp}
        loading={busy}
      />

      {step === 'otp' && (
        <Text style={{ color: colors.primary, textAlign: 'center', marginTop: 16 }} onPress={() => setStep('phone')}>
          Change phone number
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 20 },
  otpInput: { textAlign: 'center', fontSize: 22, letterSpacing: 8 },
});
