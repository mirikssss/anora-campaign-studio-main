(function() {
  console.log("Anora SDK v1.1.0 Loading...");

  const scriptTag = document.currentScript;
  const siteId = scriptTag ? scriptTag.dataset.siteId : null;

  if (!siteId) {
    console.error("Anora SDK: data-site-id is missing! Add data-site-id='YOUR_SITE_ID' to the script tag.");
    return;
  }

  // API host: use explicit override, or extract from script src (remove /sdk.js)
  // For external sites, the script src contains the full backend URL
  let API_HOST = window.ANORA_API_URL || '';
  
  if (!API_HOST && scriptTag && scriptTag.src) {
    try {
      const scriptUrl = new URL(scriptTag.src);
      API_HOST = scriptUrl.origin;
    } catch(e) {
      console.warn("Anora SDK: Could not parse script src, using relative paths");
    }
  }

  console.log("Anora SDK: Initialized", { siteId, API_HOST });

  // Helper to fetch and inject ads
  async function loadAds() {
    const slots = document.querySelectorAll('.anora-ad-slot');
    
    if (slots.length === 0) {
      console.warn("Anora SDK: No .anora-ad-slot elements found on page. Add <div class='anora-ad-slot' data-format='300x250'></div> where you want ads.");
      return;
    }

    // Notify server that SDK is active on this site
    try {
      await fetch(`${API_HOST}/sdk/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: siteId })
      });
      console.log("Anora SDK: Site registered successfully");
    } catch (e) {
      console.warn("Anora SDK: Registration failed (server might be offline):", e.message);
    }

    let adsLoaded = 0;
    
    for (const slot of slots) {
      const format = slot.dataset.format || '300x250';
      
      // Show loading state
      slot.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;width:100%;min-height:100px;background:#f9fafb;border:1px dashed #e5e7eb;border-radius:8px;font-family:sans-serif;color:#9ca3af;font-size:12px;">
          Anora Ad loading...
        </div>
      `;
      
      try {
        const response = await fetch(`${API_HOST}/api/ads?siteId=${siteId}&format=${format}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const ad = await response.json();
        
        if (!ad || !ad.bannerUrl) {
          throw new Error("No banner URL in response");
        }
        
        renderAd(slot, ad, format);
        adsLoaded++;
      } catch (e) {
        console.log("Anora SDK: No ads available for slot", format, "-", e.message);
        // Show empty state instead of hiding
        slot.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;width:100%;min-height:60px;background:#fafafa;border:1px dashed #e5e7eb;border-radius:8px;font-family:sans-serif;color:#d1d5db;font-size:11px;">
            Ad space available
          </div>
        `;
      }
    }
    
    console.log(`Anora SDK: Loaded ${adsLoaded}/${slots.length} ads`);
  }

  function renderAd(container, ad, requestedFormat) {
    // Parse dimensions from format
    const format = ad.format || requestedFormat || '300x250';
    const parts = format.split('x');
    const width = parseInt(parts[0]) || 300;
    const height = parseInt(parts[1]) || 250;
    
    // Ensure banner URL is absolute
    let bannerSrc = ad.bannerUrl;
    if (bannerSrc && !bannerSrc.startsWith('http')) {
      bannerSrc = API_HOST + bannerSrc;
    }
    
    // Ensure link is valid
    const link = ad.link || '#';
    
    container.innerHTML = `
      <div style="position:relative;width:${width}px;max-width:100%;height:${height}px;overflow:hidden;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);background:#f4f4f5;margin:0 auto;">
        <a href="${link}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;width:100%;height:100%;"
           onclick="anoraTrackClick('${ad.id}')">
          <img src="${bannerSrc}" 
               style="width:100%;height:100%;object-fit:cover;display:block;" 
               alt="Advertisement" 
               onerror="this.parentElement.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:#aaa;font-family:sans-serif;font-size:12px;\\'>Ad unavailable</div>'" />
          <div style="position:absolute;bottom:6px;right:6px;background:rgba(0,0,0,0.55);color:white;padding:2px 8px;font-size:9px;border-radius:4px;font-family:system-ui,sans-serif;letter-spacing:0.3px;backdrop-filter:blur(4px);">
            Ad by Anora
          </div>
        </a>
      </div>
    `;
    
    // Track impression
    anoraTrackImpression(ad.id);
    console.log("Anora Ad Rendered:", ad.id, "Format:", format);
  }

  // Simple tracking functions
  function anoraTrackImpression(adId) {
    try {
      fetch(`${API_HOST}/api/campaigns/${adId}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ impressions: 1, clicks: 0, spent: 0 })
      }).catch(() => {});
    } catch(e) {}
  }

  // Make click tracking available globally for onclick handlers
  window.anoraTrackClick = function(adId) {
    try {
      fetch(`${API_HOST}/api/campaigns/${adId}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ impressions: 0, clicks: 1, spent: 0 })
      }).catch(() => {});
    } catch(e) {}
  };

  // Load when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAds);
  } else {
    loadAds();
  }

  // Expose global Anora object
  window.anora = {
    refresh: loadAds,
    version: '1.1.0'
  };
})();
