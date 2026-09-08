import { Text, TextInput } from 'react-native';

import { Fonts } from '@/constants/theme';

/**
 * RN has no built-in way to set an app-wide default font, and hand-adding
 * fontFamily to every Text/TextInput style across ~20 screens isn't
 * practical. Patching defaultProps is the standard workaround — if a future
 * RN version drops support for it, screens just fall back to the system
 * font instead of crashing.
 */
const AnyText = Text as unknown as { defaultProps?: { style?: unknown } };
AnyText.defaultProps = AnyText.defaultProps ?? {};
AnyText.defaultProps.style = [{ fontFamily: Fonts.sans }, AnyText.defaultProps.style];

const AnyTextInput = TextInput as unknown as { defaultProps?: { style?: unknown } };
AnyTextInput.defaultProps = AnyTextInput.defaultProps ?? {};
AnyTextInput.defaultProps.style = [{ fontFamily: Fonts.sans }, AnyTextInput.defaultProps.style];
