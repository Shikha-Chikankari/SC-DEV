/**
 * Navbar Component - With ultra-responsive scroll behavior
 */
class NavbarComponent extends HTMLElement {
  constructor() {
    super();
    this.refs = {};
    this.activeSubmenu = null;
  }

  connectedCallback() {
    // Detect Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      this.setAttribute('data-browser', 'safari');
    }

    setTimeout(() => {
      this.setupRefs();
      this.init();
      this.initScrollBehavior();
    }, 50);
  }

  setupRefs() {
    this.refs.navList = this.querySelector('[ref="navList"]');
    this.refs.mobileMenuButton = this.querySelector('[ref="mobileMenuButton"]');
    this.refs.mobileMenu = this.querySelector('[ref="mobileMenu"]');
    this.refs.mobileList = this.querySelector('.navbar__mobile-list');
    this.refs.navbar = this.querySelector('.navbar');
  }

  init() {
    console.log('Navbar initialized');
    
    this.loadMenuItems();
    
    if (this.refs.mobileMenuButton && this.refs.mobileMenu) {
      console.log('Setting up mobile menu');
      
      this.refs.mobileMenuButton.addEventListener('click', (e) => {
        console.log('Hamburger clicked!');
        e.preventDefault();
        e.stopPropagation();
        this.toggleMobileMenu();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (this.refs.mobileMenu && 
          this.refs.mobileMenu.classList.contains('navbar__mobile-menu--open') &&
          !this.refs.mobileMenu.contains(e.target) &&
          !this.refs.mobileMenuButton.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
  }

  // SCROLL BEHAVIOR - Shows navbar immediately on scroll up
  initScrollBehavior() {
  // Always visible – just mark state once
  this.setAttribute('data-scroll-state', 'top');
  console.log('Scroll behavior disabled: navbar always visible');
}

  loadMenuItems() {
    const menuDataAttr = this.dataset.menuData;
    if (!menuDataAttr) {
      console.log('No menu data attribute found');
      return;
    }

    try {
      const menuItems = JSON.parse(menuDataAttr);
      console.log('Menu items loaded:', menuItems.length, 'items');
      
      const mobileList = this.querySelector('.navbar__mobile-content .navbar__mobile-list');
      
      if (mobileList && menuItems && menuItems.length > 0) {
        mobileList.innerHTML = menuItems.map(item => `
          <li class="navbar__mobile-item">
            <a href="${item.url}" class="navbar__mobile-link">${item.label}</a>
          </li>
        `).join('');
        console.log('Mobile menu rendered with', menuItems.length, 'items');
      }
    } catch (error) {
      console.error('Error parsing menu data:', error);
    }
  }

  toggleMobileMenu() {
    if (!this.refs.mobileMenu) return;

    const isOpen = this.refs.mobileMenu.classList.contains('navbar__mobile-menu--open');
    console.log('Toggle mobile menu, currently open:', isOpen);

    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    console.log('Opening mobile menu');
    this.refs.mobileMenu.classList.add('navbar__mobile-menu--open');
    this.refs.mobileMenuButton?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  closeMobileMenu() {
    console.log('Closing mobile menu');
    if (!this.refs.mobileMenu) return;
    
    this.refs.mobileMenu.classList.remove('navbar__mobile-menu--open');
    this.refs.mobileMenuButton?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

// Register the custom element
if (!customElements.get('navbar-component')) {
  customElements.define('navbar-component', NavbarComponent);
  console.log('navbar-component registered');
}