class NavbarComponent extends HTMLElement {
  constructor() {
    super();
    this.refs = {};
    this.activeSubmenu = null;
  }

  connectedCallback() {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) this.setAttribute('data-browser', 'safari');

    setTimeout(() => {
      this.setupRefs();
      this.init();
    }, 50);
  }

  setupRefs() {
    this.refs.mobileMenuButton = this.querySelector('[ref="mobileMenuButton"]');
    this.refs.mobileMenu = this.querySelector('[ref="mobileMenu"]');
    this.refs.mobileList = this.querySelector('.navbar__mobile-list');
  }

  init() {
    console.log('Navbar initialized - always visible');
    this.setAttribute('data-scroll-state', 'top'); // Always top state
    
    this.loadMenuItems();
    
    if (this.refs.mobileMenuButton && this.refs.mobileMenu) {
      this.refs.mobileMenuButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMobileMenu();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeMobileMenu();
    });

    document.addEventListener('click', (e) => {
      if (this.refs.mobileMenu?.classList.contains('navbar__mobile-menu--open') &&
          !this.refs.mobileMenu.contains(e.target) &&
          !this.refs.mobileMenuButton?.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
  }

  loadMenuItems() {
    const menuDataAttr = this.dataset.menuData;
    if (!menuDataAttr) return;

    try {
      const menuItems = JSON.parse(menuDataAttr);
      const mobileList = this.querySelector('.navbar__mobile-content .navbar__mobile-list');
      if (mobileList && menuItems.length > 0) {
        mobileList.innerHTML = menuItems.map(item => `
          <li class="navbar__mobile-item">
            <a href="${item.url}" class="navbar__mobile-link">${item.label}</a>
          </li>
        `).join('');
      }
    } catch (error) {
      console.error('Error parsing menu data:', error);
    }
  }

  toggleMobileMenu() {
    if (!this.refs.mobileMenu) return;
    this.refs.mobileMenu.classList.contains('navbar__mobile-menu--open') 
      ? this.closeMobileMenu() 
      : this.openMobileMenu();
  }

  openMobileMenu() {
    this.refs.mobileMenu.classList.add('navbar__mobile-menu--open');
    this.refs.mobileMenuButton?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  closeMobileMenu() {
    if (!this.refs.mobileMenu) return;
    this.refs.mobileMenu.classList.remove('navbar__mobile-menu--open');
    this.refs.mobileMenuButton?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

if (!customElements.get('navbar-component')) {
  customElements.define('navbar-component', NavbarComponent);
}

// Animated search placeholder
function initAnimatedSearch() {
  const searchInput = document.querySelector('.navbar__search-input[data-animated-placeholder]');
  if (!searchInput) return;

  const searchTerms = [
    '{{ section.settings.search_term1 | default: "Kurtis" }}',
    '{{ section.settings.search_term2 | default: "Sarees" }}',
    '{{ section.settings.search_term3 | default: "Short Tops" }}',
    '{{ section.settings.search_term4 | default: "Tube Tops" }}',
    '{{ section.settings.search_term5 | default: "Trending" }}',
    '{{ section.settings.search_term6 | default: "Summer fits" }}'
  ].filter(term => term.trim());

  let currentIndex = 0;
  let timeout;

  function animateTerm() {
    searchInput.classList.add('fade-out');
    
    setTimeout(() => {
      const nextTerm = searchTerms[currentIndex];
      searchInput.setAttribute('data-current-term', nextTerm);
      searchInput.classList.remove('fade-out');
      searchInput.classList.add('animated');
      
      setTimeout(() => {
        searchInput.classList.remove('animated');
      }, 300);
      
      currentIndex = (currentIndex + 1) % searchTerms.length;
      timeout = setTimeout(animateTerm, 3000); // Next after 3s
    }, 300); // 300ms delay
  }

  // Start animation
  if (searchTerms.length > 0) {
    animateTerm();
  }

  // Pause on focus
  searchInput.addEventListener('focus', () => clearTimeout(timeout));
}

document.addEventListener('DOMContentLoaded', initAnimatedSearch);
// Animated search placeholder - simple version
// Animated search - DOM VERSION (GUARANTEED VISIBLE)
(function() {
  const container = document.querySelector('.animated-search-container');
  if (!container) return;

  const input = container.querySelector('.navbar__search-input');
  const placeholder = container.querySelector('.search-placeholder');
  
  if (!input || !placeholder) return;

  const terms = ['Kurtis', 'Sarees', 'Short Tops', 'Tube Tops', 'Trending', 'Summer fits'];
  
  // Create structure
  placeholder.innerHTML = '<span class="fixed">Search for </span><span class="animated" data-term="Kurtis">Kurtis</span>';
  
  let index = 0;
  let timeout;

  function nextTerm() {
    const animatedSpan = placeholder.querySelector('.animated');
    animatedSpan.classList.add('fade-out');
    
    setTimeout(() => {
      animatedSpan.textContent = terms[index];
      animatedSpan.classList.remove('fade-out');
      
      index = (index + 1) % terms.length;
      timeout = setTimeout(nextTerm, 3000);
    }, 300);
  }

  // Start after 1s
  setTimeout(nextTerm, 1000);

  input.addEventListener('focus', () => {
    placeholder.style.opacity = '0';
    clearTimeout(timeout);
  });

  input.addEventListener('blur', () => {
    if (!input.value.trim()) {
      placeholder.style.opacity = '1';
      nextTerm();
    }
  });
})();
// Final polished timing
function nextTerm() {
  const animatedSpan = placeholder.querySelector('.animated');
  animatedSpan.classList.add('fade-out');
  
  setTimeout(() => {
    animatedSpan.textContent = terms[index];
    animatedSpan.classList.remove('fade-out');
    
    index = (index + 1) % terms.length;
    timeout = setTimeout(nextTerm, 3500); // Slightly longer pause
  }, 250); // Faster fade (250ms)
}

