import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { listAddresses } from '../api/customer';

/**
 * Resolve the customer's current lat/lng — Swiggy/Zomato style.
 *
 * Priority on auto-load:
 *   1. window.__GGFIX_FORCE_LOCATION (manual dev override)
 *   2. Default saved address with non-null lat/lng
 *   3. Browser GPS — only if accuracy is reasonable (≤ 5 km)
 *   4. DEFAULT (CUDDALORE) — so the demo never silently shows "no shops".
 *
 * `detectGps()` is the explicit "use my current location" action (tap on the
 * header pill). It requests a high-accuracy fix, accepts it regardless of the
 * accuracy gate, and reverse-geocodes it to a readable area label.
 *
 * Returns: { lat, lng, source, loading, error, addressLabel, refresh, detectGps }
 *   source: 'override' | 'address' | 'gps' | 'default'
 */

const DEFAULT_LOCATION = {
  lat: 11.7480,
  lng: 79.7714,
  label: 'Cuddalore (default)',
};

const GPS_MAX_ACCURACY_METERS = 5000;

function geolocationAvailable() {
  return typeof navigator !== 'undefined' && navigator.geolocation
    && (Platform.OS === 'web' || typeof navigator.geolocation.getCurrentPosition === 'function');
}

function getPosition(options) {
  return new Promise((resolve, reject) => {
    if (!geolocationAvailable()) { reject(new Error('Geolocation not available')); return; }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

// Best-effort reverse geocode (keyless, CORS-enabled client endpoint). Falls
// back to null on any failure so the caller can show "Current location".
async function reverseGeocode(lat, lng) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: ctrl.signal },
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const j = await res.json();
    const area = j.locality || j.city || j.principalSubdivision;
    const pin = j.postcode;
    const label = [pin, area].filter(Boolean).join(', ');
    return label || area || null;
  } catch (_) {
    return null;
  }
}

export function useCustomerLocation({ enableGps = true } = {}) {
  const [state, setState] = useState({
    lat: null,
    lng: null,
    source: null,
    loading: true,
    error: null,
    addressLabel: null,
  });

  const setDefault = useCallback((extraError) => {
    setState({
      lat: DEFAULT_LOCATION.lat,
      lng: DEFAULT_LOCATION.lng,
      source: 'default',
      loading: false,
      error: extraError || null,
      addressLabel: DEFAULT_LOCATION.label,
    });
  }, []);

  // Apply a resolved GPS fix, then enrich the label via reverse geocoding.
  const applyGps = useCallback(async (latitude, longitude) => {
    setState({
      lat: latitude,
      lng: longitude,
      source: 'gps',
      loading: false,
      error: null,
      addressLabel: 'Current location',
    });
    const label = await reverseGeocode(latitude, longitude);
    if (label) {
      setState((s) => (s.source === 'gps' ? { ...s, addressLabel: label } : s));
    }
  }, []);

  // Explicit "use my current location" — high accuracy, no accuracy gate.
  const detectGps = useCallback(async () => {
    if (!geolocationAvailable()) {
      setState((s) => ({ ...s, loading: false, error: 'Location not available on this device' }));
      return false;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const pos = await getPosition({ enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
      await applyGps(pos.coords.latitude, pos.coords.longitude);
      return true;
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e?.message || 'Could not get your location' }));
      return false;
    }
  }, [applyGps]);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // 1. Manual dev override
      if (typeof window !== 'undefined' && window.__GGFIX_FORCE_LOCATION) {
        const o = window.__GGFIX_FORCE_LOCATION;
        if (typeof o.lat === 'number' && typeof o.lng === 'number') {
          setState({
            lat: o.lat,
            lng: o.lng,
            source: 'override',
            loading: false,
            error: null,
            addressLabel: o.label || 'Forced test location',
          });
          return;
        }
      }

      // 2. Saved default address with stored coords
      const addresses = await listAddresses().catch(() => []);
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      if (def?.latitude != null && def?.longitude != null) {
        setState({
          lat: Number(def.latitude),
          lng: Number(def.longitude),
          source: 'address',
          loading: false,
          error: null,
          addressLabel: def.label || def.city || 'Saved address',
        });
        return;
      }

      // 3. Browser GPS — accuracy-gated so IP-fallback doesn't poison things.
      if (enableGps && geolocationAvailable()) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            if (accuracy && accuracy > GPS_MAX_ACCURACY_METERS) {
              setDefault(`Browser location too imprecise (~${Math.round(accuracy / 1000)} km). Tap to use current location.`);
              return;
            }
            applyGps(latitude, longitude);
          },
          () => { setDefault(); },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 },
        );
        return;
      }

      // 4. No GPS available → demo default
      setDefault();
    } catch (e) {
      setDefault(e?.message || 'Failed to resolve location');
    }
  }, [enableGps, applyGps, setDefault]);

  useEffect(() => { load(); }, [load]);

  return { ...state, refresh: load, detectGps };
}
