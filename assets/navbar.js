import { Component } from '@theme/component';
import { debounce, isMobileBreakpoint } from '@theme/utilities';

/**
 * Menu item structure from metadata/API
 * @typedef {Object} MenuItem
 * @property {string} id - Unique identifier
 * @property {string} label - Display label
 * @property {string} url - Link URL
 * @property {MenuItem[]} [children] - Sub-menu items
 */

/**
 * A custom web component for a dynamic, metadata-driven navbar.
 * Renders navigation items pulled from backend data instead of hardcoded menus.
 *
 * @typedef {object} NavbarRefs
 * @property {HTMLElement} navList - The main nav list container
 * @property {HTMLElement} mobileMenuButton - Mobile menu toggle button
 * @property {HTMLElement} mobileMenu - Mobile menu container
 *
 * @extends Component<NavbarRefs>
 */
class NavbarComponent extends Component {
  requiredRefs = ['navList'];

  /** @type {MenuItem[]} */
  #menuItems = [];

  /** @type {AbortController} */
  #abortController = new AbortController();

  /** @type {HTMLElement | null} */
  #activeSubmenu = null;

  connectedCallback() {
    super.connectedCallback();

    const { signal } = this.#abortController;

    // Fetch menu items from metadata/API
    this.#loadMenuItems();

    // Setup event listeners
    this.addEventListener('pointerenter', this.#handleItemHover, { signal, capture: true });
    this.addEventListener('pointerleave', this.#handleItemLeave, { signal, capture: true });
    this.addEventListener('click', this.#handleItemClick, { signal });
    this.addEventListener('keydown', this.#handleKeyDown, { signal });

    // Mobile menu toggle
    if (this.refs.mobileMenuButton) {
      this.refs.mobileMenuButton.addEventListener('click', this.#toggleMobileMenu, { signal });
    }

    // Close menu on window resize
    window.addEventListener('resize', debounce(this.#handleResize, 150), { signal });

    // Close mobile menu on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.#closeMobileMenu();
    }, { signal });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#abortController.abort();
  }

  /**
   * Loads menu items from metadata attribute or API endpoint
   * @private
   */
  #loadMenuItems = async () => {
    try {
      const menuDataAttr = this.dataset.menuData;
      const apiEndpoint = this.dataset.apiEndpoint;

      let menuItems = [];

      if (menuDataAttr) {
        // Parse JSON from data attribute
        menuItems = JSON.parse(menuDataAttr);
      } else if (apiEndpoint) {
        // Fetch from API endpoint
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error(`Failed to fetch menu: ${response.status}`);
        const data = await response.json();
        menuItems = data.menu || data.items || [];
      }

      this.#menuItems = menuItems;
      this.#renderMenu();
    } catch (error) {
      console.error('Failed to load navbar menu:', error);
    }
  };

  /**
   * Renders the menu items into the DOM
   * @private
   */
  #renderMenu = () => {
    const navList = this.refs.navList;
    const mobileList = this.querySelector('.navbar__mobile-list');

    if (!navList) return;

    navList.innerHTML = '';
    if (mobileList) mobileList.innerHTML = '';

    this.#menuItems.forEach((item) => {
      const li = this.#createMenuItemElement(item);
      navList.appendChild(li);

      if (mobileList) {
        const mobileLi = this.#createMobileMenuItemElement(item);
        mobileList.appendChild(mobileLi);
      }
    });
  };

  /**
   * Creates a desktop menu item element with optional submenu
   * @param {MenuItem} item - The menu item data
   * @returns {HTMLElement} The rendered menu item
   * @private
   */
  #createMenuItemElement = (item) => {
    const li = document.createElement('li');
    li.className = 'navbar__item';
    li.dataset.id = item.id;

    // Main link
    const link = document.createElement('a');
    link.href = item.url;
    link.className = 'navbar__link';
    link.textContent = item.label;

    li.appendChild(link);

    // Submenu if children exist
    if (item.children && item.children.length > 0) {
      link.setAttribute('aria-haspopup', 'true');
      link.setAttribute('aria-expanded', 'false');

      const submenu = this.#createSubmenu(item.children);
      li.appendChild(submenu);
    }

    return li;
  };

  /**
   * Creates a mobile menu item element
   * @param {MenuItem} item - The menu item data
   * @returns {HTMLElement} The rendered menu item
   * @private
   */
  #createMobileMenuItemElement = (item) => {
    const li = document.createElement('li');
    li.className = 'navbar__mobile-item';
    li.dataset.id = item.id;

    const link = document.createElement('a');
    link.href = item.url;
    link.className = 'navbar__mobile-link';
    link.textContent = item.label;

    li.appendChild(link);

