(function () {
  var SECTIONS = {
    'get-started': {
      label: 'Get Started',
      pages: [
        { slug: 'installation', label: 'Installation' },
        { slug: 'basic-usage', label: 'Basic usage' },
        { slug: 'using-with-react', label: 'Using with React' }
      ]
    },
    components: {
      label: 'Components',
      pages: [
        { slug: 'button', label: 'Button' },
        { slug: 'checkbox', label: 'Checkbox' },
        { slug: 'chip', label: 'Chip' },
        { slug: 'help-text', label: 'Help Text' },
        { slug: 'icon', label: 'Icon' },
        { slug: 'option', label: 'Option' },
        { slug: 'radio', label: 'Radio' },
        { slug: 'radio-group', label: 'Radio Group' },
        { slug: 'select', label: 'Select' },
        { slug: 'text-area', label: 'Text Area' },
        { slug: 'text-input', label: 'Text Input' },
        { slug: 'toggle', label: 'Toggle' }
      ]
    },
    foundations: {
      label: 'Foundations',
      pages: [
        { slug: 'color', label: 'Color' },
        { slug: 'spacing', label: 'Spacing' },
        { slug: 'radius', label: 'Radius' },
        { slug: 'typography', label: 'Typography' }
      ]
    }
  };

  class WendDocsSidebar extends HTMLElement {
    connectedCallback() {
      var section = SECTIONS[this.getAttribute('section')];
      if (!section) return;

      var current = this.getAttribute('current');

      var nav = document.createElement('nav');
      nav.className = 'wend-sidebar';
      nav.setAttribute('aria-label', section.label + ' pages');

      var label = document.createElement('span');
      label.className = 'wend-sidebar__label';
      label.textContent = section.label;
      nav.appendChild(label);

      section.pages.forEach(function (page) {
        var link = document.createElement('a');
        link.className = 'wend-sidebar__link';
        link.href = page.slug + '.html';
        link.textContent = page.label;
        if (page.slug === current) {
          link.setAttribute('aria-current', 'page');
        }
        nav.appendChild(link);
      });

      this.replaceWith(nav);
    }
  }

  customElements.define('wend-docs-sidebar', WendDocsSidebar);
})();
