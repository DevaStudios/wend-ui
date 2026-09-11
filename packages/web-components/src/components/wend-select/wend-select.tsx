import { Component, Prop, State, Watch, Element, Event, EventEmitter, Listen, h } from '@stencil/core';
import { positionFloatingPanel, startFloatingPanelAutoUpdate, capPanelRows, onOutsideMouseDown } from '../../utils/floating-ui';

export type WendSelectState = 'default' | 'success' | 'warning' | 'error';

type OptionLike = HTMLElement & {
  value?: string;
  selected?: boolean;
  active?: boolean;
  disabled?: boolean;
  optionId?: string;
};

let instanceCount = 0;

/** Panel scrolls after this many options rather than growing indefinitely. */
const MAX_VISIBLE_OPTIONS = 5;

@Component({
  tag: 'wend-select',
  styleUrl: '../../../../styles/src/components/wend-select.css',
  shadow: false,
  scoped: true
})
export class WendSelect {
  @Element() el!: HTMLElement;

  /** The select's label text. Can be an empty string for a label-less select. */
  @Prop() label: string = '';

  /** Whether the label is rendered. */
  @Prop() showLabel = true;

  /** Value of the currently selected wend-option child. */
  @Prop() value?: string;

  /** Text shown in the trigger when no option is selected. */
  @Prop() placeholder: string = 'Select…';

  /** Supplementary message shown below the field, e.g. a validation message. Can be an empty string to render nothing. */
  @Prop() helpText: string = '';

  /** Whether the help text is rendered. */
  @Prop() showHelpText = true;

  /** Validation state of the field. Drives the field's border color and the help text's tone. */
  @Prop() state: WendSelectState = 'default';

  /** Disables the select and every wend-option child. */
  @Prop() disabled = false;

  /** Marks the select as required. Renders a marker after the label and sets aria-required on the trigger. */
  @Prop() required = false;

  /** Name submitted for this select when part of a form. */
  @Prop() name?: string;

  /**
   * Mirrors `value` so the component can update its own render in response to user
   * interaction, not just to a new `value` prop from the consumer. Set in `componentWillLoad`,
   * not as a field initializer — the initializer runs in the constructor, before Stencil applies
   * the initial `value` attribute value onto `this.value`. Same convention as wend-text-input.
   */
  @State() currentValue?: string;

  /** Whether the option panel is open. */
  @State() isOpen = false;

  /** Value of the keyboard-active option — highlighted, not necessarily selected yet. */
  @State() activeValue?: string;

  /** Emitted when the selected value changes. */
  @Event() wendChange!: EventEmitter<string>;

  private triggerEl?: HTMLButtonElement;
  private panelEl?: HTMLDivElement;
  private stopAutoUpdate?: () => void;
  private stopOutsideClick?: () => void;
  private readonly instanceId = `wend-select-${++instanceCount}`;

  componentWillLoad() {
    this.currentValue = this.value;
  }

  @Watch('value')
  syncValue(value?: string) {
    this.currentValue = value;
  }

  componentDidLoad() {
    this.syncOptions();
  }

  componentDidUpdate() {
    this.syncOptions();
  }

  disconnectedCallback() {
    this.stopAutoUpdate?.();
    this.stopOutsideClick?.();
  }

  /**
   * Listens for wend-option's click-driven wendChange, the same coordinator pattern
   * wend-radio-group uses for wend-radio — filter out this component's own emitted
   * wendChange (it bubbles right back up through this same listener) and read the
   * option's value off event.target rather than event.detail (detail is just `true`).
   */
  @Listen('wendChange')
  onOptionChange(event: CustomEvent<boolean>) {
    if (event.target === this.el) {
      return;
    }
    event.stopPropagation();
    const option = event.target as OptionLike;
    if (!event.detail || option.value === undefined) {
      return;
    }
    this.selectValue(option.value);
  }

  private getOptions(): OptionLike[] {
    return Array.from(this.el.querySelectorAll('wend-option')) as OptionLike[];
  }

  private syncOptions() {
    for (const option of this.getOptions()) {
      const optionValue = option.value;
      option.selected = optionValue !== undefined && optionValue === this.currentValue;
      option.active = optionValue !== undefined && optionValue === this.activeValue;
      option.optionId = optionValue !== undefined ? `${this.instanceId}-option-${optionValue}` : undefined;
      if (this.disabled) {
        option.disabled = true;
      }
    }
  }

  private selectedLabel(): string | undefined {
    const match = this.getOptions().find((option) => option.value === this.currentValue);
    return match?.textContent?.trim() || undefined;
  }

