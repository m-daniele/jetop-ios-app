  // This function takes a location object or string and returns a formatted address.
  export const getDisplayAddress = (location: any): string => {
    if (!location) return 'TBA';
    
    try {
      const locationData = typeof location === 'string' 
        ? JSON.parse(location) 
        : location;
      
      if (locationData.address) {
        return locationData.address;
      } else if (locationData.latitude && locationData.longitude) {
        return `${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`;
      }
    } catch (error) {
      // If parsing fails, return the location as is
      if (typeof location === 'string') {
        return location;
      }
    }
    
    return 'Location set';
  };