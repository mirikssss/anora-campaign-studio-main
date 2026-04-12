(function() {
  console.log("Anora SDK Loading...");

  const scriptTag = document.currentScript;
  const siteId = scriptTag.dataset.siteId;

  if (!siteId) {
    console.error("Anora SDK: siteId is missing!");
    return;
  }

  // Determine API host from script src or manual override
  const API_HOST = window.ANORA_API_URL || scriptTag.src.replace('/sdk.js', '');
  console.log("Anora SDK: Using API Host", API_HOST);

  // Helper to fetch and inject ads
  async function loadAds() {
    const slots = document.querySelectorAll('.anora-ad-slot');
    
    // Notify server that SDK is active on this site
    try {
      await fetch(`${API_HOST}/sdk/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: siteId })
      });
    } catch (e) {
      console.warn("Anora SDK registration failed:", e);
    }

    slots.forEach(async (slot) => {
      const format = slot.dataset.format || '300x250';
      
      try {
        const response = await fetch(`${API_HOST}/api/ads?siteId=${siteId}&format=${format}`);
        if (!response.ok) throw new Error("No ad found");
        
        const ad = await response.json();
        renderAd(slot, ad);
      } catch (e) {
        console.log("Anora SDK: No ads for slot", format);
        slot.style.display = 'none';
      }
    });
  }

  function renderAd(container, ad) {
    const [width, height] = ad.format.split('x');
    
    container.innerHTML = `
      <div style="position: relative; width: ${width}px; height: ${height}px; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); background: #f4f4f4;">
        <a href="${ad.link}" target="_blank" style="text-decoration: none; display: block; width: 100%; height: 100%;">
          <img src="${ad.bannerUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Anora Ad" />
          <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.5); color: white; padding: 2px 6px; font-size: 8px; border-radius: 4px; font-family: sans-serif;">
            Anora Ads
          </div>
        </a>
      </div>
    `;
    
    // Simple view tracker
    console.log("Anora Ad Rendered:", ad.id);
  }

  // Load when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAds);
  } else {
    loadAds();
  }

  // Expose global object
  window.anora = {
    refresh: loadAds,
    version: '1.0.0-hackathon'
  };
})();