  private selectValue(value: string) {
    this.currentValue = value;
    this.wendChange.emit(value);
    this.closePanel();
    this.triggerEl?.focus();
  }

  private updatePosition = async () => {
    if (!this.triggerEl || !this.panelEl) {
      return;
    }
    await positionFloatingPanel(this.triggerEl, this.panelEl);
    this.updatePanelMaxHeight();
  };

  /** Caps the panel to MAX_VISIBLE_OPTIONS rows, scrolling beyond that — see capPanelRows's own doc comment for why. */
  private updatePanelMaxHeight() {
    if (!this.panelEl) {
      return;
    }
    capPanelRows(this.panelEl, this.getOptions(), MAX_VISIBLE_OPTIONS);
  }

  private openPanel = (initialActive?: string) => {
    if (this.disabled || this.isOpen) {
      return;
    }
    this.isOpen = true;
    this.activeValue = initialActive ?? this.currentValue ?? this.getOptions().find((option) => !option.disabled)?.value;
    // Position after the panel has actually rendered (isOpen just flipped this render cycle).
    requestAnimationFrame(() => {
      this.updatePosition();
      if (this.triggerEl && this.panelEl) {
        this.stopAutoUpdate = startFloatingPanelAutoUpdate(this.triggerEl, this.panelEl, this.updatePosition);
      }
    });
    this.stopOutsideClick = onOutsideMouseDown(this.el, () => this.closePanel());
  };

  private closePanel = () => {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.stopAutoUpdate?.();
    this.stopAutoUpdate = undefined;
    this.stopOutsideClick?.();
    this.stopOutsideClick = undefined;
  };

  private toggleOpen = () => {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  };

  private moveActive(delta: number) {
    const options = this.getOptions().filter((option) => !option.disabled);
    if (options.length === 0) {
      return;
    }
    const currentIndex = options.findIndex((option) => option.value === this.activeValue);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + delta + options.length) % options.length;
    this.activeValue = options[nextIndex].value;
  }

  private jumpActive(edge: 'first' | 'last') {
    const options = this.getOptions().filter((option) => !option.disabled);
    const target = edge === 'first' ? options[0] : options[options.length - 1];
    if (target) {
      this.activeValue = target.value;
    }
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (this.disabled) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.isOpen) {
          this.moveActive(1);
        } else {
          this.openPanel();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen) {
          this.moveActive(-1);
        } else {
          this.openPanel();
        }
        break;
      case 'Home':
        if (this.isOpen) {
          event.preventDefault();
          this.jumpActive('first');
        }
        break;
      case 'End':
        if (this.isOpen) {
          event.preventDefault();
          this.jumpActive('last');
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isOpen) {
          this.openPanel();
        } else if (this.activeValue !== undefined) {
          this.selectValue(this.activeValue);
        }
        break;
      case 'Escape':
        if (this.isOpen) {
          event.preventDefault();
          this.closePanel();
        }
        break;
      case 'Tab':
        this.closePanel();
        break;
    }
  };

  render() {
    const { label, showLabel, required, helpText, showHelpText, state, disabled, isOpen, placeholder } = this;
    const listboxId = `${this.instanceId}-listbox`;
    const activeOptionId = this.activeValue !== undefined ? `${this.instanceId}-option-${this.activeValue}` : undefined;
    const selectedLabel = this.selectedLabel();

    return (
      <div class={{ disabled }}>
        {showLabel && label && (
          <span class="label-row">
            <span class="label-text">{label}</span>
            {required && (
              <span class="required-marker" aria-hidden="true">
                *
              </span>
            )}
          </span>
        )}
        <button
          type="button"
          class={{ field: true, [state]: true, open: isOpen }}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen ? 'true' : 'false'}
          aria-controls={listboxId}
          aria-activedescendant={isOpen ? activeOptionId : undefined}
          aria-required={required ? 'true' : undefined}
          name={this.name}
          ref={(el) => (this.triggerEl = el as HTMLButtonElement)}
          onClick={this.toggleOpen}
          onKeyDown={this.onKeyDown}
        >
          <span class={{ value: true, placeholder: !selectedLabel }}>{selectedLabel ?? placeholder}</span>
          <wend-icon name={isOpen ? 'chevron-up' : 'chevron-down'} size="var(--select-chevron-size, 16px)"></wend-icon>
        </button>
        {showHelpText && helpText && <wend-help-text text={helpText} type={state}></wend-help-text>}
        <div
          id={listboxId}
          role="listbox"
          class={{ panel: true, open: isOpen }}
          ref={(el) => (this.panelEl = el as HTMLDivElement)}
        >
          <slot></slot>
        </div>
      </div>
    );
  }
}
