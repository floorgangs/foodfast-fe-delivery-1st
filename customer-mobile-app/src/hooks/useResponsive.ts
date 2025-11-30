import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ResponsiveInfo {
  width: number;
  height: number;
  isLandscape: boolean;
  isPortrait: boolean;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  numColumns: number;
  containerPadding: number;
  cardWidth: number;
}

const getResponsiveInfo = (window: ScaledSize): ResponsiveInfo => {
  const { width, height } = window;
  const isLandscape = width > height;
  const isPortrait = !isLandscape;
  
  // Screen size breakpoints
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;
  const isLargeScreen = width >= 768;

  // Number of columns for grid layouts
  let numColumns = 1;
  if (isLandscape) {
    if (width >= 900) numColumns = 3;
    else if (width >= 600) numColumns = 2;
  } else {
    if (width >= 768) numColumns = 2;
  }

  // Container padding
  const containerPadding = isLandscape ? 24 : 16;

  // Card width calculation
  const horizontalPadding = containerPadding * 2;
  const gap = 12;
  const cardWidth = numColumns > 1 
    ? (width - horizontalPadding - (gap * (numColumns - 1))) / numColumns 
    : width - horizontalPadding;

  return {
    width,
    height,
    isLandscape,
    isPortrait,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    numColumns,
    containerPadding,
    cardWidth,
  };
};

export const useResponsive = (): ResponsiveInfo => {
  const [dimensions, setDimensions] = useState(() => 
    getResponsiveInfo(Dimensions.get('window'))
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(getResponsiveInfo(window));
    });

    return () => subscription.remove();
  }, []);

  return dimensions;
};

export default useResponsive;
