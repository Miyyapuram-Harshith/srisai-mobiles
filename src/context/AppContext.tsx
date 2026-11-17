import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Device, Banner, FlashSale, AdminUser, UserSession, 
  Address, CartItem, Order, SystemNotification, OrderItem,
  OrderStatus, PermissionRole, AuditLog, WhatsAppSettings, WhatsAppAnalytics,
  InstagramPost, Accessory, InstagramSettings
} from '../types';
import { INITIAL_DEVICES, INITIAL_BANNERS, INITIAL_FLASH_SALES, INITIAL_ADMINS, INITIAL_ORDERS, INITIAL_ACCESSORIES } from '../utils/seedData';
import { checkPincodeServiceability, getEstimatedDateString } from '../utils/pincodeService';
import { api } from '../lib/api-client';
import { 
  mapDbProductToDevice, 
  mapDeviceToDbProduct, 
  mapDbBannerToBanner, 
  mapBannerToDbBanner, 
  mapDbOrderToOrder, 
  mapOrderToDbOrder,
  mapDbAccessoryToAccessory,
  mapAccessoryToDbAccessory,
  mapDbFlashSaleToFlashSale,
  mapFlashSaleToDbFlashSale
} from '../lib/mappers';

interface AppContextType {
  dbLoading: boolean;
  dbError: string | null;
  retryDbConnection: () => void;
  bypassDbConnection: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUser: UserSession | null;
  setCurrentUser: (user: UserSession | null) => void;
  devices: Device[];
  banners: Banner[];
  flashSales: FlashSale[];
  admins: AdminUser[];
  addresses: Address[];
  selectedAddress: Address | null;
  setSelectedAddress: (addr: Address | null) => void;
  cart: CartItem[];
  wishlist: string[];
  comparisonList: string[];
  orders: Order[];
  notifications: SystemNotification[];
  searchHistory: string[];
  recentlyViewed: string[];
  currentRoute: string; // Hash routing: e.g., 'home', 'product/apple-iphone-15-pro-max', 'admin', etc.
  
  // Navigation
  navigateTo: (route: string) => void;
  
  // Shop operations
  addToCart: (deviceId: string, color: string) => void;
  updateCartQty: (deviceId: string, color: string, qty: number) => void;
  removeFromCart: (deviceId: string, color: string) => void;
  clearCart: () => void;
  toggleWishlist: (deviceId: string) => void;
  addToCompare: (deviceId: string) => boolean;
  removeFromCompare: (deviceId: string) => void;
  addAddress: (addr: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  addSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;
  addRecentlyViewed: (deviceId: string) => void;
  createOrder: (
    address: Address, 
    couponCode: string,
    deliveryType: 'home_delivery' | 'store_pickup',
    paymentMethod: Order['paymentMethod'],
    isPreorder?: boolean,
    pickupDate?: string,
    pickupTime?: string
  ) => Order | null;
  
  // ERP operations
  updateOrderStatus: (orderId: string, status: OrderStatus, updatedBy?: string) => void;
  updateOrderDelivery: (orderId: string, deliveryDetails: Partial<Order>) => void;
  updateOrderPayment: (orderId: string, paymentDetails: Partial<Order>) => void;
  addOrderNote: (orderId: string, note: string) => void;
  issueRefund: (orderId: string, refundDetails: { amount: number; method: string; reason?: string }) => void;
  addCallLog: (orderId: string, call: { duration: string; staffName: string; summary: string }) => void;
  
  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: string, adminName: string) => void;
  clearAuditLogs: () => void;

  // Permissions switch
  adminRole: PermissionRole;
  setAdminRole: (role: PermissionRole) => void;

  // WhatsApp Support Settings & Analytics
  whatsAppSettings: WhatsAppSettings;
  setWhatsAppSettings: (settings: WhatsAppSettings) => void;
  whatsAppAnalytics: WhatsAppAnalytics;
  trackWhatsAppClick: (category: 'product' | 'cart' | 'order' | 'general', deviceId?: string) => void;
  clearWhatsAppAnalytics: () => void;

  // Instagram Posts
  instagramPosts: InstagramPost[];
  addInstagramPost: (post: Omit<InstagramPost, 'id' | 'createdAt' | 'views' | 'clicks'>) => void;
  updateInstagramPost: (id: string, updates: Partial<InstagramPost>) => void;
  deleteInstagramPost: (id: string) => void;
  reorderInstagramPosts: (posts: InstagramPost[]) => void;
  instagramSettings: InstagramSettings;
  updateInstagramSettings: (settings: Partial<InstagramSettings>) => void;
  trackInstagramPostView: (id: string) => void;
  trackInstagramPostClick: (id: string) => void;
  
  // Accessories state & management
  accessories: Accessory[];
  incrementAccessoryViews: (id: string) => void;
  incrementAccessorySales: (id: string, quantity: number) => void;
  
  // Admin operations
  addAdminEmail: (email: string, name: string) => boolean;
  removeAdminEmail: (email: string) => void;
  toggleAdminState: (email: string) => void;
  saveDevice: (device: Omit<Device, 'id' | 'views' | 'sales'> & { id?: string }) => Promise<void>;
  duplicateDevice: (id: string) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  archiveDevice: (id: string) => Promise<void>;
  saveBanner: (banner: Omit<Banner, 'id'> & { id?: string }) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  reorderBanners: (list: Banner[]) => Promise<void>;
  saveFlashSale: (sale: Omit<FlashSale, 'id' | 'soldCount'> & { id?: string }) => Promise<void>;
  deleteFlashSale: (id: string) => Promise<void>;
  saveAccessory: (accessory: Omit<Accessory, 'id' | 'views' | 'sales' | 'createdAt'> & { id?: string }) => Promise<void>;
  deleteAccessory: (id: string) => Promise<void>;
  
  // Toast notifications
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  
  // Unsaved changes registry
  unsavedModules: Record<string, boolean>;
  registerUnsavedChanges: (moduleName: string, hasChanges: boolean) => void;
  hasAnyUnsavedChanges: boolean;
  
  // Physical store settings
  storeSettings: { storeName: string; storeAddress: string; storePhone: string; whatsappNumber: string; defaultGreeting: string };
  saveAllSettings: (store: { storeName: string; storeAddress: string; storePhone: string; whatsappNumber: string; defaultGreeting: string }, whatsapp: WhatsAppSettings, instagram: InstagramSettings) => Promise<void>;
  
  // Instagram posts save
  saveInstagramPostsList: (postsList: InstagramPost[]) => Promise<void>;
  
