export interface Specifications {
  display: string;
  processor: string;
  ram: string;
  storage: string;
  battery: string;
  charging: string;
  camera: string;
  weight: string;
  connectivity: string;
  warranty: string;
}

export type DeviceType = 'brand_new' | 'used' | 'open_box' | 'refurbished' | 'demo_unit';

export interface Device {
  id: string;
  brand: string;
  modelName: string;
  variant: string;
  ram: string;
  storage: string;
  processor: string;
  display: string;
  battery: string;
  charging: string;
  cameras: string;
  weight: string;
  colors: string[];
  warranty: string;
  price: number;
  offerPrice: number;
  stockCount: number;
  description: string;
  specifications: Specifications;
  features: string[];
  images: string[]; // URLs or Base64 strings
  videoUrl?: string;
  status: 'available' | 'out_of_stock' | 'archived';
  views: number;
  sales: number;
  
  // Classification
  deviceType: DeviceType;

  // Brand New Sealed fields
  factorySealed?: boolean;
  officialBrandWarrantyAvailable?: boolean;
  warrantyDuration?: string;
  launchDate?: string;
  invoiceAvailable?: boolean;

  // Used / Pre-Owned fields
  ownershipDetails?: 'first_owner' | 'second_owner' | 'third_owner_plus' | 'unknown';
  usedDuration?: string;
  originalPurchaseDate?: string;
  purchaseBillAvailable?: boolean;
  boxAvailable?: boolean;
  originalChargerAvailable?: boolean;
  originalCableAvailable?: boolean;
  earphonesAvailable?: boolean;
  backCoverAvailable?: boolean;
  screenGuardApplied?: boolean;
  currentWarrantyStatus?: 'under_brand' | 'under_extended' | 'expired' | 'no_warranty';
  warrantyExpiryDate?: string;
  batteryHealth?: number; // 0-100
  deviceConditionGrade?: 'A_plus' | 'A' | 'B_plus' | 'B' | 'C';
  cosmeticConditionDescription?: string;
  displayCondition?: 'perfect' | 'minor_scratches' | 'visible_scratches' | 'replaced';
  frameCondition?: 'excellent' | 'minor_scratches' | 'dents' | 'replaced';
  backPanelCondition?: 'excellent' | 'minor_scratches' | 'cracked' | 'replaced';
  biometricStatus?: 'working' | 'not_working' | 'not_available';
  cameraCondition?: 'perfect' | 'minor_issues' | 'needs_repair';
  speakerCondition?: 'perfect' | 'distorted' | 'needs_repair';
  microphoneCondition?: 'perfect' | 'minor_issue' | 'needs_repair';
  networkLockStatus?: 'factory_unlocked' | 'carrier_locked';
  repairHistory?: 'never' | 'screen' | 'battery' | 'camera' | 'motherboard' | 'multiple';
  repairDescription?: string;
  qualityCheckStatus?: string[];
  sellerNotes?: string;

  // Open Box fields
  openBoxBoxAvailable?: boolean;
  openBoxAccessoriesAvailable?: boolean;
  openBoxWarrantyRemaining?: string;
  openBoxActivationDate?: string;
  openBoxReason?: string;

  // Refurbished fields
  refurbishedGrade?: string;
  refurbishedPartsReplaced?: string;
  refurbishedDate?: string;
  refurbishedBy?: string;
  refurbishedWarrantyOffered?: string;

  // Demo Unit fields
  demoStoreUsageDuration?: string;
  demoUsageHours?: string;
  demoPhysicalCondition?: string;
  demoWarrantyStatus?: string;
  seenOnInstagram?: boolean;
  instagramPostUrl?: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  redirectLink: string;
  startDate: string; // ISO String
  endDate: string; // ISO String
  slideshowTimer: number; // in seconds
  enabled: boolean;
  order: number;
}

export interface FlashSale {
  id: string;
  deviceId: string;
  discountPercentage: number;
  stockLimit: number;
  soldCount: number;
  startTime: string; // ISO String
  endTime: string; // ISO String
  enabled: boolean;
}

export type PermissionRole = 'super_admin' | 'manager' | 'sales_staff' | 'delivery_staff' | 'customer';

export interface AdminUser {
  email: string;
  name: string;
  role: 'super_admin' | 'manager' | 'sales_staff' | 'delivery_staff';
  enabled: boolean;
  dateAdded: string;
}

export interface UserSession {
  email: string;
  role: PermissionRole;
  name?: string;
  mobileNumber?: string;
  loginTime: string;
  deviceInfo: string;
}

export interface LoginHistoryEntry {
  id: string;
  email: string;
  role: string;
  loginTime: string;
  deviceInfo: string;
  status: 'success' | 'failed_otp' | 'rate_limited';
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  alternatePhone?: string; // Alternate Mobile Number
  houseNumber?: string; // House Number / Flat Number
  apartmentName?: string; // Apartment / Building Name
  streetName?: string; // Street Name
  landmark?: string; // Landmark
  areaColony?: string; // Area / Colony
  city: string;
  district?: string; // District
  state: string;
  pincode: string;
  isDefault: boolean;
  
