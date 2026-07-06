import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, Clock, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchSubmit: (query: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSearchSubmit }) => {
  const { searchHistory, clearSearchHistory, addSearchQuery, recentlyViewed, devices } = useApp();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [typoCorrection, setTypoCorrection] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSuggestions([]);
      setTypoCorrection(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Dictionary of correct dictionary words to check for typos
  const DICTIONARY = [
    'apple', 'iphone', 'samsung', 'galaxy', 'ultra', 
    'oneplus', 'nothing', 'google', 'pixel', 'motorola', 
    'xiaomi', 'redmi', 'realme', 'vivo', 'oppo'
  ];

  // Levenshtein distance calculation for fuzzy matching
  const getLevenshteinDistance = (a: string, b: string): number => {
    const tmp: number[][] = [];
    for (let i = 0; i <= a.length; i++) {
      tmp[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
      tmp[0][j] = j;
    }
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        tmp[i][j] = Math.min(
          tmp[i - 1][j] + 1, // deletion
          tmp[i][j - 1] + 1, // insertion
          tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
        );
      }
    }
    return tmp[a.length][b.length];
  };

  const checkTypos = (searchTerm: string) => {
    const terms = searchTerm.toLowerCase().split(/\s+/);
    let correctionMade = false;
    const correctedTerms = terms.map(term => {
      if (term.length < 3) return term; // skip tiny words
      if (DICTIONARY.includes(term)) return term; // correct already

      let bestMatch = term;
      let minDistance = 3; // Max edit distance allowed

      for (const dictWord of DICTIONARY) {
        const dist = getLevenshteinDistance(term, dictWord);
        if (dist < minDistance) {
          minDistance = dist;
          bestMatch = dictWord;
          correctionMade = true;
        }
      }
      return bestMatch;
    });

    if (correctionMade) {
      setTypoCorrection(correctedTerms.join(' '));
    } else {
      setTypoCorrection(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (!val.trim()) {
      setSuggestions([]);
      setTypoCorrection(null);
      return;
    }

    // Generate Suggestions based on matching Brand or Model names
    const filteredSuggestions: string[] = [];
    const lowerVal = val.toLowerCase();

    // Check brands
    const brands = Array.from(new Set(devices.map(d => d.brand)));
    brands.forEach(b => {
      if (b.toLowerCase().includes(lowerVal) && !filteredSuggestions.includes(b)) {
        filteredSuggestions.push(b);
      }
    });

    // Check models
    devices.forEach(d => {
      if (d.modelName.toLowerCase().includes(lowerVal) && !filteredSuggestions.includes(d.modelName)) {
        filteredSuggestions.push(d.modelName);
      }
    });

    setSuggestions(filteredSuggestions.slice(0, 5));
    checkTypos(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addSearchQuery(query);
      onSearchSubmit(query);
      onClose();
    }
  };

  const handleSuggestionClick = (selected: string) => {
    addSearchQuery(selected);
    onSearchSubmit(selected);
    onClose();
  };

  const handleTypoClick = () => {
    if (typoCorrection) {
      setQuery(typoCorrection);
      addSearchQuery(typoCorrection);
      onSearchSubmit(typoCorrection);
      onClose();
    }
  };

  const trendingSearches = [
    'iPhone 15 Pro', 
    'S24 Ultra', 
    'OnePlus 12', 
    'Nothing Phone (2)', 
    '5G under 20000'
  ];

  if (!isOpen) return null;

  // Filter recently viewed items matching devices database
  const recentlyViewedDevices = devices
    .filter(d => recentlyViewed.includes(d.id) && d.status !== 'archived')
    .slice(0, 3);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--overlay-bg)',
      backdropFilter: 'blur(12px)',
      padding: '40px 20px 20px 20px'
    }} className="animate-fade">
      
      <div style={{
        width: '100%',
        maxWidth: '750px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Search Input Box */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--bg-solid)',
          border: '2px solid var(--primary)',
          borderRadius: '30px',
          padding: '8px 20px',
          boxShadow: 'var(--glass-shadow)',
          position: 'relative'
        }} className="animate-slide">
          <Search size={22} style={{ color: 'var(--primary)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type device brand or model name..."
            value={query}
            onChange={handleInputChange}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '16px',
              fontWeight: 500,
              padding: '6px 0',
              color: 'var(--text-main)'
            }}
          />
          {query && (
            <button 
              type="button" 
              onClick={() => { setQuery(''); setSuggestions([]); setTypoCorrection(null); }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          )}
          <button 
            type="button" 
            onClick={onClose}
            style={{
              border: 'none',
              backgroundColor: 'var(--bg-subtle)',
              cursor: 'pointer',
              color: 'var(--text-main)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </form>

        {/* Suggestion list */}
        {suggestions.length > 0 && (
          <div className="glass-card animate-fade" style={{ padding: '12px 0', borderRadius: '18px' }}>
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSuggestionClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 24px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
                className="search-item-hover"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Typo Correction Warning */}
        {typoCorrection && typoCorrection.toLowerCase() !== query.toLowerCase() && (
          <div style={{
            fontSize: '13px',
            color: 'var(--accent)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            padding: '10px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            border: '1px dashed rgba(245, 158, 11, 0.3)'
          }}
          onClick={handleTypoClick}
          className="animate-slide"
          >
            <Sparkles size={14} />
            <span>Did you mean: <strong style={{ textDecoration: 'underline' }}>{typoCorrection}</strong>?</span>
          </div>
        )}

        {/* History and Trends Panel */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }} className="animate-slide">
          
          {/* History */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} />
                <span>Recent Searches</span>
              </span>
              {searchHistory.length > 0 && (
                <button 
                  onClick={clearSearchHistory}
                  style={{ border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                >
                  Clear All
                </button>
              )}
            </div>
            {searchHistory.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No search logs found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {searchHistory.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSuggestionClick(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      cursor: 'pointer',
                      color: 'var(--text-main)',
                      padding: '4px 0'
                    }}
                  >
                    <span>{item}</span>
                    <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trending & Recently Viewed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Trending */}
            <div className="glass-card" style={{ padding: '16px 20px', borderRadius: '20px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
                <span>Trending Searches</span>
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {trendingSearches.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(item)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.color = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'inherit';
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Recently Viewed */}
            {recentlyViewedDevices.length > 0 && (
              <div className="glass-card" style={{ padding: '16px 20px', borderRadius: '20px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, display: 'block', marginBottom: '12px' }}>
                  Recently Viewed
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentlyViewedDevices.map(d => (
                    <div
                      key={d.id}
                      onClick={() => {
                        onClose();
                        window.location.hash = `product/${d.id}`;
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <img 
                        src={d.images[0] || 'logo.jpg'} 
                        alt={d.modelName} 
                        style={{ width: '32px', height: '32px', objectFit: 'contain', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', padding: '2px' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.modelName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>₹{d.offerPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