  // Refetches
  refetchProducts: () => Promise<void>;
  refetchBanners: () => Promise<void>;
  refetchAccessories: () => Promise<void>;
  refetchFlashSales: () => Promise<void>;
  refetchOrders: () => Promise<void>;
  refetchSettings: () => Promise<void>;
  refetchInstagram: () => Promise<void>;
  refetchAdmins: () => Promise<void>;

  // Notifications
  addNotification: (type: SystemNotification['type'], message: string, meta?: SystemNotification['meta']) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Helper to count views
  incrementDeviceViews: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

async function fetchWithTimeout(promise: Promise<any>, timeoutMs = 4000): Promise<any> {
  return Promise.race([
    promise,
    new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Connection timed out after 4 seconds')), timeoutMs))
  ]);
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Database loading & error states
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  // Unsaved changes registry state
  const [unsavedModules, setUnsavedModules] = useState<Record<string, boolean>>({});

  // Physical store settings state
  const [storeSettings, setStoreSettingsState] = useState<{ storeName: string; storeAddress: string; storePhone: string; whatsappNumber: string; defaultGreeting: string }>({
    storeName: 'Sri Sai Mobiles',
    storeAddress: 'Opposite Big C, Angadi Bazar, Jagtial, Telangana - 505327',
    storePhone: '+91 8688303048',
    whatsappNumber: '8688303048',
    defaultGreeting: 'Welcome to Sri Sai Mobiles Jagtial! How can we assist you today?'
  });

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = sessionStorage.getItem('srisai_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // Navigation route (hash based)
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.substring(1);
    return hash || 'home';
  });

  // Core databases
  const [currentUser, setCurrentUserState] = useState<UserSession | null>(() => {
    const saved = sessionStorage.getItem('srisai_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [devices, setDevices] = useState<Device[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>(INITIAL_FLASH_SALES);
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  // Resolved database UUID for the current user (looked up by email)
  const [userDbId, setUserDbId] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [comparisonList, setComparisonList] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('srisai_compare');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = sessionStorage.getItem('srisai_audit_logs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'audit-1',
        adminName: 'SriSai Super Admin',
        action: 'System Initialized & Configured Seed Catalog',
        date: new Date().toLocaleDateString('en-IN'),
        time: '10:00 AM',
        ipAddress: '192.168.1.1'
      }
    ];
  });

