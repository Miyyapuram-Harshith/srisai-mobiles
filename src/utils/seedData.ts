import { Device, Banner, FlashSale, AdminUser, Order, Address } from '../types';

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'apple-iphone-15-pro-max',
    brand: 'Apple',
    modelName: 'iPhone 15 Pro Max',
    variant: '256GB',
    ram: '8GB',
    storage: '256GB',
    processor: 'A17 Pro chip with 6-core GPU',
    display: '6.7-inch Super Retina XDR OLED',
    battery: '4441 mAh',
    charging: '25W wired, 15W MagSafe wireless',
    cameras: '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto | 12MP Front',
    weight: '221g',
    colors: ['Natural Titanium', 'Blue Titanium', 'Black Titanium', 'White Titanium'],
    warranty: '1 Year Brand Warranty',
    price: 159900,
    offerPrice: 148900,
    stockCount: 5,
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
    specifications: {
      display: '6.7-inch Super Retina XDR OLED, 120Hz, HDR10, Dolby Vision, 2000 nits (peak)',
      processor: 'Apple A17 Pro (3 nm) Hexa-core CPU, 6-core GPU',
      ram: '8GB LPDDR5',
      storage: '256GB NVMe',
      battery: '4441 mAh, Li-Ion, non-removable',
      charging: 'USB-PD 2.0, 50% charge in 30 min, 15W wireless (MagSafe), 7.5W wireless (Qi)',
      camera: '48 MP f/1.8 (Wide) + 12 MP f/2.8 (5x Telephoto) + 12 MP f/2.2 (Ultra Wide) + TOF 3D LiDAR | Front: 12 MP f/1.9 (Wide) PDAF',
      weight: '221g (7.80 oz)',
      connectivity: '5G, Wi-Fi 6e, Bluetooth 5.3, NFC, USB Type-C 3.0',
      warranty: '1 Year Brand Warranty on Handset and 6 Months on Accessories'
    },
    features: [
      'Aerospace-grade titanium design is lightweight yet extremely robust.',
      'A17 Pro chip delivers industry-leading graphics and gaming performance.',
      'Pro Camera system with 5x optical zoom on iPhone 15 Pro Max.',
      'Customizable Action button to launch your favorite feature instantly.',
      'USB-C connector supports USB 3 speeds up to 10Gb/s.'
    ],
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1695048133107-1b076f8de644?q=80&w=800&auto=format&fit=crop'
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    status: 'available',
    views: 450,
    sales: 12,

    // Classification
    deviceType: 'brand_new',
    factorySealed: true,
    officialBrandWarrantyAvailable: true,
    warrantyDuration: '12 Months',
    launchDate: '2023-09-22',
    invoiceAvailable: true,
    seenOnInstagram: true,
    instagramPostUrl: 'https://instagram.com/reel/C8a12bc90XY'
  },
  {
    id: 'samsung-galaxy-s24-ultra',
    brand: 'Samsung',
    modelName: 'Galaxy S24 Ultra',
    variant: '512GB',
    ram: '12GB',
    storage: '512GB',
    processor: 'Snapdragon 8 Gen 3 for Galaxy',
    display: '6.8-inch Dynamic AMOLED 2X',
    battery: '5000 mAh',
    charging: '45W wired, 15W wireless',
    cameras: '200MP Main + 50MP Periscope + 10MP Telephoto + 12MP Ultra Wide | 12MP Front',
    weight: '232g',
    colors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet', 'Titanium Yellow'],
    warranty: '1 Year Brand Warranty',
    price: 139999,
    offerPrice: 129999,
    stockCount: 8,
    description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.',
    specifications: {
      display: '6.8-inch Dynamic AMOLED 2X, 120Hz, HDR10+, 2600 nits (peak), Gorilla Glass Armor',
      processor: 'Qualcomm Snapdragon 8 Gen 3 (4 nm) Octa-core CPU, Adreno 750 GPU',
      ram: '12GB LPDDR5X',
      storage: '512GB UFS 4.0',
      battery: '5000 mAh, Li-Ion, non-removable',
      charging: '45W wired PD3.0 (65% in 30 mins), 15W wireless, 4.5W reverse wireless',
      camera: '200 MP f/1.7 (Wide) + 50 MP f/3.4 (5x Optical Periscope) + 10 MP f/2.4 (3x Optical) + 12 MP f/2.2 (Ultra Wide) | Front: 12 MP f/2.2 Dual Pixel PDAF',
      weight: '232g (8.18 oz)',
      connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, NFC, UWB, USB Type-C 3.2',
      warranty: '1 Year Manufacturer Warranty for Device and 6 Months for In-Box Accessories'
    },
    features: [
      'Galaxy AI features: Circle to Search, Live Translate, Note Assist, and Photo Assist.',
      'Titanium exterior shield provides superior protection and premium texture.',
      'Built-in S Pen lets you write, tap, and navigate with precision.',
      'Industry-leading 200MP camera with advanced nightography and AI processing.',
      'Sleek flat display offers more screen real estate and reduced reflections.'
    ],
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610945415295-d9bdf067e581?q=80&w=800&auto=format&fit=crop'
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    status: 'available',
    views: 380,
    sales: 9,

    // Classification
    deviceType: 'brand_new',
    factorySealed: true,
    officialBrandWarrantyAvailable: true,
    warrantyDuration: '12 Months',
    launchDate: '2024-01-31',
    invoiceAvailable: true
  },
  {
    id: 'oneplus-12',
    brand: 'OnePlus',
    modelName: '12',
    variant: '256GB',
    ram: '12GB',
    storage: '256GB',
    processor: 'Snapdragon 8 Gen 3',
    display: '6.82-inch Super Fluid AMOLED',
    battery: '5400 mAh',
    charging: '100W SuperVOOC wired, 50W wireless',
    cameras: '50MP Main + 64MP 3x Periscope + 48MP Ultra Wide | 32MP Front',
    weight: '220g',
    colors: ['Flowy Emerald', 'Silky Black'],
    warranty: '1 Year Brand Warranty',
    price: 64999,
    offerPrice: 59999,
    stockCount: 4,
    description: 'Redefined flagship specifications. OnePlus 12 combines elite hardware with state-of-the-art software, powered by Trinity Engine to run cooler and faster.',
    specifications: {
      display: '6.82-inch LTPO AMOLED, 120Hz, Dolby Vision, HDR10+, 4500 nits (peak)',
      processor: 'Qualcomm Snapdragon 8 Gen 3 (4 nm) Octa-core CPU, Adreno 750 GPU',
      ram: '12GB LPDDR5X',
      storage: '256GB UFS 4.0',
      battery: '5400 mAh, Li-Po, non-removable',
      charging: '100W wired SuperVOOC (100% in 26 mins), 50W wireless AirVOOC (100% in 55 mins)',
      camera: '50 MP f/1.6 (Wide) + 64 MP f/2.6 (3x Periscope Telephoto) + 48 MP f/2.2 (Ultra Wide) | Front: 32 MP f/2.4 (Wide)',
      weight: '220g (7.76 oz)',
      connectivity: '5G, Wi-Fi 7, Bluetooth 5.4, NFC, Infrared, USB Type-C 3.2',
      warranty: '1 Year Domestic Warranty on Phone and 6 Months on Accessories'
    },
    features: [
      '4th Gen Hasselblad Camera System for Mobile captures rich, natural colors.',
      'Ultra-fast 100W SUPERVOOC charging refills battery in under 30 minutes.',
      'Dual Cryo-velocity VC Cooling System ensures sustained gaming performance.',
      'Stunning 2K 120Hz ProXDR display with Aqua Touch screen technology.'
    ],
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?q=80&w=800&auto=format&fit=crop'
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    status: 'available',
    views: 290,
    sales: 15,

    // Classification
    deviceType: 'open_box',
    openBoxBoxAvailable: true,
    openBoxAccessoriesAvailable: true,
    openBoxWarrantyRemaining: '11 Months',
    openBoxActivationDate: '2026-06-01',
    openBoxReason: 'Customer unboxed and returned within 24 hours (preferred screen size change).'
  },
  {
    id: 'nothing-phone-2',
    brand: 'Nothing',
    modelName: 'Phone (2)',
    variant: '256GB',
    ram: '12GB',
    storage: '256GB',
    processor: 'Snapdragon 8+ Gen 1',
    display: '6.7-inch LTPO OLED',
    battery: '4700 mAh',
    charging: '45W wired, 15W wireless',
    cameras: '50MP Main + 50MP Ultra Wide | 32MP Front',
    weight: '201g',
    colors: ['Dark Gray', 'White'],
    warranty: '1 Year Brand Warranty',
    price: 49999,
    offerPrice: 37999,
    stockCount: 2,
    description: 'Meet Phone (2). A new way to interact. Customize everything from widget icons to the Glyph Interface. Experience pure Nothing OS.',
    specifications: {
      display: '6.7-inch LTPO OLED, 120Hz, HDR10+, 1600 nits (peak)',
      processor: 'Qualcomm Snapdragon 8+ Gen 1 (4 nm) Octa-core CPU, Adreno 730 GPU',
      ram: '12GB LPDDR5',
      storage: '256GB UFS 3.1',
      battery: '4700 mAh, Li-Ion, non-removable',
      charging: '45W wired PD3.0 (100% in 55 min), 15W wireless, 5W reverse wireless',
      camera: '50 MP f/1.9 (Wide) OIS + 50 MP f/2.2 (Ultra Wide) | Front: 32 MP f/2.5 (Wide)',
      weight: '201g (7.09 oz)',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, NFC, USB Type-C 2.0',
      warranty: '1 Year Brand Warranty for handset, 6 months for internal accessories'
    },
    features: [
      'Iconic Glyph Interface with customized LED light patterns for visual status.',
      'Sleek transparent back glass with premium materials and ergonomic curves.',
      'Nothing OS 2.0 offers custom widgets, monochrome layouts, and clean animations.',
      'Dual 50MP rear camera system with advanced HDR and Motion Capture.'
    ],
    images: [
      'https://images.unsplash.com/photo-1691136979336-cab1459ec5c4?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1691136979344-93ffba6a9e14?q=80&w=800&auto=format&fit=crop'
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    status: 'available',
    views: 310,
    sales: 18,

    // Classification
    deviceType: 'used',
    ownershipDetails: 'first_owner',
    usedDuration: '3-6 months',
    originalPurchaseDate: '2026-01-10',
    purchaseBillAvailable: true,
    boxAvailable: true,
    originalChargerAvailable: true,
    originalCableAvailable: true,
    earphonesAvailable: false,
    backCoverAvailable: true,
    screenGuardApplied: true,
    currentWarrantyStatus: 'under_brand',
    warrantyExpiryDate: '2027-01-10',
    batteryHealth: 92,
    deviceConditionGrade: 'A',
    cosmeticConditionDescription: 'Back panel in excellent condition, minor scratches near charging port, no display issues.',
    displayCondition: 'perfect',
    frameCondition: 'minor_scratches',
    backPanelCondition: 'excellent',
    biometricStatus: 'working',
    cameraCondition: 'perfect',
    speakerCondition: 'perfect',
    microphoneCondition: 'perfect',
    networkLockStatus: 'factory_unlocked',
    repairHistory: 'never',
    qualityCheckStatus: ['Charging Tested', 'Speaker Tested', 'Microphone Tested', 'Camera Tested', 'WiFi Tested', 'Bluetooth Tested', 'SIM Tested'],
    seenOnInstagram: true,
    instagramPostUrl: 'https://instagram.com/reel/C8b45df89YZ'
  },
  {
    id: 'google-pixel-8-pro',
    brand: 'Google',
    modelName: 'Pixel 8 Pro',
    variant: '128GB',
    ram: '12GB',
    storage: '128GB',
    processor: 'Google Tensor G3',
    display: '6.7-inch Super Actua LTPO OLED',
    battery: '5050 mAh',
    charging: '30W wired, 23W wireless',
    cameras: '50MP Main + 48MP 5x Telephoto + 48MP Ultra Wide | 10.5MP Front',
    weight: '213g',
    colors: ['Bay', 'Obsidian', 'Porcelain'],
    warranty: '1 Year Brand Warranty',
    price: 106999,
    offerPrice: 94999,
    stockCount: 3,
    description: 'The all-pro phone engineered by Google. It has the best of Google AI, the most advanced Pixel camera ever, and a built-in temperature sensor.',
    specifications: {
      display: '6.7-inch Super Actua LTPO OLED, 120Hz, HDR10+, 2400 nits (peak), Gorilla Glass Victus 2',
      processor: 'Google Tensor G3 (4 nm) Nona-core CPU, Immortalis-G715s MC10 GPU',
      ram: '12GB LPDDR5X',
      storage: '128GB UFS 3.1',
      battery: '5050 mAh, Li-Ion, non-removable',
      charging: '30W wired PD3.0 (50% in 30 mins), 23W wireless, Reverse wireless',
      camera: '50 MP f/1.7 (Wide) + 48 MP f/2.8 (5x Zoom) + 48 MP f/2.0 (Ultra Wide) | Front: 10.5 MP f/2.2 (Wide) PDAF',
      weight: '213g (7.51 oz)',
      connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, NFC, UWB, USB Type-C 3.2',
      warranty: '1 Year Brand Warranty'
    },
    features: [
      'Google Tensor G3 chip is custom-designed with Google AI for photo and video magic.',
      'Magic Editor, Best Take, and Audio Magic Eraser make editing photos feel like magic.',
      'Super Actua display is Google’s brightest screen ever, even in direct sunlight.',
      'Thermometer sensor on the back lets you quickly measure object temperatures.'
    ],
    images: [
      'https://images.unsplash.com/photo-1698301540954-4a47514a6011?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1698301540960-953e5e4fa4a0?q=80&w=800&auto=format&fit=crop'
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    status: 'available',
    views: 210,
    sales: 6,

    // Classification
    deviceType: 'refurbished',
    refurbishedGrade: 'Excellent (A)',
    refurbishedPartsReplaced: 'Battery Replaced',
    refurbishedDate: '2026-05-10',
    refurbishedBy: 'SriSai Mobile Lab',
    refurbishedWarrantyOffered: '6 Months Store Warranty',
    seenOnInstagram: true,
    instagramPostUrl: 'https://instagram.com/reel/C8c78fg90ZA'
  },
  {
    id: 'motorola-edge-50-pro',
    brand: 'Motorola',
    modelName: 'Edge 50 Pro',
    variant: '256GB',
    ram: '12GB',
    storage: '256GB',
    processor: 'Snapdragon 7 Gen 3',
    display: '6.7-inch pOLED 1.5K Curved',
    battery: '4500 mAh',
    charging: '125W TurboPower wired, 50W wireless',
    cameras: '50MP Main + 10MP 3x Telephoto + 13MP Ultra Wide | 50MP Front',
    weight: '186g',
    colors: ['Luxe Lavender', 'Black Beauty', 'Moonlight Pearl'],
    warranty: '1 Year Brand Warranty',
    price: 36999,
    offerPrice: 32999,
    stockCount: 10,
    description: 'Intelligence meets art. Designed with premium vegan leather and containing a Pantone Validated display and camera system.',
    specifications: {
      display: '6.7-inch pOLED, 144Hz, HDR10+, 2000 nits (peak), 1.5K resolution, curved edges',
      processor: 'Qualcomm Snapdragon 7 Gen 3 (4 nm) Octa-core CPU, Adreno 720 GPU',
      ram: '12GB LPDDR4X',
      storage: '256GB UFS 2.2',
      battery: '4500 mAh, Li-Po, non-removable',
      charging: '125W wired TurboPower (100% in 18 min), 50W wireless, 10W reverse wireless',
      camera: '50 MP f/1.4 (Wide) + 10 MP f/2.0 (3x Optical Telephoto) + 13 MP f/2.2 (Ultra Wide & Macro) | Front: 50 MP f/1.9 (Wide) AF',
      weight: '186g (6.56 oz)',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.4, NFC, USB Type-C 3.1 with DisplayPort 1.4',
      warranty: '1 Year Brand Warranty'
    },
    features: [
      'Pantone Validated camera and display captures and shows true-to-life colors.',
      'Super-fast 125W charging refills the battery in just 18 minutes.',
      'Vibrant 144Hz curved display with 1.5K resolution is incredibly smooth.',
      'IP68 underwater protection protects against dust and water submersion.'
    ],
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop'
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    status: 'available',
    views: 195,
    sales: 14,

    // Classification
    deviceType: 'demo_unit',
    demoStoreUsageDuration: '3 Months',
    demoUsageHours: '120 Hours',
    demoPhysicalCondition: 'Excellent (Flawless frame, screen perfect)',
    demoWarrantyStatus: 'Warranty Expired'
  },
  {
    id: 'redmi-note-13-pro-plus',
    brand: 'Xiaomi',
    modelName: 'Redmi Note 13 Pro+',
    variant: '256GB',
    ram: '8GB',
    storage: '256GB',
    processor: 'MediaTek Dimensity 7200-Ultra',
    display: '6.67-inch CrystalRes AMOLED Curved',
    battery: '5000 mAh',
    charging: '120W HyperCharge',
    cameras: '200MP Main + 8MP Ultra Wide + 2MP Macro | 16MP Front',
    weight: '204g',
    colors: ['Fusion Black', 'Fusion White', 'Fusion Purple'],
    warranty: '1 Year Brand Warranty',
    price: 33999,
    offerPrice: 30999,
    stockCount: 0,
    description: 'Redmi Note 13 Pro+ is the ultimate mid-ranger with a flagship-level 200MP camera, premium 3D curved display, and ultra-fast 120W charging.',
    specifications: {
      display: '6.67-inch CrystalRes AMOLED, 120Hz, Dolby Vision, HDR10+, 1800 nits (peak), Gorilla Glass Victus',
      processor: 'MediaTek Dimensity 7200 Ultra (4 nm) Octa-core CPU, Mali-G610 MC4 GPU',
      ram: '8GB LPDDR5',
      storage: '256GB UFS 3.1',
      battery: '5000 mAh, Li-Po, non-removable',
      charging: '120W wired (100% in 19 min)',
      camera: '200 MP f/1.7 (Wide) OIS + 8 MP f/2.2 (Ultra Wide) + 2 MP f/2.4 (Macro) | Front: 16 MP f/2.4 (Wide)',
      weight: '204g (7.20 oz)',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, NFC, Infrared, USB Type-C 2.0',
      warranty: '1 Year Brand Warranty for Device and 6 Months for In-Box Accessories'
    },
    features: [
      'Flagship 200MP main camera with Optical Image Stabilization (OIS) and 4x lossless zoom.',
      '120W HyperCharge fully charges the phone in only 19 minutes.',
      'Sleek 3D curved screen with ultra-thin bezels for a premium viewing experience.',
      'IP68 dust and water resistance is a first for the Redmi Note series.'
    ],
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop'
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    status: 'out_of_stock',
    views: 180,
    sales: 11,

    // Classification
    deviceType: 'used',
    ownershipDetails: 'second_owner',
    usedDuration: '1-2 years',
    originalPurchaseDate: '2024-08-15',
    purchaseBillAvailable: true,
    boxAvailable: false,
    originalChargerAvailable: true,
    originalCableAvailable: true,
    earphonesAvailable: false,
    backCoverAvailable: true,
    screenGuardApplied: false,
    currentWarrantyStatus: 'expired',
    batteryHealth: 88,
    deviceConditionGrade: 'B_plus',
    cosmeticConditionDescription: 'Scratches on display, back panel perfect, frame has minor dents.',
    displayCondition: 'minor_scratches',
    frameCondition: 'dents',
    backPanelCondition: 'excellent',
    biometricStatus: 'working',
    cameraCondition: 'perfect',
    speakerCondition: 'perfect',
    microphoneCondition: 'perfect',
    networkLockStatus: 'factory_unlocked',
    repairHistory: 'never',
    qualityCheckStatus: ['Charging Tested', 'Speaker Tested', 'Microphone Tested', 'Camera Tested', 'WiFi Tested', 'SIM Tested']
  },
  {
    id: 'realme-gt-6t',
    brand: 'Realme',
    modelName: 'GT 6T',
    variant: '256GB',
    ram: '8GB',
    storage: '256GB',
    processor: 'Snapdragon 7+ Gen 3',
    display: '6.78-inch 8T LTPO OLED 6000nits',
    battery: '5500 mAh',
    charging: '120W SUPERVOOC',
    cameras: '50MP Main + 8MP Ultra Wide | 32MP Front',
    weight: '191g',
    colors: ['Fluid Silver', 'Razor Green'],
    warranty: '1 Year Brand Warranty',
    price: 35999,
    offerPrice: 32999,
    stockCount: 12,
    description: 'Top-tier performance meets incredible battery life. GT 6T features the brightest screen in the world and Snapdragon 7+ Gen 3 processing.',
    specifications: {
      display: '6.78-inch LTPO OLED, 120Hz, HDR10+, Dolby Vision, 6000 nits (peak), Gorilla Glass Victus 2',
      processor: 'Qualcomm Snapdragon 7+ Gen 3 (4 nm) Octa-core CPU, Adreno 732 GPU',
      ram: '8GB LPDDR5X',
      storage: '256GB UFS 4.0',
      battery: '5500 mAh, Li-Po, non-removable',
      charging: '120W wired SUPERVOOC (50% in 10 mins)',
      camera: '50 MP f/1.9 (Wide) OIS + 8 MP f/2.2 (Ultra Wide) | Front: 32 MP f/2.5 (Wide)',
      weight: '191g (6.74 oz)',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.4, NFC, Infrared, USB Type-C 2.0',
      warranty: '1 Year Manufacturer Warranty'
    },
    features: [
      'Stunning 6000 nits ultra-bright LTPO display is clearly readable under intense sun.',
      'Huge 5500mAh battery delivers up to 2 days of regular usage.',
      '120W SUPERVOOC charger included, fills battery half-way in 10 minutes.',
      'Iceberg Vapor Cooling System handles intense high-frame-rate gaming.'
    ],
    images: [
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop'
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    status: 'available',
    views: 160,
    sales: 4,

    // Classification
    deviceType: 'used',
    ownershipDetails: 'first_owner',
    usedDuration: '1-3 months',
    originalPurchaseDate: '2026-04-05',
    purchaseBillAvailable: true,
    boxAvailable: true,
    originalChargerAvailable: true,
    originalCableAvailable: true,
    earphonesAvailable: false,
    backCoverAvailable: true,
    screenGuardApplied: true,
    currentWarrantyStatus: 'under_brand',
    warrantyExpiryDate: '2027-04-05',
    batteryHealth: 96,
    deviceConditionGrade: 'A_plus',
    cosmeticConditionDescription: 'Absolute mint condition, screen guard pre-installed, original back cover untouched.',
    displayCondition: 'perfect',
    frameCondition: 'excellent',
    backPanelCondition: 'excellent',
    biometricStatus: 'working',
    cameraCondition: 'perfect',
    speakerCondition: 'perfect',
    microphoneCondition: 'perfect',
    networkLockStatus: 'factory_unlocked',
    repairHistory: 'never',
    qualityCheckStatus: ['Charging Tested', 'Speaker Tested', 'Microphone Tested', 'Camera Tested', 'WiFi Tested', 'Bluetooth Tested', 'SIM Tested']
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-iphone-15',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200&auto=format&fit=crop',
    title: 'iPhone 15 Pro Series Available Now',
    redirectLink: '#product/apple-iphone-15-pro-max',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    slideshowTimer: 5,
    enabled: true,
    order: 1
  },
  {
    id: 'banner-s24-ultra',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1200&auto=format&fit=crop',
    title: 'Experience Galaxy AI on S24 Ultra',
    redirectLink: '#product/samsung-galaxy-s24-ultra',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    slideshowTimer: 5,
    enabled: true,
    order: 2
  },
  {
    id: 'banner-festival-sale',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=1200&auto=format&fit=crop',
    title: 'Festival Mobiles Bonanza - Up to 20% Off',
    redirectLink: '#filter?offers=Bank Offer',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    slideshowTimer: 5,
    enabled: true,
    order: 3
  },
  {
    id: 'banner-exchange',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop',
    title: 'Instant Exchange & No Cost EMI Deals',
    redirectLink: '#filter?offers=No Cost EMI',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    slideshowTimer: 5,
    enabled: true,
    order: 4
  }
];

export const INITIAL_FLASH_SALES: FlashSale[] = [
  {
    id: 'fs-nothing-2',
    deviceId: 'nothing-phone-2',
    discountPercentage: 24, // 49999 -> 37999
    stockLimit: 5,
    soldCount: 3,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    enabled: true
  },
  {
    id: 'fs-oneplus-12',
    deviceId: 'oneplus-12',
    discountPercentage: 8, // 64999 -> 59999
    stockLimit: 10,
    soldCount: 6,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    enabled: true
  },
  {
    id: 'fs-iphone-15',
    deviceId: 'apple-iphone-15-pro-max',
    discountPercentage: 7, // 159900 -> 148900
    stockLimit: 3,
    soldCount: 2,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    enabled: true
  }
];

export const INITIAL_ADMINS: AdminUser[] = [
  {
    email: 'superadmin@srisaimobiles.com',
    name: 'SriSai Super Admin',
    role: 'super_admin',
    enabled: true,
    dateAdded: new Date('2026-01-01').toISOString()
  },
  {
    email: 'admin@gmail.com',
    name: 'SriSai Admin Partner',
    role: 'manager',
    enabled: true,
    dateAdded: new Date('2026-03-01').toISOString()
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'SSM-ORD-742910',
    customerEmail: 'customer@gmail.com',
    customerName: 'Harshith M',
    customerPhone: '9876543210',
    items: [
      {
        deviceId: 'apple-iphone-15-pro-max',
        modelName: 'iPhone 15 Pro Max',
        brand: 'Apple',
        color: 'Natural Titanium',
        ram: '8GB',
        storage: '256GB',
        quantity: 1,
        price: 148900,
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop'
      }
    ],
    subtotal: 148900,
    discount: 0,
    gstAmount: 22714,
    deliveryFee: 0,
    total: 148900,
    shippingAddress: {
      id: 'addr-seed-1',
      fullName: 'Harshith M',
      phone: '9876543210',
      alternatePhone: '9848022338',
      houseNumber: 'Flat No 2-4-53',
      apartmentName: 'Sai Residency',
      streetName: 'Main Road',
      landmark: 'Near Bus Stand',
      areaColony: 'Bazaar Area',
      city: 'Jagtial',
      district: 'Jagtial',
      state: 'Telangana',
      pincode: '505327',
      isDefault: true,
      googleMapsLink: 'https://maps.google.com/?q=Jagtial',
      deliveryInstructions: 'Deliver in the evening after 6 PM',
      preferredTimeSlot: '5:00 PM - 8:00 PM'
    },
    estimatedDeliveryDate: 'Same-day Delivery',
    status: 'delivered',
    orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryType: 'home_delivery',
    deliveryPartner: 'Delhivery',
    deliveryExecutiveName: 'K. Raju',
    deliveryExecutivePhone: '9000112233',
    trackingNumber: 'DEL12345678',
    actualDeliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    transactionId: 'TXN-UPI-98302148',
    timeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Order placed by customer.', updatedBy: 'Customer' },
      { status: 'confirmed', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 10 * 60000).toISOString(), description: 'Order confirmed and verified.', updatedBy: 'superadmin@srisaimobiles.com' },
      { status: 'packed', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60000).toISOString(), description: 'Items packed in sealed SriSai box.', updatedBy: 'superadmin@srisaimobiles.com' },
      { status: 'shipped', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60 * 60000).toISOString(), description: 'Dispatched through Delhivery.', updatedBy: 'superadmin@srisaimobiles.com' },
      { status: 'out_for_delivery', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 180 * 60000).toISOString(), description: 'Out for delivery with executive K. Raju.', updatedBy: 'System' },
      { status: 'delivered', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 240 * 60000).toISOString(), description: 'Delivered successfully and OTP verified.', updatedBy: 'K. Raju' }
    ],
    internalNotes: ['Customer paid advance via UPI.', 'Requested evening delivery - fulfilled.'],
    callLogs: [
      { id: 'call-1', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 5 * 60000).toISOString(), duration: '1m 20s', staffName: 'SriSai Super Admin', summary: 'Confirmed delivery address and evening time preference.' }
    ]
  },
  {
    id: 'SSM-ORD-881240',
    customerEmail: 'venkat@gmail.com',
    customerName: 'Venkat Rao',
    customerPhone: '9440123456',
    items: [
      {
        deviceId: 'oneplus-12',
        modelName: '12',
        brand: 'OnePlus',
        color: 'Flowy Emerald',
        ram: '12GB',
        storage: '256GB',
        quantity: 1,
        price: 59999,
        imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop'
      }
    ],
    subtotal: 59999,
    discount: 3000,
    gstAmount: 8694,
    deliveryFee: 49,
    total: 57048,
    shippingAddress: {
      id: 'addr-seed-2',
      fullName: 'Venkat Rao',
      phone: '9440123456',
      houseNumber: 'H.No 4-1-92',
      streetName: 'Ganesh Nagar',
      areaColony: 'Collectorate Road',
      city: 'Karimnagar',
      district: 'Karimnagar',
      state: 'Telangana',
      pincode: '505001',
      isDefault: false,
      deliveryInstructions: 'Call before delivery'
    },
    estimatedDeliveryDate: '1-2 Days Delivery',
    status: 'shipped',
    orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    deliveryType: 'home_delivery',
    deliveryPartner: 'Bluedart',
    trackingNumber: 'BD982014892',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    timeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), description: 'Order placed by customer.', updatedBy: 'Customer' },
      { status: 'confirmed', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 4 * 60 * 60000).toISOString(), description: 'Verified address via phone call.', updatedBy: 'admin@gmail.com' },
      { status: 'packed', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 6 * 60 * 60000).toISOString(), description: 'Packed with bubble wrap.', updatedBy: 'admin@gmail.com' },
      { status: 'shipped', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 10 * 60 * 60000).toISOString(), description: 'Shipped via Bluedart. Expected delivery tomorrow.', updatedBy: 'admin@gmail.com' }
    ],
    internalNotes: ['Customer confirmed COD details.', 'Requested calling 30 minutes before arrival.'],
    callLogs: [
      { id: 'call-2', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 3 * 60 * 60000).toISOString(), duration: '45s', staffName: 'SriSai Admin Partner', summary: 'Confirmed COD order, address details correct.' }
    ]
  },
  {
    id: 'SSM-ORD-902415',
    customerEmail: 'customer@gmail.com',
    customerName: 'Harshith M',
    customerPhone: '9876543210',
    items: [
      {
        deviceId: 'nothing-phone-2',
        modelName: 'Phone (2)',
        brand: 'Nothing',
        color: 'Dark Gray',
        ram: '12GB',
        storage: '256GB',
        quantity: 1,
        price: 37999,
        imageUrl: 'https://images.unsplash.com/photo-1691136979336-cab1459ec5c4?q=80&w=800&auto=format&fit=crop'
      }
    ],
    subtotal: 37999,
    discount: 3800,
    gstAmount: 5217,
    deliveryFee: 0,
    total: 34199,
    shippingAddress: {
      id: 'addr-seed-1',
      fullName: 'Harshith M',
      phone: '9876543210',
      alternatePhone: '9848022338',
      houseNumber: 'Flat No 2-4-53',
      apartmentName: 'Sai Residency',
      streetName: 'Main Road',
      landmark: 'Near Bus Stand',
      areaColony: 'Bazaar Area',
      city: 'Jagtial',
      district: 'Jagtial',
      state: 'Telangana',
      pincode: '505327',
      isDefault: true
    },
    estimatedDeliveryDate: 'Ready for Store Pickup',
    status: 'pending',
    orderDate: new Date().toISOString(),
    deliveryType: 'store_pickup',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '12:00 PM - 3:00 PM',
    pickupOtp: '849310',
    paymentMethod: 'store_payment',
    paymentStatus: 'pending',
    timeline: [
      { status: 'pending', timestamp: new Date().toISOString(), description: 'Order placed for store pickup.', updatedBy: 'Customer' }
    ],
    internalNotes: ['Customer will pay at store during pickup.', 'Will inspect condition grade A before picking up.']
  }
];

