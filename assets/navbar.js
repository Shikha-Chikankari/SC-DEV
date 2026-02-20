class NavbarComponent extends HTMLElement {
  constructor() {
    super();
    this.refs = {};
  }

  connectedCallback() {
    requestAnimationFrame(() => {
      this.setupRefs();
      this.init();
    });
  }

  setupRefs() {
    this.refs.mobileMenuButton = document.getElementById('mobile-menu-trigger');
    this.refs.mobileCloseButton = document.getElementById('mobile-menu-close');
    this.refs.mobileMenu = document.getElementById('mobile-drawer');
    this.refs.backdrop = document.getElementById('mobile-backdrop');
  }

  init() {
    this.setAttribute('data-scroll-state', 'visible');
    this.loadMenuItems();
    this.setupMobileMenu();
  }

  setupMobileMenu() {
    if (!this.refs.mobileMenuButton || !this.refs.mobileMenu) {
      console.error('Mobile menu elements not found', {
        button: !!this.refs.mobileMenuButton,
        menu: !!this.refs.mobileMenu
      });
      return;
    }

    // Open
    this.refs.mobileMenuButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.openMobileMenu();
    });

    // Close button
    if (this.refs.mobileCloseButton) {
      this.refs.mobileCloseButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeMobileMenu();
      });
    }

    // Backdrop click
    if (this.refs.backdrop) {
      this.refs.backdrop.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeMobileMenu();
    });
  }

  openMobileMenu() {
    this.refs.mobileMenu.classList.add('navbar__mobile-menu--open');
    if (this.refs.backdrop) {
      this.refs.backdrop.classList.add('navbar__backdrop--visible');
    }
    document.body.style.overflow = 'hidden';
  }

  closeMobileMenu() {
    this.refs.mobileMenu.classList.remove('navbar__mobile-menu--open');
    if (this.refs.backdrop) {
      this.refs.backdrop.classList.remove('navbar__backdrop--visible');
    }
    document.body.style.overflow = '';
  }

  loadMenuItems() {
    const menuDataAttr = this.dataset.menuData;
    if (!menuDataAttr) return;

    try {
      const menuItems = JSON.parse(menuDataAttr);
      const mobileList = document.querySelector('#mobile-drawer .navbar__mobile-list');

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
}

if (!customElements.get('navbar-component')) {
  customElements.define('navbar-component', NavbarComponent);
}