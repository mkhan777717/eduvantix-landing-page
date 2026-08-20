"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiBase } from "@/utils/api";

const BrandingContext = createContext(null);

/**
 * BrandingProvider — fetches and distributes institute branding to all components.
 * Branding includes: customName, logoUrl, faviconUrl.
 * Falls back to default Eduvantix values if none are set.
 */
export function BrandingProvider({ children }) {
  const { user, token } = useAuth();
  const [branding, setBranding] = useState(null);
  const [brandingLoaded, setBrandingLoaded] = useState(false);

  const fetchBranding = useCallback(async () => {
    // Use branding from user.institute if already present (set during login)
    if (user?.institute?.customName || user?.institute?.logoUrl || user?.institute?.faviconUrl) {
      setBranding({
        customName: user.institute.customName || null,
        logoUrl: user.institute.logoUrl || null,
        faviconUrl: user.institute.faviconUrl || null,
        instituteName: user.institute.name || null,
      });
      setBrandingLoaded(true);
      return;
    }

    // If user has an institute but branding wasn't in auth response, fetch it
    if (user?.instituteId) {
      try {
        const API_BASE = getApiBase();
        const res = await fetch(`${API_BASE}/api/institutes/branding/public?instituteId=${user.instituteId}`);
        const data = await res.json();
        if (data.success && data.branding) {
          setBranding(data.branding);
        } else {
          setBranding(null);
        }
      } catch {
        setBranding(null);
      }
    } else {
      setBranding(null);
    }
    setBrandingLoaded(true);
  }, [user]);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  // Apply branding side effects to the document
  useEffect(() => {
    if (typeof document === "undefined") return;

    const siteName = branding?.customName || "Eduvantix";

    // Update document title only if it still contains the old name
    if (document.title) {
      document.title = document.title.replace(/Eduvantix/gi, siteName);
    }

    // Update favicon if one is set
    if (branding?.faviconUrl) {
      const API_BASE = getApiBase();
      const faviconHref = branding.faviconUrl.startsWith("http") 
        ? branding.faviconUrl 
        : `${API_BASE}${branding.faviconUrl}`;

      // Update all favicon link elements
      const links = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon'], link[rel='shortcut icon']");
      links.forEach((link) => {
        link.href = faviconHref;
      });

      // Create favicon link if none exists
      if (links.length === 0) {
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.href = faviconHref;
        document.head.appendChild(newLink);
      }
    }
  }, [branding]);

  /**
   * Update local branding state after a save — called from the branding settings page
   */
  const updateBranding = (newBranding) => {
    setBranding(newBranding);
  };

  const value = {
    branding,
    brandingLoaded,
    updateBranding,
    // Convenience helpers
    siteName: branding?.customName || "Eduvantix",
    logoUrl: branding?.logoUrl || null,
    faviconUrl: branding?.faviconUrl || null,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    // Return safe defaults if used outside provider
    return {
      branding: null,
      brandingLoaded: false,
      updateBranding: () => {},
      siteName: "Eduvantix",
      logoUrl: null,
      faviconUrl: null,
    };
  }
  return ctx;
}
