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
  'thanh pho thu duc': { lat: 0.0400, lng: 0.0500 },
  'bình thạnh': { lat: 0.0150, lng: 0.0200 },
  'binh thanh': { lat: 0.0150, lng: 0.0200 },
  'quan binh thanh': { lat: 0.0150, lng: 0.0200 },
  'tân bình': { lat: 0.0100, lng: -0.0200 },
  'tan binh': { lat: 0.0100, lng: -0.0200 },
  'tân phú': { lat: 0.0050, lng: -0.0350 },
  'tan phu': { lat: 0.0050, lng: -0.0350 },
  'gò vấp': { lat: 0.0250, lng: 0.0100 },
  'go vap': { lat: 0.0250, lng: 0.0100 },
  'phú nhuận': { lat: 0.0050, lng: -0.0050 },
  'phu nhuan': { lat: 0.0050, lng: -0.0050 },
};

export const geocodeAddress = (address) => {
  if (!address) return null;

  if (typeof address === 'object' && address.coordinates) {
    const { lat, lng } = address.coordinates;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return { lat, lng };
    }
  }

  const normalizedAddress = normalizeAddressObject(address);

  if (!normalizedAddress) {
    return null;
  }

  const { street, ward, district, city } = normalizedAddress;
  
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
function normalizeAddressObject(rawAddress = {}) {
  if (!rawAddress) {
    return null;
  }

  if (typeof rawAddress === 'string') {
    const parts = rawAddress.split(',').map(p => p.trim());
    return {
      street: parts[0] || '',
      ward: parts[1] || '',
      district: parts[2] || '',
      city: parts[3] || 'Hồ Chí Minh',
    };
  }

  const {
    street,
    ward,
    district,
    city,
    province,
    address,
    addressLine,
    label,
  } = rawAddress;

  const primaryStreet = street || address || addressLine || label || '';

  const normalizeForCompare = (value) => {
    if (!value) {
      return '';
    }
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const resolvedCityFromInput = city || province || rawAddress.state || '';
  const resolvedDistrictFromInput = district || rawAddress.county || '';
  const resolvedWardFromInput = ward || rawAddress.subdistrict || '';

  const normalizedStreet = normalizeForCompare(primaryStreet);

  let resolvedDistrict = resolvedDistrictFromInput;
  if (!resolvedDistrict && normalizedStreet) {
    for (const districtName of Object.keys(districtOffsets)) {
      if (normalizedStreet.includes(normalizeForCompare(districtName))) {
        resolvedDistrict = districtName;
        break;
      }
    }
  }

  let resolvedCity = resolvedCityFromInput;
  if (!resolvedCity && normalizedStreet) {
    for (const cityName of Object.keys(vietnamCityCenters)) {
      if (normalizedStreet.includes(normalizeForCompare(cityName))) {
        resolvedCity = cityName;
        break;
      }
    }
  }

  if (!resolvedCity) {
    resolvedCity = 'Hồ Chí Minh';
  }

  const resolvedWard = resolvedWardFromInput || '';

  return {
    street: primaryStreet,
    address: rawAddress.address || rawAddress.addressLine || primaryStreet,
    ward: resolvedWard,
    district: resolvedDistrict,
    city: resolvedCity,
  };
}

export const getRestaurantCoordinates = (restaurant = {}) => {
  const normalizeCoordinateValue = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  };

  const normalizeCoordinates = (coords) => {
    if (!coords) {
      return null;
    }
    const lat = normalizeCoordinateValue(coords.lat ?? coords.latitude);
    const lng = normalizeCoordinateValue(coords.lng ?? coords.lon ?? coords.longitude);
    if (lat == null || lng == null) {
      return null;
    }
    return { lat, lng };
  };

  const directCoords = normalizeCoordinates(restaurant.coordinates);
  if (directCoords) {
    return directCoords;
  }

  const addressCoords = normalizeCoordinates(restaurant.address?.coordinates);
  if (addressCoords) {
    return addressCoords;
  }

  const normalizedAddress = normalizeAddressObject(restaurant.address || restaurant.location);

  if (normalizedAddress) {
    const coords = geocodeAddress(normalizedAddress);
    if (coords) {
      return coords;
    }
  }

  // Default to HCMC center
  return { lat: 10.8231, lng: 106.6297 };
};

export const buildAddressString = (address) => {
  if (!address) {
    return '';
  }

  if (typeof address === 'string') {
    return address;
  }

  const parts = [
    address.street || address.address || address.addressLine || '',
    address.ward || address.subdistrict || '',
    address.district || address.county || '',
    address.city || address.province || address.state || '',
  ].filter((part) => Boolean(part && String(part).trim()));

  if (!parts.length && address.label) {
    parts.push(address.label);
  }

  return parts.join(', ');
};
