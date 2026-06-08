"use client";

import { useEffect } from "react";

export function useUTM() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Capture parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "sck"];
    
    utmParams.forEach((param) => {
      const value = urlParams.get(param);
      if (value) {
        // Save to sessionStorage for persistence across navigation
        sessionStorage.setItem(param, value);
      }
    });
  }, []);

  const getTrackedCheckoutUrl = (baseUrl: string) => {
    if (typeof window === "undefined") return baseUrl;

    try {
      const url = new URL(baseUrl);
      const utmParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "sck"];
      
      let hasTracking = false;
      const collectedParams: { [key: string]: string } = {};

      // Retrieve parameters from sessionStorage
      utmParams.forEach((param) => {
        const savedValue = sessionStorage.getItem(param);
        if (savedValue) {
          collectedParams[param] = savedValue;
          hasTracking = true;
        }
      });

      if (!hasTracking) {
        return baseUrl;
      }

      // 1. Set standard UTM parameters on Hotmart link if they exist
      Object.keys(collectedParams).forEach((key) => {
        url.searchParams.set(key, collectedParams[key]);
      });

      // 2. Set the 'src' parameter which is Hotmart's primary tracking origin tag
      // If we don't have an explicit 'src' but we have utm_source, we construct it:
      // ex: utm_source=instagram & utm_medium=organic -> src=instagram_organic
      if (!collectedParams["src"]) {
        const parts = [];
        if (collectedParams["utm_source"]) parts.push(collectedParams["utm_source"]);
        if (collectedParams["utm_medium"]) parts.push(collectedParams["utm_medium"]);
        if (collectedParams["utm_campaign"]) parts.push(collectedParams["utm_campaign"]);
        
        if (parts.length > 0) {
          // Join parts with underscore, limit size and sanitize
          const computedSrc = parts.join("_").toLowerCase().replace(/[^a-z0-9_-]/g, "");
          url.searchParams.set("src", computedSrc);
        }
      }

      return url.toString();
    } catch (e) {
      console.error("Error generating tracked checkout URL:", e);
      return baseUrl;
    }
  };

  return { getTrackedCheckoutUrl };
}