    // Mobile submenu if children exist
    if (item.children && item.children.length > 0) {
      const expandBtn = document.createElement('button');
      expandBtn.className = 'navbar__mobile-expand';
      expandBtn.setAttribute('aria-expanded', 'false');
      expandBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>';

      expandBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.#toggleMobileSubmenu(li);
      });

      li.appendChild(expandBtn);

      const submenu = document.createElement('ul');
      submenu.className = 'navbar__mobile-submenu';

      item.children.forEach((child) => {
        const childLi = document.createElement('li');
        const childLink = document.createElement('a');
        childLink.href = child.url;
        childLink.className = 'navbar__mobile-submenu-link';
        childLink.textContent = child.label;

        childLi.appendChild(childLink);
        submenu.appendChild(childLi);
      });

      li.appendChild(submenu);
    }

    return li;
  };

  /**
   * Creates a submenu element
   * @param {MenuItem[]} items - Submenu items
   * @returns {HTMLElement} The submenu element
   * @private
   */
  #createSubmenu = (items) => {
    const ul = document.createElement('ul');
    ul.className = 'navbar__submenu';

    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'navbar__submenu-item';

      const link = document.createElement('a');
      link.href = item.url;
      link.className = 'navbar__submenu-link';
      link.textContent = item.label;

      li.appendChild(link);
      ul.appendChild(li);
    });

    return ul;
  };

  /**
   * Toggles mobile submenu visibility
   * @param {HTMLElement} item - The menu item element
   * @private
   */
  #toggleMobileSubmenu = (item) => {
    const submenu = item.querySelector('.navbar__mobile-submenu');
    const expandBtn = item.querySelector('.navbar__mobile-expand');

    if (!submenu || !expandBtn) return;

    const isExpanded = expandBtn.getAttribute('aria-expanded') === 'true';

    expandBtn.setAttribute('aria-expanded', (!isExpanded).toString());
    submenu.classList.toggle('navbar__mobile-submenu--open');
  };

  /**
   * Handles item hover to show submenu
   * @param {PointerEvent} event
   * @private
   */
  #handleItemHover = (event) => {
    if (isMobileBreakpoint()) return;

    const li = event.target.closest('.navbar__item');
    if (!li) return;

    const link = li.querySelector('.navbar__link');
    const submenu = li.querySelector('.navbar__submenu');

    if (submenu) {
      this.#closeActiveSubmenu();
      this.#activeSubmenu = submenu;
      submenu.classList.add('navbar__submenu--active');
      link.setAttribute('aria-expanded', 'true');
    }
  };

  /**
   * Handles item leave to hide submenu
   * @param {PointerEvent} event
   * @private
   */
  #handleItemLeave = (event) => {
    if (isMobileBreakpoint()) return;

    const li = event.target.closest('.navbar__item');
    if (!li) return;

    const submenu = li.querySelector('.navbar__submenu');
    const link = li.querySelector('.navbar__link');

    if (submenu && submenu === this.#activeSubmenu) {
      submenu.classList.remove('navbar__submenu--active');
      link.setAttribute('aria-expanded', 'false');
      this.#activeSubmenu = null;
    }
  };

  /**
   * Handles click on menu items (for mobile and accessibility)
   * @param {PointerEvent} event
   * @private
   */
  #handleItemClick = (event) => {
    const link = event.target.closest('.navbar__link');
    if (!link) return;

    const hasSubmenu = link.getAttribute('aria-haspopup') === 'true';
    if (!hasSubmenu) return;

    event.preventDefault();

    const li = link.closest('.navbar__item');
    const submenu = li?.querySelector('.navbar__submenu');

    if (submenu) {
      const isOpen = submenu.classList.contains('navbar__submenu--active');

      this.#closeActiveSubmenu();

      if (!isOpen) {
        this.#activeSubmenu = submenu;
        submenu.classList.add('navbar__submenu--active');
        link.setAttribute('aria-expanded', 'true');
      }
    }
  };

  /**
   * Handles keyboard navigation
   * @param {KeyboardEvent} event
   * @private
   */
  #handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      this.#closeActiveSubmenu();
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.#navigateSubmenu(event.key === 'ArrowDown');
    }
  };

  /**
   * Navigates submenu items with arrow keys
   * @param {boolean} forward - Whether to move forward or backward
   * @private
   */
  #navigateSubmenu = (forward) => {
    if (!this.#activeSubmenu) return;

    const items = Array.from(this.#activeSubmenu.querySelectorAll('.navbar__submenu-link'));
    const focused = document.activeElement;

    if (!items.includes(focused)) {
      items[0]?.focus();
      return;
    }

    const currentIndex = items.indexOf(focused);
    const nextIndex = forward ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < items.length) {
      items[nextIndex].focus();
    }
  };

  /**
   * Closes the currently active submenu
   * @private
   */
  #closeActiveSubmenu = () => {
    if (!this.#activeSubmenu) return;

    this.#activeSubmenu.classList.remove('navbar__submenu--active');

    const link = this.#activeSubmenu.previousElementSibling;
    if (link instanceof HTMLAnchorElement) {
      link.setAttribute('aria-expanded', 'false');
    }

    this.#activeSubmenu = null;
  };

  /**
   * Toggles the mobile menu
   * @private
   */
  #toggleMobileMenu = () => {
    const mobileMenu = this.refs.mobileMenu;
    if (!mobileMenu) return;

    const isOpen = mobileMenu.classList.contains('navbar__mobile-menu--open');

    if (isOpen) {
      this.#closeMobileMenu();
    } else {
      mobileMenu.classList.add('navbar__mobile-menu--open');
      this.refs.mobileMenuButton?.setAttribute('aria-expanded', 'true');
    }
  };

  /**
   * Closes the mobile menu
   * @private
   */
  #closeMobileMenu = () => {
    const mobileMenu = this.refs.mobileMenu;
    if (!mobileMenu) return;

    mobileMenu.classList.remove('navbar__mobile-menu--open');
    this.refs.mobileMenuButton?.setAttribute('aria-expanded', 'false');
  };

  /**
   * Handles window resize
   * @private
   */
  #handleResize = () => {
    if (!isMobileBreakpoint()) {
      this.#closeMobileMenu();
    }
  };
}

if (!customElements.get('navbar-component')) {
  customElements.define('navbar-component', NavbarComponent);
}

export { NavbarComponent };
