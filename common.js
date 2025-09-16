<!-- File: common.js -->
<script>
(function () {
  // Where is index.html relative to this page?
  // For modules inside /modules/, we go up one.
  // Detect automatically: if current path contains '/modules/', use '../index.html'
  function resolveHomeHref() {
    return location.pathname.includes('/modules/') ? '../index.html' : 'index.html';
  }

  // Make it globally callable for explicit onclick handlers too
  window.goHome = function () {
    location.href = resolveHomeHref();
  };

  // Ensure a Home button exists on every module page
  document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.back-button')) {
      const btn = document.createElement('button');
      btn.className = 'back-button';
      btn.textContent = '🏠 Home';
      btn.addEventListener('click', window.goHome);

      // Insert as the first element inside <body>
      const body = document.body;
      if (body.firstChild) {
        body.insertBefore(btn, body.firstChild);
      } else {
        body.appendChild(btn);
      }
    }
  });
})();
</script>