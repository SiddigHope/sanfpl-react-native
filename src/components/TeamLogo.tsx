import images from '@/assets/teams';
import React from 'react';
import { Image, StyleSheet } from 'react-native';

/**
 * TeamLogo Component
 *
 * Props:
 *  - code (string): 3-letter team code (e.g., 'ARS', 'MCI')
 *  - size (number): default size (width & height)
 *  - width (number): optional width override
 *  - height (number): optional height override
 *
 * Example:
 *  <TeamLogo code="MCI" size={40} />
 *  <TeamLogo code="ARS" width={60} height={70} />
 */

interface TeamLogoProps {
  code?: string;
  size?: number,
  width?: number|string,
  height?: number|string
}

const TeamLogo = ({ code = 'DEFAULT', size = 40, width, height }: TeamLogoProps) => {
  // Get the image source from the map or fallback to default
  const logoSource = images[code] || images.DEFAULT;

  // Determine final dimensions
  const logoWidth = width || size;
  const logoHeight = height || size;

  return (
    <Image
      source={logoSource}
      style={[styles.logo, { width: logoWidth, height: logoHeight }]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    borderRadius: 6,
  },
});

export default TeamLogo;
