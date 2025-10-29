import teams from '@/assets/teams';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import ImageColors from "react-native-image-colors";
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
    code?: string | number;
    size?: number,
    width?: number | string,
    height?: number | string,
    calculateColor?: boolean,
    setColor?: object | any
}

const TeamLogo = ({ code = 'DEFAULT', size = 40, width, height, calculateColor = false, setColor }: TeamLogoProps) => {
    const logoUrl = `https://resources.premierleague.com/premierleague25/badges/${code}.png`

    useEffect(() => {
        const getColors = async () => {
            if (calculateColor) {
                try {
                    const result = await ImageColors.getColors(logoUrl, {
                        fallback: "#222",
                        cache: true,
                        key: logoUrl,
                    });

                    // Works differently on Android & iOS
                    if (result.platform === "android") {
                        setColor(result.vibrant);
                    } else if (result.platform === "ios") {
                        setColor(result.primary);
                    } else {
                        setColor(result.vibrant);
                    }
                } catch (error) {
                    console.warn("Color extraction failed", error);
                }
            }
        };

        getColors();
    }, [logoUrl, calculateColor]);

    // Get the image source from the map or fallback to default
    //   const logoSource = teams[code] || teams.DEFAULT;
    const logoSource = typeof code === 'string' ?
        teams[code] || teams.DEFAULT :
        { uri: logoUrl }

    // Determine final dimensions
    const logoWidth = width || size;
    const logoHeight = height || size;

    return (
        <Image
            source={logoSource}
            style={[styles.logo, { width: logoWidth, height: logoHeight }]}
            contentFit="contain"
        />
    );
};

const styles = StyleSheet.create({
    logo: {
        borderRadius: 6,
    },
});

export default TeamLogo;
