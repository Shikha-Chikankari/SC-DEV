class NavbarComponent extends HTMLElement {
  constructor() {
    super();
    this.refs = {};
    this.activeSubmenu = null;
  }

  connectedCallback() {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) this.setAttribute('data-browser', 'safari');

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      this.setupRefs();
      this.init();
    });
  }

  setupRefs() {
    this.refs.mobileMenuButton = this.querySelector('[ref="mobileMenuButton"]');
    this.refs.mobileMenu = this.querySelector('[ref="mobileMenu"]');
    this.refs.mobileList = this.querySelector('.navbar__mobile-list');
    
    console.log('Refs setup:', {
      button: !!this.refs.mobileMenuButton,
      menu: !!this.refs.mobileMenu,
      list: !!this.refs.mobileList
    });
  }

  init() {
    console.log('Navbar initialized - always visible');
    this.setAttribute('data-scroll-state', 'visible');
    
    this.loadMenuItems();
    this.setupMobileMenu();
    this.setupEventListeners();
  }

  setupMobileMenu() {
    if (!this.refs.mobileMenuButton || !this.refs.mobileMenu) {
      console.error('Mobile menu elements not found');
      return;
    }

    // Mobile menu button click
    this.refs.mobileMenuButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Hamburger clicked');
      this.toggleMobileMenu();
    });

    // Close button in mobile menu header
    const closeButton = this.refs.mobileMenu.querySelector('.navbar__mobile-header .navbar__mobile-toggle');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Close button clicked');
        this.closeMobileMenu();
      });
    }

    // Click backdrop to close
    this.refs.mobileMenu.addEventListener('click', (e) => {
      if (e.target === this.refs.mobileMenu) {
        this.closeMobileMenu();
      }
    });
  }

  setupEventListeners() {
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.refs.mobileMenu?.classList.contains('navbar__mobile-menu--open')) {
        this.closeMobileMenu();
      }
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (this.refs.mobileMenu?.classList.contains('navbar__mobile-menu--open')) {
        const isInsideMenu = this.refs.mobileMenu.contains(e.target);
        const isButton = this.refs.mobileMenuButton?.contains(e.target);
        
        if (!isInsideMenu && !isButton) {
          this.closeMobileMenu();
        }
      }
    });
  }

  loadMenuItems() {
    const menuDataAttr = this.dataset.menuData;
    if (!menuDataAttr) {
      console.warn('No menu data found');
      return;
    }

    try {
      const menuItems = JSON.parse(menuDataAttr);
      console.log('Menu items loaded:', menuItems);
      
      const mobileList = this.querySelector('.navbar__mobile-content .navbar__mobile-list');
      
      if (mobileList && menuItems.length > 0) {
        mobileList.innerHTML = menuItems.map(item => `
          <li class="navbar__mobile-item">
            <a href="${item.url}" class="navbar__mobile-link">
              ${item.label}
            </a>
          </li>
        `).join('');
        
        console.log('Mobile menu items rendered:', menuItems.length);
      }
    } catch (error) {
      console.error('Error parsing menu data:', error);
    }
  }

  toggleMobileMenu() {
    if (!this.refs.mobileMenu) {
      console.error('Mobile menu ref not found');
      return;
    }
    
    const isOpen = this.refs.mobileMenu.classList.contains('navbar__mobile-menu--open');
    console.log('Toggle menu. Currently open:', isOpen);
    
    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    console.log('Opening mobile menu');
    
    if (!this.refs.mobileMenu) return;
    
    this.refs.mobileMenu.classList.add('navbar__mobile-menu--open');
    this.refs.mobileMenuButton?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    
    console.log('Menu opened. Classes:', this.refs.mobileMenu.className);
  }

  closeMobileMenu() {
    console.log('Closing mobile menu');
    
    if (!this.refs.mobileMenu) return;
    
    this.refs.mobileMenu.classList.remove('navbar__mobile-menu--open');
    this.refs.mobileMenuButton?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    
    console.log('Menu closed. Classes:', this.refs.mobileMenu.className);
  }
}

// Register custom element
if (!customElements.get('navbar-component')) {
  customElements.define('navbar-component', NavbarComponent);
  console.log('navbar-component registered');
}

// Animated search placeholder
(function initAnimatedSearch() {
  const container = document.querySelector('.animated-search-container');
  if (!container) return;

  const input = container.querySelector('.navbar__search-input');
  const animatedSpan = container.querySelector('.search-placeholder .animated');
  const placeholder = container.querySelector('.search-placeholder');
  
  if (!input || !animatedSpan) return;

  const terms = ['Kurtis', 'Sarees', 'Short Tops', 'Tube Tops', 'Trending', 'Summer fits'];
  let index = 0;
  let timeout;

  function nextTerm() {
    // Slide current term UP and fade out
    animatedSpan.classList.remove('fade-in');
    animatedSpan.classList.add('fade-out');
    
    setTimeout(() => {
      // Change text
      index = (index + 1) % terms.length;
      animatedSpan.textContent = terms[index];
      
      // Slide new term UP from bottom
      animatedSpan.classList.remove('fade-out');
      animatedSpan.classList.add('fade-in');
      
      // Remove fade-in class after animation
      setTimeout(() => {
        animatedSpan.classList.remove('fade-in');
      }, 400);
      
      timeout = setTimeout(nextTerm, 3000);
    }, 400); // Wait for slide-up animation
  }

  // Start animation after 2s
  timeout = setTimeout(nextTerm, 2000);

  // Hide on focus
  input.addEventListener('focus', () => {
    clearTimeout(timeout);
    placeholder.style.opacity = '0';
    placeholder.style.visibility = 'hidden';
  });

  // Resume on blur if empty
  input.addEventListener('blur', () => {
    if (!input.value.trim()) {
      placeholder.style.opacity = '1';
      placeholder.style.visibility = 'visible';
      timeout = setTimeout(nextTerm, 2000);
    }
  });

  // Hide when typing
  input.addEventListener('input', (e) => {
    if (e.target.value.length > 0) {
      placeholder.style.opacity = '0';
      placeholder.style.visibility = 'hidden';
    } else {
      placeholder.style.opacity = '1';
      placeholder.style.visibility = 'visible';
    }
  });
})();