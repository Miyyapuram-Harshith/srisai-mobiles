import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, MapPin, Clock, Send, Compass, ExternalLink } from 'lucide-react';

const Instagram: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 20, style }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
import { useApp } from '../context/AppContext';

export const ContactPage: React.FC = () => {
  const { whatsAppSettings } = useApp();
  const [distance, setDistance] = useState<number | null>(null);
  const [locPermission, setLocPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  // Sri Sai Mobiles coordinates
  const STORE_LAT = 18.7930915;
  const STORE_LON = 78.9185849;

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocPermission('granted');
          const dist = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            STORE_LAT,
            STORE_LON
          );
          setDistance(dist);
        },
        () => {
          setLocPermission('denied');
        }
      );
    }
  }, []);

  const googleMapsUrl = "https://www.google.com/maps/place/SRI+SAI+MOBILES/@18.7930915,78.9185849,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcd138e3c1d0c5f:0x306a24477dfe4ccb!8m2!3d18.7930915!4d78.9185849!16s%2Fg%2F11bwyytv11";
  const whatsappChannelUrl = "https://www.whatsapp.com/channel/0029VbDEZqR1noz4vtAjLc1B";

  return (
    <div className="animate-fade" style={{ padding: '20px 0' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, background: 'linear-gradient(90deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
          Contact Sri Sai Mobiles
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>
          We value your money. Visit our showroom or get in touch for buy, sell, and exchange inquiries.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px',
        alignItems: 'start'
      }}>
        
        {/* LEFT COLUMN: CONTACT DETAILS CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Geolocation Distance Alert */}
          {distance !== null && (
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '16px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--primary)',
              fontSize: '13px',
              fontWeight: 600
            }}>
              <Compass size={18} className="animate-spin-slow" />
              <span>You are currently {distance} km away from our showroom in Jagtial!</span>
            </div>
          )}

          {/* Store Info Card */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <MapPin size={20} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Showroom Locations</h2>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Primary Address</span>
              <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>Sri Sai Mobiles</strong>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                Opposite Big C, Angadi Bazar, Jagtial,<br />
                Telangana - 505327, India
              </p>
            </div>

            <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Second Shop Landmark</span>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                Noor Masjid, Yawar Road, Jagtial,<br />
                Telangana - 505327
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
              <a 
                href={googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="premium-btn btn-primary"
                style={{ fontSize: '12px', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Compass size={14} />
                <span>Get Directions</span>
              </a>
              <a 
                href={googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="premium-btn btn-secondary"
                style={{ fontSize: '12px', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>Open in Maps</span>
                <ExternalLink size={12} />
              </a>
            </div>

          </div>

          {/* Business Hours & Contact numbers */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <Clock size={20} style={{ color: 'var(--accent)' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Business Hours & Contacts</h2>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '13px' }}>
              <div>
                <strong>Monday - Saturday:</strong>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>10:00 AM - 09:00 PM</div>
              </div>
              <span className="badge badge-stock">Open Now</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '13px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
              <div>
                <strong>Sunday:</strong>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>Shop Closed</div>
              </div>
              <span className="badge badge-out">Closed</span>
            </div>

            {/* Quick Actions call */}
            <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a 
                href="tel:+918688303048"
                className="premium-btn btn-primary"
                style={{ 
                  width: '100%', padding: '12px', borderRadius: '12px', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 
                }}
              >
                <Phone size={16} />
                <span>Call Now: +91 8688303048</span>
              </a>

              <a 
                href={`https://api.whatsapp.com/send?phone=918688303048&text=${encodeURIComponent("Hello Sri Sai Mobiles, I need assistance regarding your phones.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-btn btn-secondary"
                style={{ 
                  width: '100%', padding: '12px', borderRadius: '12px', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700,
                  borderColor: '#25D366', color: '#128C7E', backgroundColor: 'rgba(37, 211, 102, 0.08)'
                }}
              >
                <MessageCircle size={16} fill="#25D366" style={{ color: '#128C7E' }} />
                <span>WhatsApp Chat support</span>
              </a>
            </div>

          </div>

          {/* Social connections */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <Instagram size={20} style={{ color: '#E1306C' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Social Connections</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(225, 48, 108, 0.08)',
                color: '#E1306C', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Instagram size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>Instagram: @sri_sai_mobiles3048</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  483 Posts • <strong>40.3K Followers</strong> • Trusted Local Mobile Store
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(37, 211, 102, 0.08)',
                color: '#128C7E', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Send size={18} fill="#25D366" style={{ color: '#128C7E' }} />
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>WhatsApp Channel</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Receive stock arrival alerts and flash sale updates instantly.
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
              <a 
                href="https://www.instagram.com/sri_sai_mobiles3048/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="premium-btn btn-secondary"
                style={{ fontSize: '11px', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <Instagram size={12} />
                <span>Follow Instagram</span>
              </a>
              
              <a 
                href={whatsappChannelUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="premium-btn btn-secondary"
                style={{ fontSize: '11px', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <Send size={12} />
                <span>Join Channel</span>
              </a>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: GOOGLE MAPS IFRAME LOCATION */}
        <div className="glass-card" style={{ padding: '16px', borderRadius: '20px', height: '580px', display: 'flex', flexDirection: 'column' }}>
          <iframe
            title="Sri Sai Mobiles Google Maps Showroom Location"
            src="https://maps.google.com/maps?q=18.7930915,78.9185849&z=17&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: '14px', flex: 1 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

      </div>

    </div>
  );
};