  // Optional PWA location maps and instructions
  googleMapsLink?: string;
  deliveryInstructions?: string;
  preferredTimeSlot?: string;
  addressLine?: string; // kept for backwards compatibility with old seed address
}

export interface CartItem {
  deviceId: string;
  quantity: number;
  selectedColor: string;
}

export interface OrderItem {
  deviceId: string;
  modelName: string;
  brand: string;
  color: string;
  ram: string;
  storage: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'packed' 
  | 'shipped' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned' 
  | 'refund_requested' 
  | 'refunded';

export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  gstAmount: number;
  deliveryFee: number;
  total: number;
  shippingAddress: Address;
  estimatedDeliveryDate: string;
  status: OrderStatus;
  orderDate: string;

  // Delivery configuration
  deliveryType: 'home_delivery' | 'store_pickup';
  isPreorder?: boolean;

  // Store Pickup fields
  pickupDate?: string;
  pickupTime?: string;
  pickupOtp?: string;
  collectedBy?: string;
  collectionTime?: string;

  // Delivery partner logistics
  deliveryPartner?: string;
  deliveryExecutiveName?: string;
  deliveryExecutivePhone?: string;
  trackingNumber?: string;
  actualDeliveryDate?: string;
  codCharges?: number;

  // Payment Tracking
  paymentMethod: 'cod' | 'upi' | 'card' | 'net_banking' | 'emi' | 'store_payment';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  paymentScreenshot?: string; // Base64 or image url
  refundId?: string;

  // Return & Refunds details
  returnReason?: string;
  returnApprovalStatus?: 'pending' | 'approved' | 'rejected';
  returnImages?: string[];
  refundAmount?: number;
  refundMethod?: string;
  refundDate?: string;

  // Detailed event timeline logs
  timeline: {
    status: OrderStatus;
    timestamp: string;
    description: string;
    updatedBy?: string;
  }[];

  // Notes and Call lists
  internalNotes?: string[];
  callLogs?: {
    id: string;
    timestamp: string;
    duration: string;
    staffName: string;
    summary: string;
  }[];

  assignedStaff?: string;
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  date: string;
  time: string;
  ipAddress: string;
}

export interface SystemNotification {
  id: string;
  type: 'low_stock' | 'new_order' | 'sale_ending' | 'banner_expiration' | 'failed_otp';
  message: string;
  timestamp: string;
  read: boolean;
  meta?: {
    deviceId?: string;
    orderId?: string;
    email?: string;
    bannerId?: string;
  };
}

export interface WhatsAppSettings {
  enabled: boolean;
  countryCode: string;
  salesNumber: string;
  supportNumber: string;
  warrantyNumber: string;
  usedPhonesNumber: string;
  enableProductInquiry: boolean;
  enableCartSupport: boolean;
  enableOrderSupport: boolean;
  position: 'bottom-right' | 'bottom-left';
  workingDays: string[]; // e.g. ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  openingTime: string; // "10:00"
  closingTime: string; // "21:00"
  customGreeting?: string;
  productTemplate: string;
  cartTemplate: string;
  orderTemplate: string;
  generalTemplate: string;
  customIcon?: string; // base64
}

export interface WhatsAppAnalytics {
  totalClicks: number;
  productClicks: number;
  cartClicks: number;
  orderClicks: number;
  mostContactedProducts: Record<string, number>; // deviceId -> click count
}

export interface Accessory {
  id: string;
  category: 'cases' | 'chargers' | 'cables' | 'earphones' | 'smart_watches' | 'power_banks';
  brand: string;
  name: string;
  price: number;
  offerPrice: number;
  stockCount: number;
  description: string;
  colors: string[];
  images: string[];
  status: 'available' | 'out_of_stock' | 'archived';
  specifications: Record<string, string>;
  features: string[];
  views: number;
  sales: number;
  createdAt: string;
}

export interface InstagramPost {
  id: string;
  url: string;
  type: 'post' | 'reel' | 'carousel';
  thumbnailUrl: string; // admin-uploaded data URL or external URL
  customTitle?: string;
  customDescription?: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  position: 'top' | 'middle' | 'bottom' | 'offers' | 'featured';
  expiryDate?: string; // ISO Date string (optional)
  views: number;
  clicks: number;
  createdAt: string;
}

export interface InstagramSettings {
  showSection: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  postsCount: number;
  layout: 'grid' | 'carousel';
  autoSlide: boolean;
  autoSlideInterval: number; // in seconds
  showFollowButton: boolean;
  showSectionTitle: boolean;
  followHandle: string;
  followersCount: string;
}