  const [adminRole, setAdminRole] = useState<PermissionRole>(() => {
    const savedSession = sessionStorage.getItem('srisai_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.role && parsed.role !== 'customer') {
          return parsed.role;
        }
      } catch (e) {}
    }
    const saved = sessionStorage.getItem('srisai_admin_role');
    return (saved as PermissionRole) || 'super_admin';
  });

  const [whatsAppSettings, setWhatsAppSettings] = useState<WhatsAppSettings>(() => {
    const saved = sessionStorage.getItem('srisai_whatsapp_settings');
    if (saved) return JSON.parse(saved);
    return {
      enabled: true,
      countryCode: '91',
      salesNumber: '8688303048',
      supportNumber: '8688303048',
      warrantyNumber: '8688303048',
      usedPhonesNumber: '8688303048',
      enableProductInquiry: true,
      enableCartSupport: true,
      enableOrderSupport: true,
      position: 'bottom-right',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      openingTime: '10:00',
      closingTime: '21:00',
      productTemplate: "Hello Sri Sai Mobiles,\nI am interested in:\n\nProduct: {product_name}\nStorage Variant: {variant}\nPrice: ₹{price}\n\nCan you provide availability details?",
      cartTemplate: "Hello Sri Sai Mobiles,\nI would like assistance with my cart items.",
      orderTemplate: "Hello Sri Sai Mobiles,\nI need help regarding my order.\n\nOrder ID: {order_id}\nPhone Number: {phone}",
      generalTemplate: "Hello Sri Sai Mobiles,\nI need assistance regarding your devices."
    };
  });

  const [whatsAppAnalytics, setWhatsAppAnalytics] = useState<WhatsAppAnalytics>(() => {
    const saved = sessionStorage.getItem('srisai_whatsapp_analytics');
    if (saved) return JSON.parse(saved);
    return {
      totalClicks: 0,
      productClicks: 0,
      cartClicks: 0,
      orderClicks: 0,
      mostContactedProducts: {}
    };
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = sessionStorage.getItem('srisai_notifications');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'notif-1',
        type: 'low_stock',
        message: 'Product "Nothing Phone (2)" is running low on stock! Only 2 units remaining.',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        read: false,
        meta: { deviceId: 'nothing-phone-2' }
      }
    ];
  });

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('srisai_search_history');
    return saved ? JSON.parse(saved) : ['iPhone', 'Galaxy Ultra', 'OnePlus 12'];
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('srisai_recently_viewed');
    return saved ? JSON.parse(saved) : [];
  });

  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>(INITIAL_ACCESSORIES);

  const [instagramSettings, setInstagramSettings] = useState<InstagramSettings>(() => {
    const saved = sessionStorage.getItem('srisai_instagram_settings');
    return saved ? JSON.parse(saved) : {
      showSection: true,
      sectionTitle: '📸 Latest From Instagram',
      sectionSubtitle: 'Join 40,000+ followers and stay updated with our latest arrivals and offers.',
      postsCount: 6,
      layout: 'grid',
      autoSlide: false,
      autoSlideInterval: 5,
      showFollowButton: true,
      showSectionTitle: true,
      followHandle: '@sri_sai_mobiles3048',
      followersCount: '40K+'
    };
  });

  // Listen to hash router changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      setCurrentRoute(hash || 'home');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  // Show Toast Alert Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(-4);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Unsaved registry registration
  const registerUnsavedChanges = (moduleName: string, hasChanges: boolean) => {
    setUnsavedModules(prev => {
      if (prev[moduleName] === hasChanges) return prev;
      return { ...prev, [moduleName]: hasChanges };
    });
  };

  const hasAnyUnsavedChanges = Object.values(unsavedModules).some(Boolean);

  // Individual Table Fetchers / Refetchers
  const refetchProducts = async () => {
    const products = await api.get<unknown[]>('/api/products');
    setDevices(products.map(mapDbProductToDevice));
  };

  const refetchBanners = async () => {
    const data = await api.get<any[]>('/api/banners');
    setBanners((data || []).map(mapDbBannerToBanner).sort((a, b) => a.priority - b.priority));
  };

  const refetchOrders = async () => {
    const data = await api.get<any[]>('/api/orders');
    setOrders((data || []).map(mapDbOrderToOrder).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
  };

  const refetchAdmins = async () => {
    const data = await api.get<any[]>('/api/users?role=admin_staff');
    const fetched = (data || [])
      .map((u: any) => ({
        email: u.email,
        name: u.name || 'Administrator',
        role: u.role === 'disabled_admin' ? 'admin' : (u.role === 'disabled_manager' ? 'manager' : u.role),
        enabled: u.enabled ?? (u.role !== 'disabled_admin' && u.role !== 'disabled_manager'),
        dateAdded: u.created_at || new Date().toISOString()
      }));
    setAdmins(fetched.length > 0 ? fetched : INITIAL_ADMINS);
  };

  const refetchFlashSales = async () => {
    const data = await api.get<any[]>('/api/flash-sales');
    setFlashSales((data || []).map(mapDbFlashSaleToFlashSale));
  };

  const refetchAccessories = async () => {
    const data = await api.get<any[]>('/api/accessories');
    setAccessories((data || []).map(mapDbAccessoryToAccessory));
  };

  const refetchSettings = async () => {
    const storeInfo = await api.get<any>('/api/settings');
    setStoreSettingsState({
      storeName: storeInfo.store_name,
      storeAddress: storeInfo.store_address,
      storePhone: storeInfo.store_phone,
      whatsappNumber: storeInfo.whatsapp_number,
      defaultGreeting: storeInfo.default_greeting,
    });

    if (storeInfo.whatsapp_settings) {
      setWhatsAppSettings(storeInfo.whatsapp_settings);
    }
    if (storeInfo.instagram_settings) {
      setInstagramSettings(storeInfo.instagram_settings);
    }
  };

  const refetchInstagram = async () => {
    try {
      const data = await api.get<any[]>('/api/instagram-posts');
      const mapped = (data || []).map((d: any) => ({
        id: d.id,
        url: d.url,
        type: d.type,
        thumbnailUrl: d.thumbnail_url,
        customTitle: d.custom_title,
        customDescription: d.custom_description,
        displayOrder: d.display_order,
        isFeatured: d.is_featured,
        isActive: d.is_active,
        position: d.position,
        expiryDate: d.expiry_date,
        views: d.views,
        clicks: d.clicks,
        createdAt: d.created_at
      })).sort((a: any, b: any) => a.displayOrder - b.displayOrder);
      setInstagramPosts(mapped);
      sessionStorage.setItem('srisai_instagram_posts', JSON.stringify(mapped));
    } catch (err) {
      console.warn("instagram_posts query failed. Falling back to local state.", err);
      const saved = sessionStorage.getItem('srisai_instagram_posts');
      if (saved) setInstagramPosts(JSON.parse(saved));
    }
  };

  // 1. Load DB on mount
  const loadInitialData = async () => {
    try {
      setDbLoading(true);
      setDbError(null);

      // Execute refetches in parallel
      await Promise.all([
        refetchProducts(),
        refetchBanners(),
        refetchOrders(),
        refetchAdmins(),
        refetchFlashSales(),
        refetchAccessories(),
        refetchSettings(),
        refetchInstagram()
      ]);

    } catch (err: any) {
      console.error('Error fetching API data:', err);
      setDbError(err.message || 'Failed to connect to API');
      if (devices.length === 0) setDevices(INITIAL_DEVICES);
      if (banners.length === 0) setBanners(INITIAL_BANNERS);
    } finally {
      setDbLoading(false);
    }
  };

  const retryDbConnection = () => {
    loadInitialData();
  };

  const bypassDbConnection = () => {
    setDbError(null);
    setDbLoading(false);
    if (devices.length === 0) setDevices(INITIAL_DEVICES);
    if (banners.length === 0) setBanners(INITIAL_BANNERS);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Prevent accidental browser reloads when unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasAnyUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes in the admin panel. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasAnyUnsavedChanges]);

  // 3. User Profile Loading (when logged in)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) {
        setUserDbId(null);
        setCart([]);
        setWishlist([]);
        setAddresses([]);
        return;
      }
      try {
        const users = await api.get<any[]>(`/api/users?email=${encodeURIComponent(currentUser.email.toLowerCase())}`);
        let uid: string;
        if (!users || users.length === 0) {
          const inserted = await api.post<any>('/api/users', {
            email: currentUser.email.toLowerCase(),
            role: currentUser.role,
            name: currentUser.name || ''
          });
          uid = inserted.id;
        } else {
          uid = users[0].id;
        }

        setUserDbId(uid);

        // Load cart from cart_items table
        const cartRows = await api.get<any[]>(`/api/cart?user_id=${encodeURIComponent(uid)}`);
        if (cartRows && cartRows.length > 0) {
          setCart(cartRows.map((r: any) => ({ deviceId: r.item_id, quantity: r.quantity, selectedColor: r.selected_color })));
        } else {
          setCart([]);
        }

        // Load wishlist from wishlist table
        const wishRows = await api.get<string[]>(`/api/wishlist?user_id=${encodeURIComponent(uid)}`);
        setWishlist(wishRows || []);

        // Load addresses from addresses table
        const addrRows = await api.get<any[]>(`/api/addresses?user_id=${encodeURIComponent(uid)}`);
        if (addrRows && addrRows.length > 0) {
          setAddresses(addrRows.map((r: any) => ({
            id: r.id,
            fullName: r.full_name,
            phone: r.phone,
            houseNumber: r.house_number || '',
            apartmentName: r.apartment_name || '',
            streetName: r.street_name || '',
            landmark: r.landmark || '',
            areaColony: r.area_colony || '',
            city: r.city,
            state: r.state,
            pincode: r.pincode,
            isDefault: Boolean(r.is_default),
          })));
        } else {
          setAddresses([]);
        }
      } catch (err) {
        console.error('Failed to load user profile from API:', err);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  // 4. User Profile Sync — now handled per-mutation below (no bulk JSON sync needed)

  // 5. Transient UI and configurations sync to sessionStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    sessionStorage.setItem('srisai_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (selectedAddress) {
      sessionStorage.setItem('srisai_selected_address', JSON.stringify(selectedAddress));
    } else {
      sessionStorage.removeItem('srisai_selected_address');
    }
  }, [selectedAddress]);

  useEffect(() => {
    sessionStorage.setItem('srisai_compare', JSON.stringify(comparisonList));
  }, [comparisonList]);

  useEffect(() => {
    sessionStorage.setItem('srisai_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    sessionStorage.setItem('srisai_admin_role', adminRole);
  }, [adminRole]);

  useEffect(() => {
    sessionStorage.setItem('srisai_whatsapp_settings', JSON.stringify(whatsAppSettings));
  }, [whatsAppSettings]);

  useEffect(() => {
    sessionStorage.setItem('srisai_whatsapp_analytics', JSON.stringify(whatsAppAnalytics));
  }, [whatsAppAnalytics]);

  useEffect(() => {
    sessionStorage.setItem('srisai_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    sessionStorage.setItem('srisai_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    sessionStorage.setItem('srisai_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    sessionStorage.setItem('srisai_instagram_settings', JSON.stringify(instagramSettings));
  }, [instagramSettings]);


  const setCurrentUser = (session: UserSession | null) => {
    setCurrentUserState(session);
    if (session) {
      sessionStorage.setItem('srisai_session', JSON.stringify(session));
      if (session.role !== 'customer') {
        setAdminRole(session.role);
      }
    } else {
      sessionStorage.removeItem('srisai_session');
      setAdminRole('customer' as any);
    }
  };

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  // Cart operations (write to cart_items table via API)
  const addToCart = (deviceId: string, color: string) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.deviceId === deviceId && item.selectedColor === color);
      const newQty = existing ? existing.quantity + 1 : 1;
      if (userDbId) {
        api.post('/api/cart', {
          user_id: userDbId,
          item_id: deviceId,
          quantity: newQty,
          selected_color: color
        }).catch(err => console.error('Failed to sync cart:', err));
      }
      if (existing) {
        return prevCart.map(item => 
          (item.deviceId === deviceId && item.selectedColor === color)
            ? { ...item, quantity: newQty }
            : item
        );
      }
      return [...prevCart, { deviceId, selectedColor: color, quantity: 1 }];
    });
  };

  const updateCartQty = (deviceId: string, color: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(deviceId, color);
      return;
    }
    setCart(prevCart => 
      prevCart.map(item => 
        (item.deviceId === deviceId && item.selectedColor === color)
          ? { ...item, quantity: qty }
          : item
      )
    );
    if (userDbId) {
      api.post('/api/cart', {
        user_id: userDbId,
        item_id: deviceId,
        quantity: qty,
        selected_color: color
      }).catch(err => console.error('Failed to update cart qty:', err));
    }
  };

  const removeFromCart = (deviceId: string, color: string) => {
    setCart(prevCart => prevCart.filter(item => !(item.deviceId === deviceId && item.selectedColor === color)));
    if (userDbId) {
      api.delete(`/api/cart?user_id=${encodeURIComponent(userDbId)}&item_id=${encodeURIComponent(deviceId)}&selected_color=${encodeURIComponent(color)}`)
        .catch(err => console.error('Failed to remove cart item:', err));
    }
  };

  const clearCart = () => {
    setCart([]);
    if (userDbId) {
      api.delete(`/api/cart?user_id=${encodeURIComponent(userDbId)}`)
        .catch(err => console.error('Failed to clear cart:', err));
    }
  };

  // Wishlist operations (write to wishlist table via API)
  const toggleWishlist = (deviceId: string) => {
    setWishlist(prev => {
      const isInList = prev.includes(deviceId);
      if (isInList) {
        if (userDbId) {
          api.delete(`/api/wishlist?user_id=${encodeURIComponent(userDbId)}&item_id=${encodeURIComponent(deviceId)}`)
            .catch(err => console.error('Failed to remove wishlist item:', err));
        }
        return prev.filter(id => id !== deviceId);
      } else {
        if (userDbId) {
          api.post('/api/wishlist', {
            user_id: userDbId,
            item_id: deviceId
          }).catch(err => console.error('Failed to add wishlist item:', err));
        }
        return [...prev, deviceId];
      }
    });
  };

  // Comparison operations (max 4 devices)
  const addToCompare = (deviceId: string): boolean => {
    if (comparisonList.includes(deviceId)) return true;
    if (comparisonList.length >= 4) return false;
    setComparisonList(prev => [...prev, deviceId]);
    return true;
  };

  const removeFromCompare = (deviceId: string) => {
    setComparisonList(prev => prev.filter(id => id !== deviceId));
  };

  // Address operations (write to addresses table via API)
  const addAddress = (addr: Omit<Address, 'id'>) => {
    const localId = `addr-${Date.now()}`;
    const newAddr: Address = { ...addr, id: localId };
    
    setAddresses(prev => {
      let updated = prev;
      if (newAddr.isDefault) {
        updated = prev.map(a => ({ ...a, isDefault: false }));
      }
      const list = [...updated, newAddr];
      if (list.length === 1) {
        list[0].isDefault = true;
      }
      return list;
    });

    if (newAddr.isDefault || addresses.length === 0) {
      setSelectedAddress(newAddr);
    }

    if (userDbId) {
      api.post<any>('/api/addresses', {
        user_id: userDbId,
        full_name: addr.fullName,
        phone: addr.phone,
        house_number: addr.houseNumber || '',
        apartment_name: addr.apartmentName || '',
        street_name: addr.streetName || '',
        landmark: addr.landmark || '',
        area_colony: addr.areaColony || '',
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        is_default: addr.isDefault || addresses.length === 0,
      }).then((saved) => {
        if (saved && saved.id) {
          setAddresses(prev => prev.map(a => a.id === localId ? { ...a, id: saved.id } : a));
          if (newAddr.isDefault || addresses.length === 0) {
            setSelectedAddress(prev => prev && prev.id === localId ? { ...prev, id: saved.id } : prev);
          }
        }
      }).catch(err => console.error('Failed to save address:', err));
    }
  };

  const removeAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    if (userDbId) {
      api.delete(`/api/addresses/${encodeURIComponent(id)}`)
        .catch(err => console.error('Failed to delete address:', err));
    }
  };

  // Search History
  const addSearchQuery = (query: string) => {
    const q = query.trim();
    if (!q) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== q.toLowerCase());
      return [q, ...filtered].slice(0, 10); // store last 10
    });
  };

  const clearSearchHistory = () => setSearchHistory([]);

  // Recently Viewed
  const addRecentlyViewed = (deviceId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== deviceId);
      return [deviceId, ...filtered].slice(0, 8); // store last 8
    });
  };

  // Device view counts
  const incrementDeviceViews = (id: string) => {
    setDevices(prev => 
      prev.map(d => d.id === id ? { ...d, views: d.views + 1 } : d)
    );
  };
  // Order Placement
  const createOrder = (
    address: Address, 
    couponCode: string,
    deliveryType: 'home_delivery' | 'store_pickup',
    paymentMethod: Order['paymentMethod'],
    isPreorder = false,
    pickupDate?: string,
    pickupTime?: string
  ): Order | null => {
    if (cart.length === 0) return null;

    const orderItems: OrderItem[] = cart.map(cartItem => {
      const device = devices.find(d => d.id === cartItem.deviceId);
      const accessory = !device ? accessories.find(a => a.id === cartItem.deviceId) : null;
      if (!device && !accessory) throw new Error('Product not found in catalog');
      
      if (device) {
        return {
          deviceId: device.id,
          modelName: device.modelName,
          brand: device.brand,
          color: cartItem.selectedColor,
          ram: device.ram,
          storage: device.storage,
          quantity: cartItem.quantity,
          price: device.offerPrice,
          imageUrl: device.images[0] || 'logo.jpg'
        };
      } else {
        return {
          deviceId: accessory!.id,
          modelName: accessory!.name,
          brand: accessory!.brand,
          color: cartItem.selectedColor,
          ram: 'N/A',
          storage: 'N/A',
          quantity: cartItem.quantity,
          price: accessory!.offerPrice,
          imageUrl: accessory!.images[0] || 'logo.jpg'
        };
      }
    });

    const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const normCoupon = couponCode.trim().toUpperCase();
    let discount = 0;
    if (normCoupon === 'SAI10') {
      discount = Math.round(subtotal * 0.1);
    } else if (normCoupon === 'NEW5') {
      discount = Math.round(subtotal * 0.05);
    }

    // Pincode pricing details
    let deliveryFee = 0;
    let expectedDelivery = 'N/A';
    if (deliveryType === 'home_delivery') {
      const serviceDetails = checkPincodeServiceability(address.pincode, subtotal - discount);
      if (!serviceDetails.serviceable) return null;
      deliveryFee = serviceDetails.deliveryCharge;
      if (normCoupon === 'FREESHIP') {
        deliveryFee = 0;
      }
      expectedDelivery = getEstimatedDateString(serviceDetails.estimatedDays);
    } else {
      expectedDelivery = 'Ready for Store Pickup';
    }

    const gstAmount = Math.round((subtotal - discount) * 0.18); 
    const total = subtotal - discount + deliveryFee;

    const pickupOtp = deliveryType === 'store_pickup' 
      ? Math.floor(100000 + Math.random() * 900000).toString() 
      : undefined;

    const newOrder: Order = {
      id: `SSM-ORD-${Date.now().toString().slice(-6)}`,
      customerEmail: currentUser?.email || 'walkin@customer.com',
      customerName: address.fullName,
      customerPhone: address.phone,
      items: orderItems,
      subtotal,
      discount,
      gstAmount,
      deliveryFee,
      total,
      shippingAddress: address,
      estimatedDeliveryDate: expectedDelivery,
      status: 'pending',
      orderDate: new Date().toISOString(),
      
      deliveryType,
      isPreorder,
      pickupDate,
      pickupTime,
      pickupOtp,
      
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          description: 'Order placed by customer.',
          updatedBy: currentUser?.email || 'Customer'
        }
      ],
      internalNotes: [],
      callLogs: []
    };

    // Update stock levels & sales volumes
    setDevices(prev => 
      prev.map(d => {
        const cartMatch = cart.find(item => item.deviceId === d.id);
        if (cartMatch) {
          const newStock = Math.max(0, d.stockCount - cartMatch.quantity);
          
          // Generate stock low warning alerts (1, 2, 5 units)
          if (newStock === 0) {
            addNotification('low_stock', `Product "${d.modelName}" is OUT OF STOCK (0 units remaining).`, { deviceId: d.id });
          } else if (newStock === 1) {
            addNotification('low_stock', `CRITICAL STOCK ALERT: "${d.modelName}" has only 1 unit remaining.`, { deviceId: d.id });
          } else if (newStock === 2) {
            addNotification('low_stock', `Stock Warning: "${d.modelName}" has 2 units remaining.`, { deviceId: d.id });
          } else if (newStock <= 5) {
            addNotification('low_stock', `Stock Warning: "${d.modelName}" has ${newStock} units remaining (below threshold 5).`, { deviceId: d.id });
          }
          
          return {
            ...d,
            stockCount: newStock,
            sales: d.sales + cartMatch.quantity
          };
        }
        return d;
      })
    );

    // Update accessory stock levels & sales volumes
    setAccessories(prev =>
      prev.map(a => {
        const cartMatch = cart.find(item => item.deviceId === a.id);
        if (cartMatch) {
          const newStock = Math.max(0, a.stockCount - cartMatch.quantity);
          if (newStock === 0) {
            addNotification('low_stock', `Accessory "${a.name}" is OUT OF STOCK (0 units remaining).`, { deviceId: a.id });
          } else if (newStock <= 5) {
            addNotification('low_stock', `Accessory "${a.name}" has ${newStock} units remaining (below threshold 5).`, { deviceId: a.id });
          }
          return {
            ...a,
            stockCount: newStock,
            sales: a.sales + cartMatch.quantity,
            status: newStock === 0 ? 'out_of_stock' as const : a.status
          };
        }
        return a;
      })
    );

    // Update flash sales volumes if matching
    setFlashSales(prev =>
      prev.map(fs => {
        const cartMatch = cart.find(item => item.deviceId === fs.deviceId);
        if (cartMatch && fs.enabled) {
          const newSoldCount = Math.min(fs.stockLimit, fs.soldCount + cartMatch.quantity);
          if (newSoldCount >= fs.stockLimit) {
            addNotification(
              'sale_ending',
              `Flash Sale for "${devices.find(d => d.id === fs.deviceId)?.modelName || 'device'}" has sold out!`,
              { deviceId: fs.deviceId }
            );
          }
          return {
            ...fs,
            soldCount: newSoldCount,
            enabled: newSoldCount < fs.stockLimit ? fs.enabled : false
          };
        }
        return fs;
      })
    );

    // Record the Order
    const dbOrder = mapOrderToDbOrder(newOrder);
    api.post('/api/orders', dbOrder).catch((error) => {
      console.error('Failed to save order to API:', error);
    });

    clearCart();

    // Trigger Admin notifications
    addNotification(
      'new_order',
      `New order ${newOrder.id} placed by ${newOrder.customerName} for ₹${newOrder.total.toLocaleString('en-IN')}`,
      { orderId: newOrder.id }
    );

    addAuditLog(`Placed Order ${newOrder.id} (${deliveryType === 'home_delivery' ? 'Home Delivery' : 'Store Pickup'})`, currentUser?.name || 'Customer');

    return newOrder;
  };

  // ERP Operations
  const updateOrderStatus = (orderId: string, status: OrderStatus, updatedBy?: string) => {
    setOrders(prev => 
      prev.map(o => {
        if (o.id === orderId) {
          const nowStr = new Date().toISOString();
          const desc = `Order status changed to ${status.replace(/_/g, ' ')}.`;
          const actualDeliveryDate = status === 'delivered' ? nowStr : o.actualDeliveryDate;
          
          return {
            ...o,
            status,
            actualDeliveryDate,
            timeline: [
              ...o.timeline,
              { status, timestamp: nowStr, description: desc, updatedBy: updatedBy || 'System' }
            ]
          };
        }
        return o;
      })
    );
    addAuditLog(`Updated Order ${orderId} Status to ${status.toUpperCase()}`, updatedBy || 'System');
  };

  const updateOrderDelivery = (orderId: string, deliveryDetails: Partial<Order>) => {
    setOrders(prev => 
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            ...deliveryDetails
          };
        }
        return o;
      })
    );
    addAuditLog(`Updated Delivery Logistics for Order ${orderId}`, 'Admin');
  };

  const updateOrderPayment = (orderId: string, paymentDetails: Partial<Order>) => {
    setOrders(prev => 
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            ...paymentDetails
          };
        }
        return o;
      })
    );
    addAuditLog(`Updated Payment Information for Order ${orderId}`, 'Admin');
  };

  const addOrderNote = (orderId: string, note: string) => {
    setOrders(prev => 
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            internalNotes: [...(o.internalNotes || []), note]
          };
        }
        return o;
      })
    );
    addAuditLog(`Added internal note to Order ${orderId}`, 'Admin');
  };

  const issueRefund = (orderId: string, refundDetails: { amount: number; method: string; reason?: string }) => {
    setOrders(prev => 
      prev.map(o => {
        if (o.id === orderId) {
          const nowStr = new Date().toISOString();
          const refundId = `SSM-REF-${Date.now().toString().slice(-6)}`;
          return {
            ...o,
            status: 'refunded' as const,
            paymentStatus: 'refunded' as const,
            refundId,
            refundAmount: refundDetails.amount,
            refundMethod: refundDetails.method,
            refundDate: nowStr,
            returnReason: refundDetails.reason || 'Requested by Customer',
            timeline: [
              ...o.timeline,
              { status: 'refunded', timestamp: nowStr, description: `Refund Issued: ₹${refundDetails.amount} via ${refundDetails.method}. Ref ID: ${refundId}`, updatedBy: 'Super Admin' }
            ]
          };
        }
        return o;
      })
    );
    addAuditLog(`Issued Refund of ₹${refundDetails.amount} for Order ${orderId}`, 'Super Admin');
  };

  const addCallLog = (orderId: string, call: { duration: string; staffName: string; summary: string }) => {
    setOrders(prev => 
      prev.map(o => {
        if (o.id === orderId) {
          const callEntry = {
            id: `call-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...call
          };
          return {
            ...o,
            callLogs: [...(o.callLogs || []), callEntry]
          };
        }
        return o;
      })
    );
    addAuditLog(`Registered customer call log for Order ${orderId}`, call.staffName);
  };
  
  const addAuditLog = (action: string, adminName: string) => {
    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      adminName,
      action,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      ipAddress: `192.168.1.${Math.floor(2 + Math.random() * 254)}`
    };
    setAuditLogs(prev => [log, ...prev]);
  };
  
  const clearAuditLogs = () => setAuditLogs([]);

  const trackWhatsAppClick = (category: 'product' | 'cart' | 'order' | 'general', deviceId?: string) => {
    setWhatsAppAnalytics(prev => {
      const updatedProducts = { ...prev.mostContactedProducts };
      if (deviceId) {
        updatedProducts[deviceId] = (updatedProducts[deviceId] || 0) + 1;
      }
      
      return {
        totalClicks: prev.totalClicks + 1,
        productClicks: category === 'product' ? prev.productClicks + 1 : prev.productClicks,
        cartClicks: category === 'cart' ? prev.cartClicks + 1 : prev.cartClicks,
        orderClicks: category === 'order' ? prev.orderClicks + 1 : prev.orderClicks,
        mostContactedProducts: updatedProducts
      };
    });
    addAuditLog(`WhatsApp ${category.toUpperCase()} Inquiry Support Clicked`, currentUser?.name || 'Customer');
  };

  const clearWhatsAppAnalytics = () => {
    setWhatsAppAnalytics({
      totalClicks: 0,
      productClicks: 0,
      cartClicks: 0,
      orderClicks: 0,
      mostContactedProducts: {}
    });
  };

  // Instagram Post Management
  const addInstagramPost = (post: Omit<InstagramPost, 'id' | 'createdAt' | 'views' | 'clicks'>) => {
    const newPost: InstagramPost = {
      ...post,
      id: `ig-${Date.now()}`,
      views: 0,
      clicks: 0,
      createdAt: new Date().toISOString()
    };
    setInstagramPosts(prev => [...prev, newPost]);
    addAuditLog(`Added Instagram Post Feed: ${post.url}`, currentUser?.name || 'Admin');
  };

  const updateInstagramPost = (id: string, updates: Partial<InstagramPost>) => {
    setInstagramPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    addAuditLog(`Updated Instagram Post Entry ID: ${id}`, currentUser?.name || 'Admin');
  };

  const deleteInstagramPost = (id: string) => {
    setInstagramPosts(prev => prev.filter(p => p.id !== id));
    addAuditLog(`Deleted Instagram Post Entry ID: ${id}`, currentUser?.name || 'Admin');
  };

  const reorderInstagramPosts = (posts: InstagramPost[]) => {
    setInstagramPosts(posts);
    addAuditLog(`Reordered Instagram Posts Display Sequence`, currentUser?.name || 'Admin');
  };

  const updateInstagramSettings = (settings: Partial<InstagramSettings>) => {
    setInstagramSettings(prev => ({ ...prev, ...settings }));
    addAuditLog(`Updated Instagram Storefront Section Settings`, currentUser?.name || 'Admin');
  };

  const trackInstagramPostView = (id: string) => {
    setInstagramPosts(prev => prev.map(p => p.id === id ? { ...p, views: p.views + 1 } : p));
  };

  const trackInstagramPostClick = (id: string) => {
    setInstagramPosts(prev => prev.map(p => p.id === id ? { ...p, clicks: p.clicks + 1 } : p));
  };


  // Super Admin: Manage Admin Accounts
  const addAdminEmail = (email: string, name: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    if (admins.some(a => a.email.toLowerCase() === cleanEmail)) {
      return false; // Duplicate check
    }

    const newAdmin: AdminUser = {
      email: cleanEmail,
      name,
      role: 'manager',
      enabled: true,
      dateAdded: new Date().toISOString()
    };

    setAdmins(prev => [...prev, newAdmin]);
    return true;
  };

  const removeAdminEmail = (email: string) => {
    if (email === 'superadmin@srisaimobiles.com') return; // Cannot delete Super Admin!
    setAdmins(prev => prev.filter(a => a.email.toLowerCase() !== email.toLowerCase()));
  };

  const toggleAdminState = (email: string) => {
    if (email === 'superadmin@srisaimobiles.com') return;
    setAdmins(prev => 
      prev.map(a => a.email.toLowerCase() === email.toLowerCase() ? { ...a, enabled: !a.enabled } : a)
    );
  };

  // Admin Device Management
  const saveDevice = async (deviceData: Omit<Device, 'id' | 'views' | 'sales'> & { id?: string }) => {
    try {
      if (deviceData.id) {
        // Edit
        const dbProduct = mapDeviceToDbProduct(deviceData);
        dbProduct.status = deviceData.stockCount > 0 ? 'available' : 'out_of_stock';
        await api.put(`/api/products/${encodeURIComponent(deviceData.id)}`, dbProduct);
        addAuditLog(`Edited Smartphone Catalog Entry: ${deviceData.brand} ${deviceData.modelName}`, currentUser?.email || 'Admin');
      } else {
        // Add
        const id = `${deviceData.brand.toLowerCase()}-${deviceData.modelName.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
        const newDevice: Partial<Device> = {
          ...deviceData,
          id,
          views: 0,
          sales: 0,
          status: deviceData.stockCount > 0 ? 'available' : 'out_of_stock'
        };
        const dbProduct = mapDeviceToDbProduct(newDevice);
        await api.post('/api/products', dbProduct);
        addAuditLog(`Added New Smartphone Catalog Entry: ${deviceData.brand} ${deviceData.modelName}`, currentUser?.email || 'Admin');
      }
      await refetchProducts();
    } catch (err) {
      console.error('Failed to save device:', err);
      throw err;
    }
  };

  const duplicateDevice = async (id: string) => {
    const source = devices.find(d => d.id === id);
    if (!source) return;

    try {
      const dup: Device = {
        ...source,
        id: `${source.id}-copy-${Date.now().toString().slice(-3)}`,
        modelName: `${source.modelName} (Copy)`,
        views: 0,
        sales: 0
      };
      const dbProduct = mapDeviceToDbProduct(dup);
      await api.post('/api/products', dbProduct);
      await refetchProducts();
      addAuditLog(`Duplicated Smartphone Entry: ID ${id}`, currentUser?.email || 'Admin');
    } catch (err) {
      console.error('Failed to duplicate device:', err);
      throw err;
    }
  };

  const deleteDevice = async (id: string) => {
    try {
      await api.delete(`/api/products/${encodeURIComponent(id)}`);
      setCart(prev => prev.filter(item => item.deviceId !== id));
      await refetchProducts();
      addAuditLog(`Deleted Smartphone Entry: ID ${id}`, currentUser?.email || 'Admin');
    } catch (err) {
      console.error('Failed to delete device:', err);
      throw err;
    }
  };

  const archiveDevice = async (id: string) => {
    try {
      await api.put(`/api/products/${encodeURIComponent(id)}`, { status: 'archived' });
      await refetchProducts();
      addAuditLog(`Archived Smartphone Entry: ID ${id}`, currentUser?.email || 'Admin');
    } catch (err) {
      console.error('Failed to archive device:', err);
      throw err;
    }
  };

  // Admin Banner Management
  const saveBanner = async (bannerData: Omit<Banner, 'id'> & { id?: string }) => {
    try {
      if (bannerData.id) {
        const dbBanner = mapBannerToDbBanner(bannerData);
        await api.put(`/api/banners/${encodeURIComponent(bannerData.id)}`, dbBanner);
        addAuditLog(`Edited Banner Entry: ${bannerData.title}`, currentUser?.email || 'Admin');
      } else {
        const id = `banner-${Date.now()}`;
        const newBanner: Partial<Banner> = {
          ...bannerData,
          id,
          priority: banners.length + 1
        };
        const dbBanner = mapBannerToDbBanner(newBanner);
        await api.post('/api/banners', dbBanner);
        addAuditLog(`Added New Banner Entry: ${bannerData.title}`, currentUser?.email || 'Admin');
      }
      await refetchBanners();
    } catch (err) {
      console.error('Failed to save banner:', err);
      throw err;
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      await api.delete(`/api/banners/${encodeURIComponent(id)}`);
      await refetchBanners();
      addAuditLog(`Deleted Banner ID: ${id}`, currentUser?.email || 'Admin');
    } catch (err) {
      console.error('Failed to delete banner:', err);
      throw err;
    }
  };

  const reorderBanners = async (list: Banner[]) => {
    try {
      const updates = list.map((b, idx) => ({
        id: b.id,
        title: b.title,
        image_url: b.image_url,
        active: b.active,
        priority: idx + 1
      }));
      await api.post('/api/banners', updates);
      await refetchBanners();
      addAuditLog(`Reordered Banners Display Sequence`, currentUser?.email || 'Admin');
    } catch (err) {
      console.error('Failed to reorder banners:', err);
      throw err;
    }
  };

  // Admin Flash Sale Management
  const saveFlashSale = async (saleData: Omit<FlashSale, 'id' | 'soldCount'> & { id?: string }) => {
    try {
      if (saleData.id) {
        const dbSale = mapFlashSaleToDbFlashSale(saleData);
        await api.put(`/api/flash-sales/${encodeURIComponent(saleData.id)}`, dbSale);
        setFlashSales(prev => prev.map(fs => fs.id === saleData.id ? { ...fs, ...saleData } as FlashSale : fs));
        addAuditLog(`Edited Flash Sale ID: ${saleData.id}`, currentUser?.email || 'Admin');
      } else {
        const id = `fs-${Date.now()}`;
        const newSale: FlashSale = {
          ...saleData,
          id,
          soldCount: 0
        };
        const dbSale = mapFlashSaleToDbFlashSale(newSale);
        await api.post('/api/flash-sales', dbSale);
        setFlashSales(prev => [...prev, newSale]);
        addAuditLog(`Added New Flash Sale Entry`, currentUser?.email || 'Admin');
      }
      await refetchFlashSales();
    } catch (err) {
      console.error('Failed to save flash sale:', err);
      throw err;
    }
  };

  const deleteFlashSale = async (id: string) => {
    try {
      await api.delete(`/api/flash-sales/${encodeURIComponent(id)}`);
      setFlashSales(prev => prev.filter(fs => fs.id !== id));
      await refetchFlashSales();
      addAuditLog(`Deleted Flash Sale Entry ID: ${id}`, currentUser?.email || 'Admin');
    } catch (err) {
      console.error('Failed to delete flash sale:', err);
      throw err;
    }
  };

  // Admin Accessories Management
  const saveAccessory = async (accessoryData: Omit<Accessory, 'id' | 'views' | 'sales' | 'createdAt'> & { id?: string }) => {
    try {
      if (accessoryData.id) {
        const dbAcc = mapAccessoryToDbAccessory(accessoryData);
        dbAcc.status = accessoryData.stockCount > 0 ? 'available' : 'out_of_stock';
        await api.put(`/api/accessories/${encodeURIComponent(accessoryData.id)}`, dbAcc);
        setAccessories(prev => 
          prev.map(a => a.id === accessoryData.id 
            ? { 
                ...a, 
                ...accessoryData,
                status: accessoryData.stockCount > 0 ? 'available' : 'out_of_stock'
              } as Accessory 
            : a
          )
        );
        addAuditLog(`Edited Accessory Entry: ${accessoryData.name}`, currentUser?.email || 'Admin');
      } else {
        const id = `acc-${accessoryData.category.slice(0,3)}-${Date.now().toString().slice(-4)}`;
        const newAccessory: Accessory = {
          ...accessoryData,
          id,
          views: 0,
          sales: 0,
          status: accessoryData.stockCount > 0 ? 'available' : 'out_of_stock',
          createdAt: new Date().toISOString()
        };
        const dbAcc = mapAccessoryToDbAccessory(newAccessory);
        await api.post('/api/accessories', dbAcc);
        setAccessories(prev => [...prev, newAccessory]);
        addAuditLog(`Added New Accessory: ${accessoryData.name}`, currentUser?.email || 'Admin');
      }
      await refetchAccessories();
    } catch (err) {
      console.error('Failed to save accessory:', err);
      throw err;
    }
  };

  const deleteAccessory = async (id: string) => {
    try {
      await api.delete(`/api/accessories/${encodeURIComponent(id)}`);
      setAccessories(prev => prev.filter(a => a.id !== id));
      setCart(prev => prev.filter(item => item.deviceId !== id));
      await refetchAccessories();
      addAuditLog(`Deleted Accessory Entry ID: ${id}`, currentUser?.email || 'Admin');
    } catch (err) {
      console.error('Failed to delete accessory:', err);
      throw err;
    }
  };

  const incrementAccessoryViews = (id: string) => {
    setAccessories(prev => 
      prev.map(a => a.id === id ? { ...a, views: a.views + 1 } : a)
    );
  };

  const incrementAccessorySales = (id: string, quantity: number) => {
    setAccessories(prev => 
      prev.map(a => a.id === id ? { ...a, sales: a.sales + quantity } : a)
    );
  };

  // Notification Operations
  const addNotification = (
    type: SystemNotification['type'], 
    message: string, 
    meta?: SystemNotification['meta']
  ) => {
    const notif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      meta
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const saveAllSettings = async (
    store: typeof storeSettings,
    whatsapp: WhatsAppSettings,
    instagram: InstagramSettings
  ) => {
    try {
      await api.put('/api/settings', {
        store_name: store.storeName,
        store_address: store.storeAddress,
        store_phone: store.storePhone,
        whatsapp_number: store.whatsappNumber,
        default_greeting: store.defaultGreeting,
        whatsapp_settings: whatsapp,
        instagram_settings: instagram
      });
      
      setStoreSettingsState(store);
      setWhatsAppSettings(whatsapp);
      setInstagramSettings(instagram);
      
      sessionStorage.setItem('srisai_whatsapp_settings', JSON.stringify(whatsapp));
      sessionStorage.setItem('srisai_instagram_settings', JSON.stringify(instagram));
      
      showToast("Store settings saved successfully!", "success");
    } catch (err: any) {
      console.error("Save settings failed:", err);
      showToast("Failed to save store settings: " + err.message, "error");
      throw err;
    }
  };

  const saveInstagramPostsList = async (postsList: InstagramPost[]) => {
    try {
      const rows = postsList.map(p => ({
        id: p.id,
        url: p.url,
        type: p.type,
        thumbnail_url: p.thumbnailUrl,
        custom_title: p.customTitle || null,
        custom_description: p.customDescription || null,
        display_order: p.displayOrder,
        is_featured: p.isFeatured,
        is_active: p.isActive,
        position: p.position || 'middle',
        expiry_date: p.expiryDate || null,
        views: p.views || 0,
        clicks: p.clicks || 0
      }));
      
      await api.put('/api/instagram-posts', rows);
      await refetchInstagram();
      showToast("Instagram feed saved successfully!", "success");
    } catch (err: any) {
      console.error("Save Instagram posts failed:", err);
      showToast("Failed to save Instagram feed: " + err.message, "error");
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      dbLoading,
      dbError,
      retryDbConnection,
      bypassDbConnection,
      theme, toggleTheme,
      currentUser, setCurrentUser,
      devices, banners, flashSales, admins,
      addresses, selectedAddress, setSelectedAddress,
      cart, wishlist, comparisonList, orders, notifications,
      searchHistory, recentlyViewed, currentRoute, navigateTo,
      addToCart, updateCartQty, removeFromCart, clearCart,
      toggleWishlist, addToCompare, removeFromCompare,
      addAddress, removeAddress, addSearchQuery, clearSearchHistory,
      addRecentlyViewed, createOrder,
      
      // OMS & ERP operations
      updateOrderStatus, updateOrderDelivery, updateOrderPayment,
      addOrderNote, issueRefund, addCallLog,
      auditLogs, addAuditLog, clearAuditLogs,
      adminRole, setAdminRole,
 
      // WhatsApp Settings & Analytics
      whatsAppSettings, setWhatsAppSettings, whatsAppAnalytics,
      trackWhatsAppClick, clearWhatsAppAnalytics,
 
      // Instagram Posts
      instagramPosts, addInstagramPost, updateInstagramPost,
      deleteInstagramPost, reorderInstagramPosts, instagramSettings,
      updateInstagramSettings, trackInstagramPostView, trackInstagramPostClick,
 
      // Accessories
      accessories, saveAccessory, deleteAccessory,
      incrementAccessoryViews, incrementAccessorySales,
 
      addAdminEmail, removeAdminEmail, toggleAdminState,
      saveDevice, duplicateDevice, deleteDevice, archiveDevice,
      saveBanner, deleteBanner, reorderBanners,
      saveFlashSale, deleteFlashSale,
      addNotification, markNotificationRead, markAllNotificationsRead,
      incrementDeviceViews,

      // Toast notifications
      toasts, showToast,
      
      // Unsaved changes registry
      unsavedModules, registerUnsavedChanges, hasAnyUnsavedChanges,

      // Physical store settings
      storeSettings, saveAllSettings,

      // Instagram posts save list
      saveInstagramPostsList,

      // Refetches
      refetchProducts, refetchBanners, refetchAccessories, refetchFlashSales,
      refetchOrders, refetchSettings, refetchInstagram, refetchAdmins
    }}>
      {children}
      {/* Toast Overlay Renderer */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div 
            key={t.id} 
            className="glass" 
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              border: t.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : (t.type === 'error' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)'),
              backgroundColor: t.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : (t.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)'),
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: t.type === 'success' ? '#10b981' : (t.type === 'error' ? '#ef4444' : '#3b82f6')
            }} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%) translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
};
