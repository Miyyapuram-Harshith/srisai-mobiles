export interface PincodeDetails {
  serviceable: boolean;
  estimatedDays: number;
  deliveryCharge: number;
  message: string;
  locationName: string;
}

export const checkPincodeServiceability = (pincode: string, orderTotal: number): PincodeDetails => {
  const cleanPin = pincode.trim();
  
  if (!/^\d{6}$/.test(cleanPin)) {
    return {
      serviceable: false,
      estimatedDays: 0,
      deliveryCharge: 0,
      message: 'Invalid Pincode. Must be exactly 6 digits.',
      locationName: ''
    };
  }

  // Testing unserviceable pincode
  if (cleanPin.startsWith('999')) {
    return {
      serviceable: false,
      estimatedDays: 0,
      deliveryCharge: 0,
      message: 'Sorry, we do not deliver to this location yet.',
      locationName: 'Out of Service Zone'
    };
  }

  // Jagitial Local (Store HQ)
  if (cleanPin === '505327') {
    return {
      serviceable: true,
      estimatedDays: 0, // Same day
      deliveryCharge: 0, // Free
      message: 'Same-day Super Express delivery available! (Free)',
      locationName: 'Jagitial (Store HQ)'
    };
  }

  // Telangana local / surrounding
  if (cleanPin.startsWith('505') || cleanPin.startsWith('506') || cleanPin.startsWith('500')) {
    const isFree = orderTotal >= 30000;
    const location = cleanPin.startsWith('500') ? 'Hyderabad Region' : 'Telangana Region';
    return {
      serviceable: true,
      estimatedDays: 1, // 1-2 Days
      deliveryCharge: isFree ? 0 : 49,
      message: isFree 
        ? 'Express Delivery in 1-2 Days. (Free delivery applied!)' 
        : 'Express Delivery in 1-2 Days. Standard charge ₹49.',
      locationName: location
    };
  }

  // Major Metro Hubs
  const isMetro = 
    cleanPin.startsWith('110') || // Delhi
    cleanPin.startsWith('400') || // Mumbai
    cleanPin.startsWith('560') || // Bengaluru
    cleanPin.startsWith('600') || // Chennai
    cleanPin.startsWith('700');   // Kolkata

  if (isMetro) {
    const isFree = orderTotal >= 50000;
    let city = 'Metro City';
    if (cleanPin.startsWith('110')) city = 'New Delhi';
    if (cleanPin.startsWith('400')) city = 'Mumbai';
    if (cleanPin.startsWith('560')) city = 'Bengaluru';
    if (cleanPin.startsWith('600')) city = 'Chennai';
    if (cleanPin.startsWith('700')) city = 'Kolkata';

    return {
      serviceable: true,
      estimatedDays: 3, // 3-4 Days
      deliveryCharge: isFree ? 0 : 99,
      message: isFree 
        ? `Delivered to ${city} in 3-4 Days. (Free delivery applied!)`
        : `Delivered to ${city} in 3-4 Days. Shipping fee ₹99.`,
      locationName: city
    };
  }

  // Rest of India
  const isFree = orderTotal >= 75000;
  return {
    serviceable: true,
    estimatedDays: 5, // 5-7 Days
    deliveryCharge: isFree ? 0 : 149,
    message: isFree
      ? 'Standard Delivery in 5-7 Days. (Free delivery applied!)'
      : 'Standard Delivery in 5-7 Days. Shipping fee ₹149.',
    locationName: 'Rest of India'
  };
};

export const getEstimatedDateString = (days: number): string => {
  const today = new Date();
  const targetDate = new Date();
  targetDate.setDate(today.getDate() + days);

  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  };
  
  if (days === 0) {
    return 'Today, ' + today.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + ' (By 9:00 PM)';
  }
  
  return targetDate.toLocaleDateString('en-IN', options);
};
