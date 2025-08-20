import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

import { COLORS, FONTS, VARIANTS } from '../constants/theme';

const Text = ({
  children,
  variant = 'body1',
  color = COLORS.textPrimary,
  weight = 'regular',
  align = 'left',
  underline = false,
  lineHeight,
  style,
  ...props
}) => {
  const getTextStyle = () => {
    const baseStyle = [styles.text];

    // Variant styles
    switch (variant) {
      case VARIANTS.text.h1:
        baseStyle.push(styles.h1);
        break;
      case VARIANTS.text.h2:
        baseStyle.push(styles.h2);
        break;
      case VARIANTS.text.h3:
        baseStyle.push(styles.h3);
        break;
      case VARIANTS.text.h4:
        baseStyle.push(styles.h4);
        break;
      case VARIANTS.text.h5:
        baseStyle.push(styles.h5);
        break;
      case VARIANTS.text.h6:
        baseStyle.push(styles.h6);
        break;
      case VARIANTS.text.body1:
        baseStyle.push(styles.body1);
        break;
      case VARIANTS.text.body2:
        baseStyle.push(styles.body2);
        break;
      case VARIANTS.text.caption:
        baseStyle.push(styles.caption);
        break;
      case VARIANTS.text.overline:
        baseStyle.push(styles.overline);
        break;
      default:
        baseStyle.push(styles.body1);
    }

    // Weight styles
    switch (weight) {
      case 'thin':
        baseStyle.push({ fontWeight: FONTS.weightThin });
        break;
      case 'extraLight':
        baseStyle.push({ fontWeight: FONTS.weightExtraLight });
        break;
      case 'light':
        baseStyle.push({ fontWeight: FONTS.weightLight });
        break;
      case 'regular':
        baseStyle.push({ fontWeight: FONTS.weightRegular });
        break;
      case 'medium':
        baseStyle.push({ fontWeight: FONTS.weightMedium });
        break;
      case 'semiBold':
        baseStyle.push({ fontWeight: FONTS.weightSemiBold });
        break;
      case 'bold':
        baseStyle.push({ fontWeight: FONTS.weightBold });
        break;
      case 'extraBold':
        baseStyle.push({ fontWeight: FONTS.weightExtraBold });
        break;
      case 'black':
        baseStyle.push({ fontWeight: FONTS.weightBlack });
        break;
    }

    // Alignment
    baseStyle.push({ textAlign: align });

    // Color
    baseStyle.push({ color });

    // Line height
    if (lineHeight) {
      baseStyle.push({ lineHeight });
    }

    // Underline
    if (underline) {
      baseStyle.push({ textDecorationLine: 'underline' });
    }

    return baseStyle;
  };

  return (
    <RNText style={[...getTextStyle(), style]} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: FONTS.regular,
  },
  h1: {
    fontSize: FONTS.h1,
    lineHeight: FONTS.h1 * FONTS.lineHeightTight,
    fontWeight: FONTS.weightBold,
  },
  h2: {
    fontSize: FONTS.h2,
    lineHeight: FONTS.h2 * FONTS.lineHeightTight,
    fontWeight: FONTS.weightBold,
  },
  h3: {
    fontSize: FONTS.h3,
    lineHeight: FONTS.h3 * FONTS.lineHeightTight,
    fontWeight: FONTS.weightBold,
  },
  h4: {
    fontSize: FONTS.h4,
    lineHeight: FONTS.h4 * FONTS.lineHeightNormal,
    fontWeight: FONTS.weightSemiBold,
  },
  h5: {
    fontSize: FONTS.h5,
    lineHeight: FONTS.h5 * FONTS.lineHeightNormal,
    fontWeight: FONTS.weightSemiBold,
  },
  h6: {
    fontSize: FONTS.h6,
    lineHeight: FONTS.h6 * FONTS.lineHeightNormal,
    fontWeight: FONTS.weightSemiBold,
  },
  body1: {
    fontSize: FONTS.body1,
    lineHeight: FONTS.body1 * FONTS.lineHeightRelaxed,
  },
  body2: {
    fontSize: FONTS.body2,
    lineHeight: FONTS.body2 * FONTS.lineHeightRelaxed,
  },
  caption: {
    fontSize: FONTS.caption,
    lineHeight: FONTS.caption * FONTS.lineHeightNormal,
  },
  overline: {
    fontSize: FONTS.overline,
    lineHeight: FONTS.overline * FONTS.lineHeightNormal,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default Text;
