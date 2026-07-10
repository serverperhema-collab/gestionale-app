import React from 'react';

export const API_BASE = import.meta.env.VITE_API_BASE || (window.location.port && window.location.port !== '3002'
  ? `http://${window.location.hostname}:3002/api`
  : '/api');

export const PROV_COORDS = {
  'MI': { lat: 45.4642, lon: 9.1900 },
  'BG': { lat: 45.6983, lon: 9.6773 },
  'BS': { lat: 45.5416, lon: 10.2118 },
  'MB': { lat: 45.5845, lon: 9.2735 },
  'VA': { lat: 45.8199, lon: 8.8250 },
  'CO': { lat: 45.8081, lon: 9.0852 },
  'PV': { lat: 45.1850, lon: 9.1500 },
  'CR': { lat: 45.1333, lon: 10.0333 },
  'LC': { lat: 45.8566, lon: 9.3977 },
  'LO': { lat: 45.3097, lon: 9.5000 }
};

export function getProvinceCoords(address) {
  if (!address) return null;
  const match = address.match(/\((MI|BG|BS|MB|VA|CO|PV|CR|LC|LO)\)/i);
  if (match) return PROV_COORDS[match[1].toUpperCase()];
  
  const addrLower = address.toLowerCase();
  if (addrLower.includes('milano')) return PROV_COORDS['MI'];
  if (addrLower.includes('bergamo')) return PROV_COORDS['BG'];
  if (addrLower.includes('brescia')) return PROV_COORDS['BS'];
  if (addrLower.includes('monza')) return PROV_COORDS['MB'];
  if (addrLower.includes('varese')) return PROV_COORDS['VA'];
  if (addrLower.includes('como')) return PROV_COORDS['CO'];
  if (addrLower.includes('pavia')) return PROV_COORDS['PV'];
  if (addrLower.includes('cremona')) return PROV_COORDS['CR'];
  if (addrLower.includes('lecco')) return PROV_COORDS['LC'];
  if (addrLower.includes('lodi')) return PROV_COORDS['LO'];
  return PROV_COORDS['MI']; // default fallback
}

export function calculateHaversineDistance(c1, c2) {
  if (!c1 || !c2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = (c2.lat - c1.lat) * Math.PI / 180;
  const dLon = (c2.lon - c1.lon) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

export function getCapFromAddress(address) {
  if (!address) return null;
  const match = address.match(/\b\d{5}\b/);
  return match ? match[0] : null;
}

export function getCoordsFromCap(cap) {
  if (!cap) return null;
  const prefix3 = cap.substring(0, 3);
  const prefix2 = cap.substring(0, 2);
  
  // MB
  if (prefix3 === '208' || prefix3 === '209') return PROV_COORDS['MB'];
  // MI
  if (prefix2 === '20') return PROV_COORDS['MI'];
  // BG
  if (prefix2 === '24') return PROV_COORDS['BG'];
  // BS
  if (prefix2 === '25') return PROV_COORDS['BS'];
  // VA
  if (prefix2 === '21') return PROV_COORDS['VA'];
  // CO
  if (prefix2 === '22') return PROV_COORDS['CO'];
  // PV
  if (prefix2 === '27') return PROV_COORDS['PV'];
  // CR
  if (prefix3 === '260' || prefix3 === '261' || prefix3 === '262' || prefix3 === '263' || prefix3 === '264') return PROV_COORDS['CR'];
  // LO
  if (prefix3 === '268' || prefix3 === '269') return PROV_COORDS['LO'];
  // LC
  if (prefix2 === '23') return PROV_COORDS['LC'];
  
  return null;
}

export function estimateDistanceByCap(cap1, cap2) {
  if (!cap1 || !cap2) return 999;
  if (cap1 === cap2) return 0;
  
  if (cap1.substring(0, 4) === cap2.substring(0, 4)) return 5;
  if (cap1.substring(0, 3) === cap2.substring(0, 3)) return 15;
  if (cap1.substring(0, 2) === cap2.substring(0, 2)) return 25;
  
  const coords1 = getCoordsFromCap(cap1);
  const coords2 = getCoordsFromCap(cap2);
  if (coords1 && coords2) {
    return calculateHaversineDistance(coords1, coords2);
  }
  
  return 999;
}

export const renderCandidateStars = (punteggio, onEditClick = null) => {
  if (punteggio === null || punteggio === undefined || punteggio === '') {
    return (
      <span 
        onClick={(e) => { e.stopPropagation(); if (onEditClick) onEditClick(); }} 
        style={{ 
          fontSize: '11px', 
          color: '#EF4444', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          padding: '2px 8px', 
          borderRadius: '4px',
          cursor: onEditClick ? 'pointer' : 'default',
          fontWeight: 'bold',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          userSelect: 'none'
        }}
        title="Clicca per inserire la scheda di valutazione"
      >
        Non valutato 📋
      </span>
    );
  }

  const starCount = Math.min(10, Math.max(0, Math.round(punteggio / 10)));
  
  return (
    <span 
      onClick={(e) => { e.stopPropagation(); if (onEditClick) onEditClick(); }}
      style={{ 
        cursor: onEditClick ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        userSelect: 'none'
      }}
      title={`Punteggio: ${punteggio}/100. Clicca per visualizzare/modificare la scheda`}
    >
      <span style={{ color: '#FBBF24', fontSize: '13px', fontWeight: 'bold' }}>
        {'★'.repeat(starCount)}
      </span>
      <span style={{ color: 'rgba(255, 255, 255, 0.15)', fontSize: '13px', fontWeight: 'bold' }}>
        {'★'.repeat(10 - starCount)}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '4px', fontWeight: 600 }}>
        ({punteggio}/100)
      </span>
    </span>
  );
};

export function getAdActiveDaysInfo(dataInserimento, stato) {
  if (!dataInserimento) return { text: 'N/D', color: 'var(--text-secondary)' };
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const insertDate = new Date(dataInserimento);
  insertDate.setHours(0,0,0,0);
  
  const diffTime = today - insertDate;
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  
  if (stato === 'Disattivato') {
    return { text: `Chiuso (dopo ${diffDays} gg)`, color: 'var(--text-secondary)' };
  } else {
    return { text: `Online da ${diffDays} gg`, color: '#10b981' };
  }
}
