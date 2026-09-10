(function () {
  var SECTIONS = [
    { key: 'get-started', label: 'Get Started', href: 'docs/get-started/installation.html' },
    { key: 'components', label: 'Components', href: 'docs/components/button.html' },
    { key: 'foundations', label: 'Foundations', href: 'docs/foundations/color.html' },
    { key: 'agent-log', label: 'Agent Log', href: 'agent-log.html' }
  ];

  class WendDocsNav extends HTMLElement {
    connectedCallback() {
      var base = this.getAttribute('base') || '';
      var current = this.getAttribute('current');

      var nav = document.createElement('nav');
      nav.className = 'wend-nav';

      var brand = document.createElement('a');
      brand.className = 'wend-nav__brand';
      brand.href = base + 'index.html';
      brand.textContent = 'wend-ui';
      nav.appendChild(brand);

      var sections = document.createElement('div');
      sections.className = 'wend-nav__sections';
      SECTIONS.forEach(function (section) {
        var link = document.createElement('a');
        link.className = 'wend-nav__section-link';
        link.href = base + section.href;
        link.textContent = section.label;
        if (section.key === current) {
          link.setAttribute('aria-current', 'page');
        }
        sections.appendChild(link);
      });
      nav.appendChild(sections);

      var right = document.createElement('div');
      right.className = 'wend-nav__right';

      var storybookLink = document.createElement('a');
      storybookLink.className = 'wend-nav__storybook-link';
      storybookLink.href = base + 'storybook/index.html';
      storybookLink.textContent = 'Storybook';
      right.appendChild(storybookLink);

      var themeToggle = document.createElement('button');
      themeToggle.type = 'button';
      themeToggle.className = 'wend-theme-toggle';
      themeToggle.setAttribute('aria-pressed', 'false');
      themeToggle.setAttribute('aria-label', 'Switch to dark mode');
      themeToggle.setAttribute('onclick', 'wendToggleTheme()');
      var icon = document.createElement('wend-icon');
      icon.setAttribute('name', 'dark-mode');
      icon.setAttribute('size', '20px');
      themeToggle.appendChild(icon);
      right.appendChild(themeToggle);

      nav.appendChild(right);

      this.replaceWith(nav);
    }
  }

  customElements.define('wend-docs-nav', WendDocsNav);
})();
