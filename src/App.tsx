import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroCarousel } from './components/HeroCarousel';
import { FlashSaleSection } from './components/FlashSaleSection';
import { ProductCard } from './components/ProductCard';
import { ProductDetailPage } from './components/ProductDetailPage';
import { ProductCompare } from './components/ProductCompare';
import { SearchOverlay } from './components/SearchOverlay';
import { AddressModal } from './components/AddressModal';
import { CartDrawer } from './components/CartDrawer';
import { LoginModal } from './components/LoginModal';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { ContactPage } from './components/ContactPage';
import { AdminPortal } from './admin/AdminPortal';
import { AccessoryDetailModal } from './components/AccessoryDetailModal';
import { SlidersHorizontal, Trash2, Heart, Smartphone, MessageCircle, Compass, Phone, MapPin, Tag, ArrowUpDown, X } from 'lucide-react';

const Instagram: React.FC<{ size?: number; style?: React.CSSProperties; fill?: string }> = ({ size = 20, style, fill = 'none' }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    stroke="currentColor" 
    strokeWidth="2" 
    fill={fill} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export const App: React.FC = () => {
  const { 
    dbLoading,
    dbError,
    retryDbConnection,
    bypassDbConnection,
    currentRoute, devices, accessories, wishlist, navigateTo, theme,
    instagramPosts, instagramSettings, trackInstagramPostView, trackInstagramPostClick,
    addToCart, toggleWishlist
  } = useApp();

  // Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Search/Filters states
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedRams, setSelectedRams] = useState<string[]>([]);
  const [selectedStorages, setSelectedStorages] = useState<string[]>([]);
  const [selectedBatteries, setSelectedBatteries] = useState<string[]>([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<string[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);

  // Inventory classification filters
  const [selectedDeviceTypes, setSelectedDeviceTypes] = useState<string[]>([]);
  const [filterUnderWarranty, setFilterUnderWarranty] = useState(false);
  const [filterBoxIncluded, setFilterBoxIncluded] = useState(false);
  const [filterChargerIncluded, setFilterChargerIncluded] = useState(false);
  const [filterBattery90Plus, setFilterBattery90Plus] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);

  // Sorting
  const [sortBy, setSortBy] = useState('featured');

  // Accessories Catalog States
  const [selectedAccessoryForDetail, setSelectedAccessoryForDetail] = useState<any>(null);
  const [selectedAccCategories, setSelectedAccCategories] = useState<string[]>([]);
  const [selectedAccBrands, setSelectedAccBrands] = useState<string[]>([]);
  const [selectedAccPriceRanges, setSelectedAccPriceRanges] = useState<string[]>([]);
  const [selectedAccAvailabilities, setSelectedAccAvailabilities] = useState<string[]>([]);
  const [accSortBy, setAccSortBy] = useState('featured');

  // Mobile responsive layout states
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<number | null>(null);

  // Trigger search from suggestions
  const handleSearchSubmit = (query: string) => {
    setSearchFilter(query);
    navigateTo('home');
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchFilter('');
    setSelectedBrands([]);
    setSelectedPriceRanges([]);
    setSelectedRams([]);
    setSelectedStorages([]);
    setSelectedBatteries([]);
    setSelectedAvailabilities([]);
    setSelectedOffers([]);
    setSelectedDeviceTypes([]);
    setFilterUnderWarranty(false);
    setFilterBoxIncluded(false);
    setFilterChargerIncluded(false);
    setFilterBattery90Plus(false);
    setSelectedGrades([]);
  };

  // Toggle helpers
  const toggleBrand = (b: string) => setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  const togglePriceRange = (p: string) => setSelectedPriceRanges(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleRam = (r: string) => setSelectedRams(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  const toggleStorage = (s: string) => setSelectedStorages(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleBattery = (b: string) => setSelectedBatteries(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  const toggleAvailability = (a: string) => setSelectedAvailabilities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  const toggleOffer = (o: string) => setSelectedOffers(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]);
  const toggleDeviceType = (t: string) => setSelectedDeviceTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleGrade = (g: string) => setSelectedGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  // Handle URL hash flags on mount
  useEffect(() => {
    const handleUrlParams = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#filter')) {
        const query = hash.split('?')[1];
        if (query) {
          const params = new URLSearchParams(query);
          const brandParam = params.get('brand');
          const offerParam = params.get('offers');
          
          if (brandParam) setSelectedBrands([brandParam]);
          if (offerParam) setSelectedOffers([offerParam]);
        }
      }

      // Auto-open accessory details modal by query ID
      if (hash.includes('accessories?id=')) {
        const params = new URLSearchParams(hash.split('?')[1] || '');
        const id = params.get('id');
        const accessory = accessories?.find(a => a.id === id);
        if (accessory) {
          setSelectedAccessoryForDetail(accessory);
        }
      } else if (hash.startsWith('#accessories/')) {
        const id = hash.split('/')[1];
        const accessory = accessories?.find(a => a.id === id);
        if (accessory) {
          setSelectedAccessoryForDetail(accessory);
        }
      }
    };
    handleUrlParams();
    window.addEventListener('hashchange', handleUrlParams);
    return () => window.removeEventListener('hashchange', handleUrlParams);
  }, []);

  // Effect to handle mobile scroll locking
  useEffect(() => {
    if (isMobileFilterOpen || isMobileSortOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFilterOpen, isMobileSortOpen]);

  // Close mobile overlays and handle cart route on navigation
  useEffect(() => {
    setIsMobileFilterOpen(false);
    setIsMobileSortOpen(false);
    if (currentRoute === 'cart') {
      setIsCartOpen(true);
    }
  }, [currentRoute]);

  // Touch handlers for swipe to close on filter drawer
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart !== null) {
      setTouchCurrent(e.targetTouches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStart !== null && touchCurrent !== null) {
      const diff = touchStart - touchCurrent; // Swipe left (closing drawer from left)
      if (diff > 80) {
        setIsMobileFilterOpen(false);
      }
    }
    setTouchStart(null);
    setTouchCurrent(null);
  };

  // Active filter count calculations
  const activeFiltersCount = 
    selectedBrands.length + 
    selectedPriceRanges.length + 
    selectedRams.length + 
    selectedStorages.length + 
    selectedBatteries.length + 
    selectedAvailabilities.length + 
    selectedOffers.length + 
    selectedDeviceTypes.length + 
    selectedGrades.length + 
    (filterUnderWarranty ? 1 : 0) + 
    (filterBoxIncluded ? 1 : 0) + 
    (filterChargerIncluded ? 1 : 0) + 
    (filterBattery90Plus ? 1 : 0) + 
    (searchFilter ? 1 : 0);

  const activeAccFiltersCount = 
    selectedAccCategories.length + 
    selectedAccBrands.length + 
    selectedAccPriceRanges.length + 
    selectedAccAvailabilities.length;

  const renderMobilesFiltersContent = () => {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </span>
          {(selectedBrands.length > 0 || selectedPriceRanges.length > 0 || selectedRams.length > 0 || selectedStorages.length > 0 || selectedBatteries.length > 0 || selectedAvailabilities.length > 0 || selectedOffers.length > 0 || searchFilter || selectedDeviceTypes.length > 0 || filterUnderWarranty || filterBoxIncluded || filterChargerIncluded || filterBattery90Plus || selectedGrades.length > 0) && (
            <button 
              onClick={handleResetFilters}
              style={{ border: 'none', background: 'none', color: 'var(--error)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Trash2 size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Device Classification Type Filter */}
        <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Device Classification</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            {[
              { label: 'Brand New Sealed', id: 'brand_new' },
              { label: 'Used / Pre-Owned', id: 'used' },
              { label: 'Open Box', id: 'open_box' },
              { label: 'Refurbished', id: 'refurbished' },
              { label: 'Demo Unit', id: 'demo_unit' }
            ].map(t => (
              <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedDeviceTypes.includes(t.id)} onChange={() => toggleDeviceType(t.id)} style={{ cursor: 'pointer' }} />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Conditions & Inbox Items Filter */}
        <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Diagnostics & Items</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={filterUnderWarranty} onChange={(e) => setFilterUnderWarranty(e.target.checked)} style={{ cursor: 'pointer' }} />
              <span>Under Active Warranty</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={filterBoxIncluded} onChange={(e) => setFilterBoxIncluded(e.target.checked)} style={{ cursor: 'pointer' }} />
              <span>Box Included</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={filterChargerIncluded} onChange={(e) => setFilterChargerIncluded(e.target.checked)} style={{ cursor: 'pointer' }} />
              <span>Original Charger OK</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={filterBattery90Plus} onChange={(e) => setFilterBattery90Plus(e.target.checked)} style={{ cursor: 'pointer' }} />
              <span>Battery Health 90%+</span>
            </label>
          </div>
        </div>

        {/* Used Grade Condition Filter */}
        <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Condition Grade</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            {[
              { label: 'Like New (A+)', id: 'A_plus' },
              { label: 'Excellent (A)', id: 'A' },
              { label: 'Good (B+)', id: 'B_plus' }
            ].map(g => (
              <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedGrades.includes(g.id)} onChange={() => toggleGrade(g.id)} style={{ cursor: 'pointer' }} />
                <span>{g.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Brand</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            {['Samsung', 'Apple', 'OnePlus', 'Nothing', 'Xiaomi', 'Vivo', 'Oppo', 'Realme', 'Motorola', 'Google'].map(b => (
              <label key={b} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} style={{ cursor: 'pointer' }} />
                <span>{b}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Price Range</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            {[
              { label: 'Under ₹10,000', id: 'under10' },
              { label: '₹10,000 - ₹20,000', id: '10to20' },
              { label: '₹20,000 - ₹30,000', id: '20to30' },
              { label: '₹30,000 - ₹50,000', id: '30to50' },
              { label: 'Above ₹50,000', id: 'above50' }
            ].map(p => (
              <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedPriceRanges.includes(p.id)} onChange={() => togglePriceRange(p.id)} style={{ cursor: 'pointer' }} />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* RAM Filter */}
        <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>RAM Memory</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            {['4GB', '6GB', '8GB', '12GB', '16GB'].map(r => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedRams.includes(r)} onChange={() => toggleRam(r)} />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Storage Filter */}
        <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Storage ROM</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            {['64GB', '128GB', '256GB', '512GB', '1TB'].map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedStorages.includes(s)} onChange={() => toggleStorage(s)} />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Battery */}
        <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Battery Capacity</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            {[
              { label: '4000mAh+', id: '4000plus' },
              { label: '5000mAh+', id: '5000plus' },
              { label: '6000mAh+', id: '6000plus' }
            ].map(b => (
              <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedBatteries.includes(b.id)} onChange={() => toggleBattery(b.id)} />
                <span>{b.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Availability</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            {[
              { label: 'In Stock', id: 'instock' },
              { label: 'Out of Stock', id: 'out' }
            ].map(a => (
              <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAvailabilities.includes(a.id)} onChange={() => toggleAvailability(a.id)} />
                <span>{a.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Offers */}
        <div style={{ marginBottom: '6px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Active Offers</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            {['Exchange Offer', 'Bank Offer', 'No Cost EMI'].map(o => (
              <label key={o} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedOffers.includes(o)} onChange={() => toggleOffer(o)} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </div>
      </>
    );
  };

  const renderAccessoriesFiltersContent = () => {
    const uniqueBrands = Array.from(new Set(accessories.map(a => a.brand)));
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </span>
          {(selectedAccCategories.length > 0 || selectedAccBrands.length > 0 || selectedAccPriceRanges.length > 0 || selectedAccAvailabilities.length > 0) && (
            <button 
              onClick={() => {
                setSelectedAccCategories([]);
                setSelectedAccBrands([]);
                setSelectedAccPriceRanges([]);
                setSelectedAccAvailabilities([]);
              }}
              style={{ border: 'none', background: 'none', color: 'var(--error)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Reset
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Category</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { key: 'cases', label: 'Cases & Covers' },
              { key: 'chargers', label: 'Chargers & Adapters' },
              { key: 'cables', label: 'Cables & Connectors' },
              { key: 'earphones', label: 'Earphones & Audio' },
              { key: 'smart_watches', label: 'Smart Watches' },
              { key: 'power_banks', label: 'Power Banks' }
            ].map(cat => (
              <label key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedAccCategories.includes(cat.key)} 
                  onChange={() => setSelectedAccCategories(prev => prev.includes(cat.key) ? prev.filter(c => c !== cat.key) : [...prev, cat.key])} 
                />
                <span>{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Brand</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {uniqueBrands.map(b => (
              <label key={b} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedAccBrands.includes(b)} 
                  onChange={() => setSelectedAccBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])} 
                />
                <span>{b}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Price Range</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { key: 'under500', label: 'Under ₹500' },
              { key: '500to1000', label: '₹500 - ₹1,000' },
              { key: '1000to2000', label: '₹1,000 - ₹2,000' },
              { key: 'above2000', label: 'Above ₹2,000' }
            ].map(range => (
              <label key={range.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedAccPriceRanges.includes(range.key)} 
                  onChange={() => setSelectedAccPriceRanges(prev => prev.includes(range.key) ? prev.filter(r => r !== range.key) : [...prev, range.key])} 
                />
                <span>{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Stock Availability */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Stock Availability</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input 
                type="checkbox" 
                checked={selectedAccAvailabilities.includes('instock')} 
                onChange={() => setSelectedAccAvailabilities(prev => prev.includes('instock') ? prev.filter(x => x !== 'instock') : [...prev, 'instock'])} 
              />
              <span>In Stock</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input 
                type="checkbox" 
                checked={selectedAccAvailabilities.includes('out')} 
                onChange={() => setSelectedAccAvailabilities(prev => prev.includes('out') ? prev.filter(x => x !== 'out') : [...prev, 'out'])} 
              />
              <span>Out of Stock</span>
            </label>
          </div>
        </div>
      </>
    );
  };

  // SEO & Schema Structured Data
  useEffect(() => {
    // 1. Update document title
    if (currentRoute === 'home') {
      document.title = "Sri Sai Mobiles | Buy Sell Exchange Mobiles in Jagtial";
    } else if (currentRoute === 'accessories' || currentRoute.startsWith('accessories')) {
      document.title = "Accessories Store | Sri Sai Mobiles Jagtial";
    } else if (currentRoute === 'contact') {
      document.title = "Contact Us | Sri Sai Mobiles Jagtial";
    } else if (currentRoute === 'wishlist') {
      document.title = "Your Wishlist | Sri Sai Mobiles";
    } else if (currentRoute === 'cart') {
      document.title = "Shopping Cart | Sri Sai Mobiles";
    } else if (currentRoute.startsWith('product/')) {
      const parts = currentRoute.split('/');
      const id = parts[1];
      const d = devices.find(x => x.id === id);
      if (d) {
        document.title = `${d.brand} ${d.modelName} (${d.variant}) | Sri Sai Mobiles`;
      }
    }

    // 2. Set Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Buy new mobiles, used phones, exchange devices, and accessories at Sri Sai Mobiles, Jagtial. Best prices, trusted service, and premium customer experience.');

    // 3. Inject Local Business Schema JSON-LD
    let schemaScript = document.getElementById('srisai-localbusiness-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'srisai-localbusiness-schema';
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "MobilePhoneStore",
      "name": "Sri Sai Mobiles",
      "image": window.location.origin + "/logo.jpg",
      "@id": window.location.origin + "/#localbusiness",
      "url": window.location.origin,
      "telephone": "+91 8688303048",
      "priceRange": "₹₹",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Opposite Big C, Angadi Bazar",
        "addressLocality": "Jagtial",
        "addressRegion": "Telangana",
        "postalCode": "505327",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 18.7930915,
        "longitude": 78.9185849
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
          ],
          "opens": "10:00",
          "closes": "21:00"
        }
      ],
      "sameAs": [
        "https://www.instagram.com/sri_sai_mobiles3048/",
        "https://www.whatsapp.com/channel/0029VbDEZqR1noz4vtAjLc1B"
      ]
    };

    schemaScript.innerHTML = JSON.stringify(schemaData, null, 2);
  }, [currentRoute, devices]);

  // Filter Catalog Logic
  const filteredDevices = devices.filter(d => {
    if (d.status === 'archived') return false;

    // Search query check
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchBrand = d.brand.toLowerCase().includes(q);
      const matchModel = d.modelName.toLowerCase().includes(q);
      const matchSpecs = d.processor.toLowerCase().includes(q) || d.variant.toLowerCase().includes(q);
      if (!matchBrand && !matchModel && !matchSpecs) return false;
    }

    // Brands check
    if (selectedBrands.length > 0 && !selectedBrands.includes(d.brand)) return false;

    // Price ranges check
    if (selectedPriceRanges.length > 0) {
      let priceMatch = false;
      const price = d.offerPrice;
      
      if (selectedPriceRanges.includes('under10') && price < 10000) priceMatch = true;
      if (selectedPriceRanges.includes('10to20') && price >= 10000 && price <= 20000) priceMatch = true;
      if (selectedPriceRanges.includes('20to30') && price >= 20000 && price <= 30000) priceMatch = true;
      if (selectedPriceRanges.includes('30to50') && price >= 30000 && price <= 50000) priceMatch = true;
      if (selectedPriceRanges.includes('above50') && price > 50000) priceMatch = true;

      if (!priceMatch) return false;
    }

    // RAM check
    if (selectedRams.length > 0 && !selectedRams.some(r => d.ram.includes(r))) return false;

    // Storage check
    if (selectedStorages.length > 0 && !selectedStorages.some(s => d.storage.includes(s))) return false;

    // Battery check
    if (selectedBatteries.length > 0) {
      let batMatch = false;
      const capacity = parseInt(d.battery.match(/\d+/) ? (d.battery.match(/\d+/) as any)[0] : '0', 10);
      
      if (selectedBatteries.includes('4000plus') && capacity >= 4000) batMatch = true;
      if (selectedBatteries.includes('5000plus') && capacity >= 5000) batMatch = true;
      if (selectedBatteries.includes('6000plus') && capacity >= 6000) batMatch = true;

      if (!batMatch) return false;
    }

    // Availability check
    if (selectedAvailabilities.length > 0) {
      let avMatch = false;
      if (selectedAvailabilities.includes('instock') && d.stockCount > 0) avMatch = true;
      if (selectedAvailabilities.includes('out') && d.stockCount === 0) avMatch = true;
      if (!avMatch) return false;
    }

    // Offers check
    if (selectedOffers.length > 0) {
      let offerMatch = false;
      // Seed details mapping or dummy
      if (selectedOffers.includes('Exchange') && (d.brand === 'Apple' || d.brand === 'Samsung')) offerMatch = true;
      if (selectedOffers.includes('Bank') && d.offerPrice >= 30000) offerMatch = true;
      if (selectedOffers.includes('No Cost EMI') && d.offerPrice >= 20000) offerMatch = true;

      if (!offerMatch) return false;
    }

    // Dynamic Inventory Classification Filters
    if (selectedDeviceTypes.length > 0 && !selectedDeviceTypes.includes(d.deviceType)) return false;

    if (filterUnderWarranty) {
      let hasWarranty = false;
      if (d.deviceType === 'brand_new') {
        hasWarranty = d.officialBrandWarrantyAvailable !== false;
      } else if (d.deviceType === 'open_box') {
        hasWarranty = true;
      } else if (d.deviceType === 'refurbished') {
        hasWarranty = !!d.refurbishedWarrantyOffered && !d.refurbishedWarrantyOffered.toLowerCase().includes('no warranty');
      } else if (d.deviceType === 'demo_unit') {
        hasWarranty = d.demoWarrantyStatus !== 'Warranty Expired';
      } else if (d.deviceType === 'used') {
        hasWarranty = d.currentWarrantyStatus === 'under_brand' || d.currentWarrantyStatus === 'under_extended';
      }
      if (!hasWarranty) return false;
    }

    if (filterBoxIncluded) {
      let hasBox = false;
      if (d.deviceType === 'brand_new') {
        hasBox = true;
      } else if (d.deviceType === 'open_box') {
        hasBox = d.openBoxBoxAvailable !== false;
      } else if (d.deviceType === 'used') {
        hasBox = !!d.boxAvailable;
      } else if (d.deviceType === 'refurbished' || d.deviceType === 'demo_unit') {
        hasBox = true;
      }
      if (!hasBox) return false;
    }

    if (filterChargerIncluded) {
      let hasCharger = false;
      if (d.deviceType === 'brand_new') {
        hasCharger = true;
      } else if (d.deviceType === 'open_box') {
        hasCharger = d.openBoxAccessoriesAvailable !== false;
      } else if (d.deviceType === 'used') {
        hasCharger = !!d.originalChargerAvailable;
      } else if (d.deviceType === 'refurbished' || d.deviceType === 'demo_unit') {
        hasCharger = true;
      }
      if (!hasCharger) return false;
    }

    if (filterBattery90Plus) {
      let goodBattery = false;
      if (d.deviceType === 'brand_new' || d.deviceType === 'open_box' || d.deviceType === 'demo_unit' || d.deviceType === 'refurbished') {
        goodBattery = true;
      } else if (d.deviceType === 'used') {
        goodBattery = d.batteryHealth !== undefined && d.batteryHealth >= 90;
      }
      if (!goodBattery) return false;
    }

    if (selectedGrades.length > 0) {
      if (d.deviceType === 'used') {
        if (!d.deviceConditionGrade || !selectedGrades.includes(d.deviceConditionGrade)) return false;
      } else if (d.deviceType === 'refurbished') {
        const gradeText = d.refurbishedGrade?.toLowerCase() || '';
        let matches = false;
        if (selectedGrades.includes('A_plus') && (gradeText.includes('a+') || gradeText.includes('like new'))) matches = true;
        if (selectedGrades.includes('A') && (gradeText.includes('(a)') || gradeText.includes('excellent'))) matches = true;
        if (selectedGrades.includes('B_plus') && (gradeText.includes('b+') || gradeText.includes('good'))) matches = true;
        if (!matches) return false;
      } else {
        if (selectedGrades.includes('A_plus') || selectedGrades.includes('A')) {
          // Brand New, Open Box, Demo units are top tier
        } else {
          return false;
        }
      }
    }

    return true;
  });

  // Sorting Catalog Logic
  const sortedDevices = [...filteredDevices].sort((a, b) => {
    if (sortBy === 'priceLow') return a.offerPrice - b.offerPrice;
    if (sortBy === 'priceHigh') return b.offerPrice - a.offerPrice;
    if (sortBy === 'popular') return b.views - a.views;
    if (sortBy === 'sales') return b.sales - a.sales;
    if (sortBy === 'name') return a.modelName.localeCompare(b.modelName);
    return 0; // featured/default
  });

  // 1. Accessories Filter Logic
  const filteredAccessories = accessories.filter(a => {
    // Hidden status check
    if (a.status === 'archived') return false;

    // Search filter check
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const match = 
        a.name.toLowerCase().includes(q) ||
        a.brand.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Categories filter
    if (selectedAccCategories.length > 0 && !selectedAccCategories.includes(a.category)) return false;

    // Brands filter
    if (selectedAccBrands.length > 0 && !selectedAccBrands.includes(a.brand)) return false;

    // Price ranges check
    if (selectedAccPriceRanges.length > 0) {
      let priceMatch = false;
      const price = a.offerPrice;
      if (selectedAccPriceRanges.includes('under500') && price < 500) priceMatch = true;
      if (selectedAccPriceRanges.includes('500to1000') && price >= 500 && price <= 1000) priceMatch = true;
      if (selectedAccPriceRanges.includes('1000to2000') && price >= 1000 && price <= 2000) priceMatch = true;
      if (selectedAccPriceRanges.includes('above2000') && price > 2000) priceMatch = true;
      if (!priceMatch) return false;
    }

    // Availability status check
    if (selectedAccAvailabilities.length > 0) {
      let avMatch = false;
      if (selectedAccAvailabilities.includes('instock') && a.stockCount > 0) avMatch = true;
      if (selectedAccAvailabilities.includes('out') && a.stockCount === 0) avMatch = true;
      if (!avMatch) return false;
    }

    return true;
  });

  // 2. Accessories Sorting Logic
  const sortedAccessories = [...filteredAccessories].sort((a, b) => {
    if (accSortBy === 'priceLow') return a.offerPrice - b.offerPrice;
    if (accSortBy === 'priceHigh') return b.offerPrice - a.offerPrice;
    if (accSortBy === 'popular') return b.views - a.views;
    if (accSortBy === 'sales') return b.sales - a.sales;
    return 0; // default/featured
  });

  // Dynamic Instagram Feed Component
  const InstagramFeed: React.FC<{ position: 'top' | 'middle' | 'bottom' | 'offers' | 'featured' }> = ({ position }) => {
    const showSection = instagramSettings.showSection;

    const activePosts = instagramPosts.filter(post => {
      const matchPos = post.position === position;
      const isActive = post.isActive;
      const isNotExpired = !post.expiryDate || new Date(post.expiryDate) >= new Date();
      return matchPos && isActive && isNotExpired;
    });

    const postsToShow = [...activePosts].sort((a, b) => a.displayOrder - b.displayOrder).slice(0, instagramSettings.postsCount);

    useEffect(() => {
      if (showSection && postsToShow.length > 0) {
        postsToShow.forEach(post => {
          trackInstagramPostView(post.id);
        });
      }
    }, [showSection, postsToShow.map(p => p.id).join(',')]);

    if (!showSection) return null;
    if (activePosts.length === 0) return null;

    return (
      <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '30px', paddingBottom: '10px' }}>
        {instagramSettings.showSectionTitle && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Instagram size={20} style={{ color: '#E1306C' }} />
                <span>{instagramSettings.sectionTitle}</span>
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{instagramSettings.sectionSubtitle}</p>
            </div>
            {instagramSettings.showFollowButton && (
              <a 
                href="https://www.instagram.com/sri_sai_mobiles3048/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="premium-btn btn-secondary" 
                style={{ borderRadius: '20px', fontSize: '12px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Instagram size={14} />
                <span>Follow Us</span>
              </a>
            )}
          </div>
        )}

        {instagramSettings.layout === 'carousel' ? (
          <div 
            style={{ 
              display: 'flex', 
              overflowX: 'auto', 
              gap: '16px', 
              paddingBottom: '12px',
              scrollbarWidth: 'thin'
            }}
            className="carousel-container"
          >
            {postsToShow.map(post => (
              <a 
                key={post.id}
                href={post.url}
                onClick={() => trackInstagramPostClick(post.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card"
                style={{ 
                  position: 'relative', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  width: '180px',
                  height: '180px',
                  display: 'block',
                  padding: 0,
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  const overlay = e.currentTarget.querySelector('.post-overlay') as HTMLElement;
                  if (overlay) overlay.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  const overlay = e.currentTarget.querySelector('.post-overlay') as HTMLElement;
                  if (overlay) overlay.style.opacity = '0';
                }}
              >
                <img src={post.thumbnailUrl} alt={post.customTitle || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div 
                  className="post-overlay"
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s', gap: '10px', color: 'white', fontSize: '13px', fontWeight: 'bold'
                  }}
                >
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '1px', textAlign: 'center', padding: '0 4px' }}>
                    {post.customTitle || 'Unboxing & Review'}
                  </span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Instagram size={14} fill="white" />
                    <span>Watch Now</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '16px' 
          }}>
            {postsToShow.map(post => (
              <a 
                key={post.id}
                href={post.url}
                onClick={() => trackInstagramPostClick(post.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card"
                style={{ 
                  position: 'relative', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  aspectRatio: '1', 
                  display: 'block',
                  padding: 0,
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  const overlay = e.currentTarget.querySelector('.post-overlay') as HTMLElement;
                  if (overlay) overlay.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  const overlay = e.currentTarget.querySelector('.post-overlay') as HTMLElement;
                  if (overlay) overlay.style.opacity = '0';
                }}
              >
                <img src={post.thumbnailUrl} alt={post.customTitle || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div 
                  className="post-overlay"
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s', gap: '10px', color: 'white', fontSize: '13px', fontWeight: 'bold'
                  }}
                >
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '1px', textAlign: 'center', padding: '0 4px' }}>
                    {post.customTitle || 'Unboxing & Review'}
                  </span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Instagram size={14} fill="white" />
                    <span>Watch Now</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
    if (currentRoute === 'cart') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        navigateTo('home');
      }
    }
  };

  // Router Layout resolution
  const renderRoute = () => {
    if (currentRoute === 'home' || currentRoute.startsWith('filter') || currentRoute === 'cart') {
      const instagramDevices = devices.filter(d => d.seenOnInstagram && d.status !== 'archived');
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Banner Hero */}
          <HeroCarousel />
          
          {/* Instagram Feed (Top Position) */}
          <InstagramFeed position="top" />
          {/* Limited Time Countdown sales */}
          <FlashSaleSection />

          {/* Mobile Filter & Sort Toolbar */}
          <div className="mobile-toolbar glass">
            <button className="mobile-toolbar-btn" onClick={() => setIsMobileFilterOpen(true)}>
              <SlidersHorizontal size={14} />
              <span>Filter {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>
            <div className="mobile-toolbar-divider" />
            <button className="mobile-toolbar-btn" onClick={() => setIsMobileSortOpen(true)}>
              <ArrowUpDown size={14} />
              <span>Sort By</span>
            </button>
          </div>

          {/* Catalog grid feature area */}
          <div className="catalog-layout">
            
            {/* Filter Sidebar Left Column */}
            <aside className="glass-card filter-sidebar" style={{ padding: '20px', borderRadius: '20px', position: 'sticky', top: '90px' }}>
              {renderMobilesFiltersContent()}
            </aside>

            {/* Catalog Grid Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Toolbar: Sorting & Count */}
              <div className="glass-card" style={{ padding: '12px 20px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <div>
                  Showing <strong>{sortedDevices.length}</strong> Products
                  {searchFilter && <span> for search: "<strong>{searchFilter}</strong>"</span>}
                </div>
                
                <div className="desktop-only-flex" style={{ alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sort by:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field"
                    style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px', width: '160px' }}
                  >
                    <option value="featured">Featured Deals</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="popular">Popularity (Views)</option>
                    <option value="sales">Best Selling</option>
                    <option value="name">Model Alphabetical</option>
                  </select>
                </div>
              </div>

              {/* Product Card Grid */}
              {sortedDevices.length === 0 ? (
                <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Smartphone size={48} strokeWidth={1} style={{ marginBottom: '12px' }} />
                  <p>No products match the selected filters.</p>
                  <button onClick={handleResetFilters} className="premium-btn btn-primary" style={{ marginTop: '12px', borderRadius: '20px', fontSize: '12px' }}>
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid-responsive">
                  {sortedDevices.map(device => (
                    <ProductCard key={device.id} device={device} />
                  ))}
                </div>
              )}

            </div>

          </div>

          {/* Customer Trust Section */}
          <div className="glass-card" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
            gap: '20px',
            padding: '24px 30px',
            borderRadius: '20px',
            marginTop: '10px',
            textAlign: 'center'
          }}>
            {[
              { title: 'Trusted Local Store', desc: "Jagtial's premier mobile showroom" },
              { title: '40K+ Followers', desc: 'Join our popular Instagram community' },
              { title: 'Buy • Sell • Exchange', desc: 'Best value for your old smartphones' },
              { title: 'Guaranteed Prices', desc: 'Genuine products & store warranty support' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>✓ {item.title}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.desc}</span>
              </div>
            ))}
          </div>

          {/* Visit Our Store Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '24px',
            marginTop: '20px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '30px'
          }}>
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <MapPin size={18} style={{ color: 'var(--primary)' }} />
                <span>Visit Our Showroom</span>
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.4, margin: 0 }}>
                <strong>Sri Sai Mobiles</strong><br />
                Opposite Big C, Angadi Bazar, Jagtial,<br />
                Telangana - 505327, India
              </p>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                🕒 Mon-Sat: 10:00 AM - 09:00 PM | Sunday: Closed
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                <a 
                  href="https://www.google.com/maps/place/SRI+SAI+MOBILES/@18.7930915,78.9185849,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcd138e3c1d0c5f:0x306a24477dfe4ccb!8m2!3d18.7930915!4d78.9185849!16s%2Fg%2F11bwyytv11" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="premium-btn btn-primary"
                  style={{ flex: '1 1 120px', fontSize: '12px', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Compass size={14} />
                  <span>Get Directions</span>
                </a>
                <a 
                  href="tel:+918688303048"
                  className="premium-btn btn-secondary"
                  style={{ flex: '1 1 120px', fontSize: '12px', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Phone size={14} />
                  <span>Call Now</span>
                </a>
              </div>
            </div>

            {/* Embedded Google Map iframe in showroom widget */}
            <div className="glass-card" style={{ padding: '10px', borderRadius: '20px', height: '220px' }}>
              <iframe
                title="Sri Sai Mobiles Jagtial Location"
                src="https://maps.google.com/maps?q=18.7930915,78.9185849&z=17&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '14px' }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* Instagram Feed (Middle Position) */}
          <InstagramFeed position="middle" />

          {/* WhatsApp Channel Promo Card */}
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(18, 140, 126, 0.08) 100%)',
            border: '1px solid rgba(37, 211, 102, 0.2)',
            padding: '24px',
            borderRadius: '20px',
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: 'min(100%, 260px)' }}>
              <span style={{
                fontSize: '10px', backgroundColor: 'rgba(37, 211, 102, 0.15)', color: '#128C7E',
                padding: '3px 10px', borderRadius: '10px', fontWeight: 'bold', textTransform: 'uppercase'
              }}>
                💬 Stay Updated
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0 4px 0', color: 'var(--text-main)' }}>Join our WhatsApp Channel</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                Get instant notifications on fresh stock arrivals, price drops, and special exchange offers in Jagtial.
              </p>
            </div>
            
            <a 
              href="https://www.whatsapp.com/channel/0029VbDEZqR1noz4vtAjLc1B" 
              target="_blank" 
              rel="noopener noreferrer"
              className="premium-btn btn-primary"
              style={{ 
                padding: '12px 24px', borderRadius: '12px', fontSize: '13px', display: 'inline-flex', 
                alignItems: 'center', gap: '8px', fontWeight: 700, backgroundColor: '#25D366', borderColor: '#25D366'
              }}
            >
              <MessageCircle size={16} fill="white" style={{ color: 'white' }} />
              <span>Join Channel Now</span>
            </a>
          </div>

          {/* A. Seen on Instagram Product Slider */}
          {instagramDevices.length > 0 && (
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Instagram size={20} style={{ color: '#E1306C' }} />
                    <span>🔥 Seen on Instagram</span>
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Smartphones currently trending on our social reels.</p>
                </div>
                <a 
                  href="https://www.instagram.com/sri_sai_mobiles3048/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
                >
                  View All Reels &rarr;
                </a>
              </div>

              <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}>
                {instagramDevices.map(d => (
                  <ProductCard key={d.id} device={d} />
                ))}
              </div>
            </div>
          )}

          {/* B. Dynamic Instagram Feed (Bottom Position) */}
          <InstagramFeed position="bottom" />

        </div>
      );
    }

    if (currentRoute.startsWith('product/')) {
      const parts = currentRoute.split('/');
      const id = parts[1];
      return <ProductDetailPage deviceId={id} />;
    }

    if (currentRoute.startsWith('admin')) {
      return <AdminPortal />;
    }

    if (currentRoute === 'wishlist') {
      const wishlistedDevices = devices.filter(d => wishlist.includes(d.id) && d.status !== 'archived');
      return (
        <div style={{ padding: '20px 0' }} className="animate-fade">
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={24} fill="var(--error)" style={{ color: 'var(--error)' }} />
              <span>Your Wishlist</span>
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Smartphones you saved for later checkout.</p>
          </div>

          {wishlistedDevices.length === 0 ? (
            <div className="glass-card" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Heart size={48} strokeWidth={1} style={{ marginBottom: '12px' }} />
              <p>Your wishlist is empty.</p>
              <button onClick={() => navigateTo('home')} className="premium-btn btn-primary" style={{ marginTop: '12px', borderRadius: '20px', fontSize: '12px' }}>
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid-responsive">
              {wishlistedDevices.map(d => (
                <ProductCard key={d.id} device={d} />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (currentRoute === 'accessories' || currentRoute.startsWith('accessories')) {
      return (
        <div style={{ padding: '20px 0' }} className="animate-fade">
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={24} style={{ color: 'var(--primary)' }} />
                <span>Sri Sai Mobiles Accessories Store</span>
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Buy premium cases, GaN fast chargers, dynamic earphones, smart watches, and travel power banks.
              </p>
            </div>
            
            <div className="desktop-only-flex" style={{ gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sort by</span>
              <select
                value={accSortBy}
                onChange={(e) => setAccSortBy(e.target.value)}
                className="input-field"
                style={{ height: '36px', padding: '0 8px', fontSize: '12px', borderRadius: '8px', width: '150px' }}
              >
                <option value="featured">Featured / Newest</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="popular">Popularity (Views)</option>
                <option value="sales">Best Sellers (Sales)</option>
              </select>
            </div>
          </div>

          {/* Mobile Filter & Sort Toolbar */}
          <div className="mobile-toolbar glass">
            <button className="mobile-toolbar-btn" onClick={() => setIsMobileFilterOpen(true)}>
              <SlidersHorizontal size={14} />
              <span>Filter {activeAccFiltersCount > 0 ? `(${activeAccFiltersCount})` : ''}</span>
            </button>
            <div className="mobile-toolbar-divider" />
            <button className="mobile-toolbar-btn" onClick={() => setIsMobileSortOpen(true)}>
              <ArrowUpDown size={14} />
              <span>Sort By</span>
            </button>
          </div>

          <div className="catalog-layout">
            
            {/* Filter Sidebar Left Column */}
            <aside className="glass-card filter-sidebar" style={{ padding: '20px', borderRadius: '20px', position: 'sticky', top: '90px' }}>
              {renderAccessoriesFiltersContent()}
            </aside>

            {/* Grid display column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {sortedAccessories.length === 0 ? (
                <div className="glass-card" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Tag size={48} strokeWidth={1} style={{ marginBottom: '12px' }} />
                  <p>No accessories match your chosen filter constraints.</p>
                </div>
              ) : (
                <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))' }}>
                  {sortedAccessories.map(acc => {
                    const discountPercent = acc.price > acc.offerPrice ? Math.round(((acc.price - acc.offerPrice) / acc.price) * 100) : 0;
                    return (
                      <div 
                        key={acc.id} 
                        className="glass-card clickable-card animate-scale-up"
                        onClick={() => setSelectedAccessoryForDetail(acc)}
                        style={{ padding: '12px', display: 'flex', flexDirection: 'column', position: 'relative' }}
                      >
                        {/* Discount badge */}
                        {discountPercent > 0 && (
                          <span style={{
                            position: 'absolute', top: '10px', left: '10px', zIndex: 5,
                            backgroundColor: 'var(--success)', color: 'white', fontSize: '10px',
                            fontWeight: 800, padding: '2px 8px', borderRadius: '6px'
                          }}>
                            {discountPercent}% OFF
                          </span>
                        )}

                        {/* Image wrapper */}
                        <div style={{
                          width: '100%', aspectRatio: '1.2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: 'var(--bg-subtle)', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px'
                        }}>
                          <img src={acc.images[0] || 'logo.jpg'} alt={acc.name} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                        </div>

                        {/* Text detail metadata */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, textAlign: 'left' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{acc.brand}</span>
                          <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: 1.4 }}>
                            {acc.name}
                          </h4>
                          
                          {/* Rating and status */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>⭐ 4.5 Rated</span>
                            <span style={{ 
                              fontSize: '9px', fontWeight: 'bold', 
                              color: acc.stockCount === 0 ? 'var(--error)' : 'var(--success)'
                            }}>
                              {acc.stockCount === 0 ? 'Out of Stock' : 'In Stock'}
                            </span>
                          </div>

                          {/* Pricing */}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px' }}>
                            <strong style={{ fontSize: '15px', color: 'var(--text-main)' }}>₹{acc.offerPrice.toLocaleString('en-IN')}</strong>
                            {discountPercent > 0 && (
                              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '11px' }}>₹{acc.price.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>

                        {/* Quick Action Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (acc.stockCount > 0) {
                              addToCart(acc.id, acc.colors[0] || 'Default');
                              setIsCartOpen(true);
                            } else {
                              setSelectedAccessoryForDetail(acc);
                            }
                          }}
                          className={`premium-btn ${acc.stockCount > 0 ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ width: '100%', padding: '8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', marginTop: '12px' }}
                        >
                          {acc.stockCount > 0 ? 'Add to Cart' : 'View Details'}
                        </button>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      );
    }

    if (currentRoute === 'contact') {
      return <ContactPage />;
    }

    return (
      <div style={{ 
        padding: '100px 20px', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        maxWidth: '500px',
        margin: '0 auto'
      }} className="animate-scale-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--primary)' }} />
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 800, 
            fontSize: '24px',
            background: 'linear-gradient(90deg, var(--primary), var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            SRI SAI MOBILES
          </h2>
        </div>
        <div style={{ fontSize: '72px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>404</div>
        <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '10px 0 0 0' }}>Page Not Found</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
          Oops! The page you are looking for does not exist, has been removed, or is temporarily unavailable.
        </p>
        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
          <button 
            onClick={() => navigateTo('home')} 
            className="premium-btn btn-primary" 
            style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '13px' }}
          >
            Back to Home
          </button>
          <button 
            onClick={() => navigateTo('home')} 
            className="premium-btn btn-secondary" 
            style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '13px' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  };

  const isRouteAdmin = currentRoute.startsWith('admin');

  if (dbLoading || dbError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '20px',
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '24px',
        textAlign: 'center'
      }}>
        {dbError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '380px' }}>
            <div style={{ color: '#ef4444', fontSize: '32px' }}>⚠️</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Database Connection Failed</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              {dbError}
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button 
                onClick={retryDbConnection} 
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Retry Connection
              </button>
              <button 
                onClick={bypassDbConnection} 
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #334155',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Continue Offline
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '4px solid rgba(255, 255, 255, 0.1)',
              borderTopColor: '#3b82f6',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Connecting to Sri Sai database...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* 1. Header (only on store side) */}
      {!isRouteAdmin && (
        <Header 
          onOpenCart={() => setIsCartOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenAddress={() => setIsAddressOpen(true)}
          onOpenCompare={() => setIsCompareOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      )}

      {/* 2. Main Page Router Container */}
      {isRouteAdmin ? (
        <div style={{ flex: 1 }}>{renderRoute()}</div>
      ) : (
        <main className="container" style={{ flex: 1, paddingBottom: '60px' }}>
          {renderRoute()}
        </main>
      )}

      {/* 3. Footer (only on store side) */}
      {!isRouteAdmin && (
        <footer style={{
          backgroundColor: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border-color)',
          padding: '40px 0',
          fontSize: '13px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginTop: 'auto'
        }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-main)', fontSize: '15px' }}>SRI SAI MOBILES</span>
            <span>Premium Smartphone Retail & E-Commerce Service Hub</span>
            <span>Jagitial Main Rd, Near Clock Tower, Jagitial, Telangana - 505327</span>
            
            {/* Instagram social hook */}
            <a 
              href="https://www.instagram.com/sri_sai_mobiles3048/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                backgroundColor: 'var(--card-bg)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '12px',
                marginTop: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E1306C';
                e.currentTarget.style.color = '#E1306C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-main)';
              }}
            >
              <Instagram size={14} />
              <span>Follow us @sri_sai_mobiles3048 (40.3K+ Followers)</span>
            </a>

            <div style={{ fontSize: '11px', marginTop: '10px', opacity: 0.8 }}>
              &copy; {new Date().getFullYear()} Sri Sai Mobiles. All Rights Reserved. Built as a Premium PWA Platform.
            </div>

          </div>
        </footer>
      )}

      {/* 4. Overlay Modals Manager */}
      <CartDrawer 
        isOpen={isCartOpen || currentRoute === 'cart'}
        onClose={handleCartClose}
        onOpenLogin={() => { setIsCartOpen(false); setIsLoginOpen(true); }}
        onOpenAddress={() => { setIsCartOpen(false); setIsAddressOpen(true); }}
      />

      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <AddressModal 
        isOpen={isAddressOpen}
        onClose={() => setIsAddressOpen(false)}
      />

      <ProductCompare 
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />

      <SearchOverlay 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearchSubmit={handleSearchSubmit}
      />

      {selectedAccessoryForDetail && (
        <AccessoryDetailModal
          accessory={selectedAccessoryForDetail}
          onClose={() => setSelectedAccessoryForDetail(null)}
          onOpenCart={() => { setSelectedAccessoryForDetail(null); setIsCartOpen(true); }}
        />
      )}

      {/* Mobile Filters slide-in drawer from left */}
      {isMobileFilterOpen && (
        <div className="mobile-drawer-overlay animate-fade" onClick={() => setIsMobileFilterOpen(false)}>
          <div 
            className="mobile-drawer-content" 
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="mobile-drawer-header">
              <h3>Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="mobile-drawer-body">
              {currentRoute === 'home' || currentRoute.startsWith('filter') ? renderMobilesFiltersContent() : renderAccessoriesFiltersContent()}
            </div>
            <div className="mobile-drawer-footer">
              <button 
                onClick={() => {
                  if (currentRoute === 'home' || currentRoute.startsWith('filter')) {
                    handleResetFilters();
                  } else {
                    setSelectedAccCategories([]);
                    setSelectedAccBrands([]);
                    setSelectedAccPriceRanges([]);
                    setSelectedAccAvailabilities([]);
                  }
                }} 
                className="clear-btn"
              >
                Clear All
              </button>
              <button onClick={() => setIsMobileFilterOpen(false)} className="apply-btn">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sort bottom sheet */}
      {isMobileSortOpen && (
        <div className="mobile-drawer-overlay animate-fade" onClick={() => setIsMobileSortOpen(false)}>
          <div className="mobile-sort-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-sheet-header">
              <h3>Sort By</h3>
              <button onClick={() => setIsMobileSortOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="mobile-sheet-body">
              {currentRoute === 'home' || currentRoute.startsWith('filter') ? (
                [
                  { value: 'featured', label: 'Featured Deals' },
                  { value: 'priceLow', label: 'Price: Low to High' },
                  { value: 'priceHigh', label: 'Price: High to Low' },
                  { value: 'popular', label: 'Popularity (Views)' },
                  { value: 'sales', label: 'Best Selling' },
                  { value: 'name', label: 'Model Alphabetical' }
                ].map(opt => (
                  <label key={opt.value} className="mobile-sort-option">
                    <input 
                      type="radio" 
                      name="mobileSort" 
                      value={opt.value} 
                      checked={sortBy === opt.value} 
                      onChange={() => {
                        setSortBy(opt.value);
                        setIsMobileSortOpen(false);
                      }} 
                    />
                    <span>{opt.label}</span>
                  </label>
                ))
              ) : (
                [
                  { value: 'featured', label: 'Featured / Newest' },
                  { value: 'priceLow', label: 'Price: Low to High' },
                  { value: 'priceHigh', label: 'Price: High to Low' },
                  { value: 'popular', label: 'Popularity (Views)' },
                  { value: 'sales', label: 'Best Sellers (Sales)' }
                ].map(opt => (
                  <label key={opt.value} className="mobile-sort-option">
                    <input 
                      type="radio" 
                      name="mobileSortAcc" 
                      value={opt.value} 
                      checked={accSortBy === opt.value} 
                      onChange={() => {
                        setAccSortBy(opt.value);
                        setIsMobileSortOpen(false);
                      }} 
                    />
                    <span>{opt.label}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp support widget (only on storefront side) */}
      {!isRouteAdmin && <WhatsAppWidget />}

    </div>
  );
};
export default App;