export const INITIAL_ACCESSORIES: any[] = [
  {
    id: 'acc-case-iphone15',
    category: 'cases',
    brand: 'Spigen',
    name: 'Ultra Hybrid Case for iPhone 15 Pro Max',
    price: 1999,
    offerPrice: 1499,
    stockCount: 15,
    description: 'Clear TPU bumper case with hard polycarbonate back. Features air cushion technology for drop protection and raised edges for screen/camera defense.',
    colors: ['Crystal Clear', 'Matte Black', 'Space Gray'],
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop'
    ],
    status: 'available',
    specifications: {
      'Material': 'TPU + Polycarbonate',
      'Compatibility': 'iPhone 15 Pro Max',
      'Wireless Charging Support': 'Yes',
      'MagSafe Compatible': 'Yes',
      'Drop Protection Height': '8 Feet'
    },
    features: [
      'Crystal clear transparency displays original phone design',
      'Raised bezels lift screen and camera off flat surfaces',
      'Pronounced buttons are easy to feel and press',
      'Large cutouts fit most cables'
    ],
    views: 120,
    sales: 12,
    createdAt: new Date().toISOString()
  },
  {
    id: 'acc-charger-65w',
    category: 'chargers',
    brand: 'Anker',
    name: 'Nano II 65W GaN Charger',
    price: 3999,
    offerPrice: 2999,
    stockCount: 8,
    description: 'Ultra-compact 65W fast charger powered by GaN II technology. Charge phones, tablets, and USB-C notebooks from a single tiny adapter.',
    colors: ['Black', 'White'],
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop'
    ],
    status: 'available',
    specifications: {
      'Output Wattage': '65W',
      'Charging Ports': '1x USB-C',
      'Technology': 'GaN II, PowerIQ 3.0',
      'Input Voltage': '100-240V'
    },
    features: [
      'GaN II technology allows 58% smaller size than standard chargers',
      'High-speed charging for iPhones, Samsung Galaxies, and MacBooks',
      'Foldable plug for enhanced portability',
      'MultiProtect safety system for absolute device protection'
    ],
    views: 95,
    sales: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'acc-cable-usbc',
    category: 'cables',
    brand: 'Belkin',
    name: 'BoostCharge Braided USB-C to USB-C Cable (2m)',
    price: 1499,
    offerPrice: 999,
    stockCount: 25,
    description: 'Double-braided nylon USB-C to USB-C cable. Supports USB-PD fast charging up to 60W and 480 Mbps data transfer speeds.',
    colors: ['Black', 'White', 'Blue'],
    images: [
      'https://images.unsplash.com/photo-1541660724482-628c67f35b28?q=80&w=800&auto=format&fit=crop'
    ],
    status: 'available',
    specifications: {
      'Cable Length': '2 Meters (6.6 ft)',
      'Connector Type': 'USB-C to USB-C',
      'Max Power Output': '60W (3A)',
      'Data Transfer Rate': '480 Mbps',
      'Material': 'Double-Braided Nylon'
    },
    features: [
      'Tested to survive 10,000+ bends for maximum durability',
      'Supports USB-C Power Delivery fast charging',
      'Double-braided outer jacket resists fraying and tangling',
      'USB-IF certified for safe and reliable operation'
    ],
    views: 45,
    sales: 18,
    createdAt: new Date().toISOString()
  },
  {
    id: 'acc-earphone-anc',
    category: 'earphones',
    brand: 'OnePlus',
    name: 'Nord Buds 2 Wireless Earbuds',
    price: 3299,
    offerPrice: 2799,
    stockCount: 14,
    description: 'True wireless earbuds with Active Noise Cancellation (ANC), BassWave algorithm, and up to 36 hours of total battery life with charging case.',
    colors: ['Lightning White', 'Thunder Gray'],
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop'
    ],
    status: 'available',
    specifications: {
      'Driver Size': '12.4mm Dynamic',
      'Noise Cancellation': 'ANC (up to 25dB)',
      'Bluetooth Version': 'Bluetooth 5.3',
      'Battery Life': 'Up to 7h (Buds) / 36h (with Case)',
      'Water Resistance': 'IP55 Rated'
    },
    features: [
      'Active Noise Cancellation blocks unwanted background noise',
      'BassWave algorithm delivers deep, rumbling bass lines',
      'IP55 water and sweat resistance for intense workouts',
      'Dual mics on each earbud for crystal clear call quality'
    ],
    views: 180,
    sales: 9,
    createdAt: new Date().toISOString()
  },
  {
    id: 'acc-watch-smart',
    category: 'smart_watches',
    brand: 'Noise',
    name: 'ColorFit Pro 5 Smartwatch',
    price: 4999,
    offerPrice: 3499,
    stockCount: 6,
    description: 'Feature-rich smartwatch with 1.85-inch AMOLED display, BT calling, functional crown, and 100+ sports modes with extensive health tracking.',
    colors: ['Classic Black', 'Silver Grey', 'Olive Green'],
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop'
    ],
    status: 'available',
    specifications: {
      'Display': '1.85" AMOLED (Always-On)',
      'Bluetooth Calling': 'Yes, Single-chip BT',
      'Battery Life': 'Up to 7 Days',
      'Water Resistance': 'IP68 Dust & Water Proof',
      'Sensors': 'HR, SpO2, Sleep Tracker, Stress'
    },
    features: [
      'Vibrant AMOLED screen with high brightness and functional crown wheel',
      'Make & receive phone calls directly from your wrist',
      'Track 100+ athletic activities with automated metric tracking',
      'Premium metal build with swappable strap design'
    ],
    views: 250,
    sales: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'acc-pb-20k',
    category: 'power_banks',
    brand: 'Mi',
    name: 'Boost Pro 20000mAh Power Bank 3i',
    price: 2499,
    offerPrice: 1999,
    stockCount: 11,
    description: 'High capacity 20,000mAh power bank supporting triple port output and 18W fast charging. Safe for daily travel and flight approvals.',
    colors: ['Sandstone Black'],
    images: [
      'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?q=80&w=800&auto=format&fit=crop'
    ],
    status: 'available',
    specifications: {
      'Battery Capacity': '20,000mAh (74Wh)',
      'Fast Charging Input': '18W (Micro-USB / USB-C)',
      'Output Ports': '2x USB-A, 1x USB-C',
      'Protection': '12-Layer Advanced Chip Protection'
    },
    features: [
      'Charge three devices simultaneously with smart power distribution',
      '18W fast charge capability saves hours in refueling',
      'Low power charging mode safely charges smart bands and bluetooth buds',
      'Durable textured grip material prevents scratches and slips'
    ],
    views: 110,
    sales: 7,
    createdAt: new Date().toISOString()
  }
];

