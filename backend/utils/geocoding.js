// Helper function to geocode address to coordinates
// Using a simple approximation based on Vietnam major cities
// In production, should use Google Maps Geocoding API or similar

const vietnamCityCenters = {
  'hồ chí minh': { lat: 10.8231, lng: 106.6297 },
  'hà nội': { lat: 21.0285, lng: 105.8542 },
  'đà nẵng': { lat: 16.0544, lng: 108.2022 },
  'hải phòng': { lat: 20.8449, lng: 106.6881 },
  'cần thơ': { lat: 10.0452, lng: 105.7469 },
};

const districtOffsets = {
  'quận 1': { lat: 0.0000, lng: 0.0000 },
  'quận 2': { lat: 0.0200, lng: 0.0300 },
  'quận 3': { lat: 0.0100, lng: -0.0100 },
  'quận 4': { lat: -0.0150, lng: 0.0050 },
  'quận 5': { lat: -0.0100, lng: -0.0200 },
  'quận 6': { lat: -0.0200, lng: -0.0300 },
  'quận 7': { lat: -0.0300, lng: 0.0200 },
  'quận 8': { lat: -0.0250, lng: -0.0150 },
  'quận 9': { lat: 0.0500, lng: 0.0600 },
  'quận 10': { lat: -0.0050, lng: -0.0250 },
  'quận 11': { lat: -0.0100, lng: -0.0350 },
  'quận 12': { lat: 0.0300, lng: -0.0400 },
  'thủ đức': { lat: 0.0400, lng: 0.0500 },
  'bình thạnh': { lat: 0.0150, lng: 0.0200 },
  'tân bình': { lat: 0.0100, lng: -0.0200 },
  'tân phú': { lat: 0.0050, lng: -0.0350 },
  'gò vấp': { lat: 0.0250, lng: 0.0100 },
  'phú nhuận': { lat: 0.0050, lng: -0.0050 },
};

export const geocodeAddress = (address) => {
  if (!address) return null;

  const { street, ward, district, city } = address;
  
  // Normalize strings for comparison
  const normalizeString = (str) => {
    if (!str) return '';
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  const normalizedCity = normalizeString(city);
  const normalizedDistrict = normalizeString(district);

  // Get city center coordinates
  let cityCoords = vietnamCityCenters['hồ chí minh']; // Default to HCMC
  
  for (const [cityName, coords] of Object.entries(vietnamCityCenters)) {
    if (normalizedCity.includes(cityName) || cityName.includes(normalizedCity)) {
      cityCoords = coords;
      break;
    }
  }

  // Apply district offset if available
  let districtOffset = { lat: 0, lng: 0 };
  for (const [districtName, offset] of Object.entries(districtOffsets)) {
    if (normalizedDistrict.includes(districtName)) {
      districtOffset = offset;
      break;
    }
  }

  // Add some randomness based on street name to simulate exact location
  const streetHash = (street || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomLat = ((streetHash % 100) - 50) / 10000; // ±0.005 degrees
  const randomLng = ((streetHash % 150) - 75) / 10000; // ±0.0075 degrees

  return {
    lat: cityCoords.lat + districtOffset.lat + randomLat,
    lng: cityCoords.lng + districtOffset.lng + randomLng,
  };
};

// Get restaurant coordinates from address
export const getRestaurantCoordinates = (restaurant) => {
  if (restaurant.coordinates) {
    return restaurant.coordinates;
  }

  // If restaurant doesn't have coordinates, geocode from address
  if (restaurant.address) {
    // Parse address - assuming format: "street, ward, district, city"
    const parts = restaurant.address.split(',').map(p => p.trim());
    const addressObj = {
      street: parts[0] || '',
      ward: parts[1] || '',
      district: parts[2] || '',
      city: parts[3] || 'Hồ Chí Minh',
    };
    return geocodeAddress(addressObj);
  }

  // Default to HCMC center
  return { lat: 10.8231, lng: 106.6297 };
};
