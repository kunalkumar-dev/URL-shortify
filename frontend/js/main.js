// Alert utility
function showAlert(message, type = 'info') {
  const container = document.getElementById('alert-container');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };
  
  alert.innerHTML = `
    <span>${icons[type] || icons.info}</span>
    <span>${message}</span>
    <button class="alert-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  container.appendChild(alert);
  
  // Auto-remove after 5 seconds
  if (type !== 'error') {
    setTimeout(() => {
      alert.remove();
    }, 5000);
  }
}

// Setup form listener
function setupAppListeners() {
  const form = document.getElementById('shorten-form');
  const submitBtn = document.getElementById('shorten-btn');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const urlInput = document.getElementById('url-input');
    const url = urlInput.value.trim();

    if (!url) {
      showAlert('Please enter a URL', 'error');
      return;
    }

    try {
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.classList.add('button-loading');
      submitBtn.textContent = '';

      const result = await api.shortenUrl(url);
      
      if (result.error) {
        showAlert(result.error, 'error');
      } else {
        showAlert('URL shortened successfully! 🎉', 'success');
        urlInput.value = '';
        loadUrls();
      }
    } catch (err) {
      showAlert('Error: ' + err.message, 'error');
      console.error('Error shortening URL:', err);
    } finally {
      // Hide loading state
      submitBtn.disabled = false;
      submitBtn.classList.remove('button-loading');
      submitBtn.textContent = 'Shorten';
    }
  });

  // Setup search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', filterUrls);
  }
}

// Load and display URLs
let allUrls = [];

async function loadUrls() {
  try {
    const response = await api.getUserUrls();
    const data = response.data || response;
    
    if (Array.isArray(data)) {
      allUrls = data;
    } else {
      allUrls = [];
    }

    displayUrls(allUrls);
    updateStats();
    
    // Show filter if there are URLs
    const filterSection = document.getElementById('filter-section');
    if (allUrls.length > 0) {
      filterSection.style.display = 'flex';
    }
  } catch (err) {
    showAlert('Failed to load URLs', 'error');
    console.error('Error loading URLs:', err);
  }
}

// Display URLs
function displayUrls(urls) {
  const container = document.getElementById('urls-container');
  const countBadge = document.getElementById('url-count');
  
  countBadge.textContent = urls.length;

  if (!urls || urls.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p>No shortened URLs yet.<br>Create one to get started!</p>
      </div>
    `;
    // Hide action buttons when no URLs
    document.getElementById('export-btn').style.display = 'none';
    document.getElementById('clear-all-btn').style.display = 'none';
    return;
  }

  // Show action buttons when URLs exist
  document.getElementById('export-btn').style.display = 'inline-block';
  document.getElementById('clear-all-btn').style.display = 'inline-block';

  container.innerHTML = urls.map((url) => `
    <div class="url-item">
      <div class="url-info">
        <div class="original">
          <label>Original URL:</label><br>
          <span>${escapeHtml(url.originalUrl)}</span>
        </div>
        <div class="short" onclick="copyToClipboard('http://localhost:5000/api/urls/${url.shortId}'); showAlert('Copied!', 'info')">
         http://localhost:5000/api/urls/${url.shortId}
        </div>
        <div class="clicks">
          Clicks: <span class="clicks-value">${url.clicks}</span>
        </div>
        <div style="color: #999; font-size: 0.8em; margin-top: 8px;">
          Created: ${new Date(url.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div class="url-actions">
        <button class="copy-btn" onclick="copyToClipboard('http://localhost:5000/api/urls/${url.shortId}'); showAlert('Link copied!', 'success')">
          📋 Copy
        </button>
        <button class="delete-btn" onclick="deleteUrl('${url.shortId}')">
          🗑 Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Filter URLs based on search
function filterUrls() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const filtered = allUrls.filter(url => 
    url.originalUrl.toLowerCase().includes(searchTerm) ||
    url.shortId.toLowerCase().includes(searchTerm)
  );
  displayUrls(filtered);
}

// Update statistics
function updateStats() {
  if (allUrls.length === 0) {
    document.getElementById('stats-container').style.display = 'none';
    return;
  }

  document.getElementById('stats-container').style.display = 'block';
  document.getElementById('total-urls').textContent = allUrls.length;
  
  const totalClicks = allUrls.reduce((sum, url) => sum + (url.clicks || 0), 0);
  document.getElementById('total-clicks').textContent = totalClicks;
  
  const avgClicks = allUrls.length > 0 ? Math.round(totalClicks / allUrls.length) : 0;
  document.getElementById('avg-clicks').textContent = avgClicks;
  
  // Calculate most clicked URL
  const mostClicked = allUrls.reduce((max, url) => {
    return (url.clicks || 0) > (max.clicks || 0) ? url : max;
  }, allUrls[0] || {});
  
  const mostClickedElement = document.getElementById('most-clicked');
  if (mostClickedElement) {
    if (mostClicked.shortId) {
      mostClickedElement.textContent = `${mostClicked.shortId} (${mostClicked.clicks || 0})`;
    } else {
      mostClickedElement.textContent = '-';
    }
  }
}

// Copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(err => {
   showAlert('Failed to copy', 'error');
    console.error('Copy failed:', err);
  });
}

// Delete URL
async function deleteUrl(shortId) {
  if (!confirm('Are you sure you want to delete this shortened URL?')) {
    return;
  }

  try {
    const result = await api.deleteUrl(shortId);
    if (result.success) {
      showAlert('URL deleted successfully', 'success');
      loadUrls();
    } else {
      showAlert(result.error || 'Failed to delete URL', 'error');
    }
  } catch (err) {
    showAlert('Error deleting URL', 'error');
    console.error('Error deleting URL:', err);
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Dark Mode Toggle
function initDarkMode() {
  const darkModeBtn = document.getElementById('dark-mode-toggle');
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeBtn.textContent = '☀️';
  }
  
  darkModeBtn.addEventListener('click', toggleDarkMode);
}

function toggleDarkMode() {
  const darkModeBtn = document.getElementById('dark-mode-toggle');
  document.body.classList.toggle('dark-mode');
  
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
  darkModeBtn.textContent = isDarkMode ? '☀️' : '🌙';
}



// Sorting Functions
let currentSort = 'newest';

function sortUrls(type) {
  currentSort = type;
  let sorted = [...allUrls];
  
  switch(type) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'oldest':
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'mostClicked':
      sorted.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
      break;
    case 'leastClicked':
      sorted.sort((a, b) => (a.clicks || 0) - (b.clicks || 0));
      break;
  }
  
  displayUrls(sorted);
}

// Export to JSON
function exportToJSON() {
  if (allUrls.length === 0) {
    showAlert('No URLs to export', 'error');
    return;
  }
  
  const exportData = allUrls.map(url => ({
    originalUrl: url.originalUrl,
    shortCode: url.shortId,
    shortUrl: `http://localhost:5000/api/urls/${url.shortId}`,
    clicks: url.clicks,
    createdAt: new Date(url.createdAt).toISOString(),
  }));
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `shortened-urls-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showAlert('URLs exported successfully!', 'success');
}

// Clear All URLs
async function clearAllUrls() {
  if (allUrls.length === 0) {
    showAlert('No URLs to clear', 'error');
    return;
  }
  
  if (!confirm(`Are you sure you want to delete all ${allUrls.length} shortened URLs? This cannot be undone.`)) {
    return;
  }
  
  try {
    const submitBtn = document.getElementById('clear-all-btn');
    submitBtn.disabled = true;
    submitBtn.classList.add('button-loading');
    
    let deletedCount = 0;
    for (const url of allUrls) {
      try {
        await api.deleteUrl(url.shortId);
        deletedCount++;
      } catch (err) {
        console.error(`Failed to delete ${url.shortId}:`, err);
      }
    }
    
    showAlert(`${deletedCount} URLs deleted successfully!`, 'success');
    loadUrls();
    
    submitBtn.disabled = false;
    submitBtn.classList.remove('button-loading');
  } catch (err) {
    showAlert('Error clearing URLs', 'error');
    console.error('Error clearing URLs:', err);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize dark mode
  initDarkMode();
  
  // Load URLs and setup listeners
  loadUrls();
  setupAppListeners();
  
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => sortUrls(e.target.value));
  }
  
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportToJSON);
  }
  
  const clearAllBtn = document.getElementById('clear-all-btn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllUrls);
  }
  
  // QR modal removed; no modal listeners
  
  // Refresh data every 30 seconds
  setInterval(loadUrls, 30000);
});
