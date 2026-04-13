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
    // Only target slots that haven't been initialized yet
    const slots = document.querySelectorAll('.anora-ad-slot:not([data-anora-initialized])');
    
    if (slots.length === 0) {
      return;
    }

    console.log(`Anora SDK: Found ${slots.length} new slots to initialize`);

    // Notify server that SDK is active on this site (once per load)
    if (!window._anoraRegistered) {
      try {
        await fetch(`${API_HOST}/sdk/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ site_id: siteId })
        });
        window._anoraRegistered = true;
      } catch (e) {}
    }

    for (const slot of slots) {
      // Mark as initialized immediately to prevent double processing
      slot.setAttribute('data-anora-initialized', 'true');
      
      const format = slot.dataset.format || '300x250';
      
      // Show loading state
      slot.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;width:100%;min-height:100px;background:#f9fafb;border:1px dashed #e5e7eb;border-radius:8px;font-family:sans-serif;color:#9ca3af;font-size:12px;">
          Anora Ad loading...
        </div>
      `;
      
      try {
        const response = await fetch(`${API_HOST}/api/ads?siteId=${siteId}&format=${format}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const ad = await response.json();
        if (!ad || !ad.bannerUrl) throw new Error("Invalid ad response");
        
        renderAd(slot, ad, format);
      } catch (e) {
        console.log("Anora SDK: Could not load ad for slot", format, "-", e.message);
        slot.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;width:100%;min-height:60px;background:#fafafa;border:1px dashed #e5e7eb;border-radius:8px;font-family:sans-serif;color:#d1d5db;font-size:11px;">
            Ad space available
          </div>
        `;
      }
    }
  }

  function renderAd(container, ad, requestedFormat) {
    const format = ad.format || requestedFormat || '300x250';
    const [w, h] = format.split('x');
    const width = parseInt(w) || 300;
    const height = parseInt(h) || 250;
    
    let bannerSrc = ad.bannerUrl;
    if (bannerSrc && !bannerSrc.startsWith('http')) {
      bannerSrc = API_HOST + bannerSrc;
    }
    
    container.innerHTML = `
      <div style="position:relative;width:${width}px;max-width:100%;height:${height}px;overflow:hidden;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);background:#f4f4f5;margin:0 auto;">
        <a href="${ad.link || '#'}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;width:100%;height:100%;"
           onclick="anoraTrackClick('${ad.id}')">
          <img src="${bannerSrc}" 
               style="width:100%;height:100%;object-fit:cover;display:block;" 
               alt="Ad" 
               onerror="this.parentElement.parentElement.style.display='none'" />
          <div style="position:absolute;bottom:6px;right:6px;background:rgba(0,0,0,0.55);color:white;padding:2px 8px;font-size:9px;border-radius:4px;font-family:system-ui,sans-serif;backdrop-filter:blur(4px);">
            Ad by Anora
          </div>
        </a>
      </div>
    `;
    
    anoraTrackImpression(ad.id);
  }

  // Tracking
  function anoraTrackImpression(adId) {
    fetch(`${API_HOST}/api/campaigns/${adId}/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ impressions: 1, clicks: 0, spent: 0 })
    }).catch(() => {});
  }

  window.anoraTrackClick = function(adId) {
    fetch(`${API_HOST}/api/campaigns/${adId}/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ impressions: 0, clicks: 1, spent: 0 })
    }).catch(() => {});
  };

  // 1. Initial Load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAds);
  } else {
    loadAds();
  }

  // 2. SPA/React support: Watch for new slots being added to the DOM
  if (window.MutationObserver) {
    const observer = new MutationObserver((mutations) => {
      let hasNewSlots = false;
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element
            if (node.classList.contains('anora-ad-slot') || node.querySelector('.anora-ad-slot')) {
              hasNewSlots = true;
            }
          }
        });
      });
      if (hasNewSlots) loadAds();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // 3. Polling fallback (every 2s) to be 100% sure
  setInterval(loadAds, 2000);

  // Expose global Anora object
  window.anora = {
    refresh: loadAds,
    version: '1.1.0'
  };
})();
