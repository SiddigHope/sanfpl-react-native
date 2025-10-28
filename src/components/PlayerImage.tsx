import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native';
/**
 * PlayerImage Component
 *
 * Props:
 *  - image (string): opta_code for player image (e.g., 'p12345', 'p54321')
 *  - size (number): default size (width & height)
 *  - width (number): optional width override
 *  - height (number): optional height override
 *
 * Example:
 *  <PlayerImage image="p54321.png" size={40} />
 *  <PlayerImage image="p12345.png" width={60} height={70} />
 */

interface PlayerImageProps {
  image?: string;
  size?: number,
  width?: number|string,
  height?: number|string
}

const PlayerImage = ({ image, size = 40, width, height }: PlayerImageProps) => {
  // Get the image source from the map or fallback to default

  // Determine final dimensions
  const logoWidth = width || size;
  const logoHeight = height || size;

  return (
    <Image
      source={{
        uri: `https://resources.premierleague.com/premierleague25/photos/players/110x140/${image}.png`,
      }}
      style={[styles.logo, { width: logoWidth, height: logoHeight }]}
      contentFit='contain'
      onError={(e) => console.log("PLAYER IMAGE ERROR:: ", e.error)}
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    borderRadius: 6,
  },
});

export default PlayerImage;
