import { Component, Prop, State, Watch, Element, Event, EventEmitter, Listen, h } from '@stencil/core';
import { positionFloatingPanel, startFloatingPanelAutoUpdate, capPanelRows, onOutsideMouseDown } from '../../utils/floating-ui';

export type WendComboBoxState = 'default' | 'success' | 'warning' | 'error';

type OptionLike = HTMLElement & {
  value?: string;
  selected?: boolean;
  active?: boolean;
  disabled?: boolean;
  optionId?: string;
  multi?: boolean;
};

let instanceCount = 0;

/** Panel scrolls after this many options rather than growing indefinitely. Same cap as wend-select. */
const MAX_VISIBLE_OPTIONS = 5;

@Component({
  tag: 'wend-combo-box',
  styleUrl: '../../../../styles/src/components/wend-combo-box.css',
  shadow: false,
  scoped: true
})
export class WendComboBox {
  @Element() el!: HTMLElement;

  /** The combo box's label text. Can be an empty string for a label-less field. */
  @Prop() label: string = '';

  /** Whether the label is rendered. */
  @Prop() showLabel = true;

  /**
   * Values of the currently selected wend-option children. A complex (array) prop — set this
   * via the JS property (`el.values = [...]`), not an HTML attribute; Stencil doesn't parse
   * array-typed attributes automatically.
   */
  @Prop() values: string[] = [];

  /** Text shown in the field when no option is selected. */
  @Prop() placeholder: string = 'Select…';

  /** Supplementary message shown below the field, e.g. a validation message. Can be an empty string to render nothing. */
  @Prop() helpText: string = '';

  /** Whether the help text is rendered. */
  @Prop() showHelpText = true;

  /** Validation state of the field. Drives the field's border color and the help text's tone. */
  @Prop() state: WendComboBoxState = 'default';

  /** Disables the combo box and every wend-option child. */
  @Prop() disabled = false;

  /** Marks the field as required. Renders a marker after the label and sets aria-required on the field. */
  @Prop() required = false;

  /** Name submitted for this combo box when part of a form. */
  @Prop() name?: string;

  /**
   * Mirrors `values` so the component can update its own render in response to user
   * interaction, not just to a new `values` prop from the consumer. Set in `componentWillLoad`,
   * not as a field initializer — same convention as wend-select's `currentValue`.
   */
  @State() currentValues: string[] = [];

  /** Whether the option panel is open. */
  @State() isOpen = false;

  /** Value of the keyboard-active option — highlighted, not necessarily selected yet. */
  @State() activeValue?: string;

  /** Emitted whenever the selection changes: an option toggled, a chip removed, or clear-all. */
  @Event() wendChange!: EventEmitter<string[]>;

  private fieldEl?: HTMLDivElement;
  private panelEl?: HTMLDivElement;
  private stopAutoUpdate?: () => void;
  private stopOutsideClick?: () => void;
  private readonly instanceId = `wend-combo-box-${++instanceCount}`;

  componentWillLoad() {
    this.currentValues = [...this.values];
  }

  @Watch('values')
  syncValues(values: string[]) {
    this.currentValues = [...values];
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

  /** Same coordinator pattern wend-select uses for wend-option — see its own note for why. */
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
    this.toggleValue(option.value);
  }

  private getOptions(): OptionLike[] {
    return Array.from(this.el.querySelectorAll('wend-option')) as OptionLike[];
  }

  private syncOptions() {
    for (const option of this.getOptions()) {
      const optionValue = option.value;
      option.selected = optionValue !== undefined && this.currentValues.includes(optionValue);
      option.active = optionValue !== undefined && optionValue === this.activeValue;
      option.optionId = optionValue !== undefined ? `${this.instanceId}-option-${optionValue}` : undefined;
      option.multi = true;
      if (this.disabled) {
        option.disabled = true;
      }
    }
  }

  private labelFor(value: string): string {
    const match = this.getOptions().find((option) => option.value === value);
    return match?.textContent?.trim() || value;
  }

  /** Toggles membership in `values` — does NOT close the panel, unlike wend-select's selectValue. */
  private toggleValue(value: string) {
    const next = this.currentValues.includes(value)
      ? this.currentValues.filter((v) => v !== value)
      : [...this.currentValues, value];
    this.currentValues = next;
    this.wendChange.emit(next);
  }

  private removeValue = (value: string) => {
    if (this.disabled) {
      return;
    }
    const next = this.currentValues.filter((v) => v !== value);
    this.currentValues = next;
    this.wendChange.emit(next);
  };

  private clearAll = (event: MouseEvent) => {
    event.stopPropagation();
    if (this.disabled || this.currentValues.length === 0) {
      return;
    }
    this.currentValues = [];
    this.wendChange.emit([]);
  };

  private updatePosition = async () => {
    if (!this.fieldEl || !this.panelEl) {
      return;
    }
    await positionFloatingPanel(this.fieldEl, this.panelEl);
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
    this.activeValue = initialActive ?? this.currentValues[0] ?? this.getOptions().find((option) => !option.disabled)?.value;
    requestAnimationFrame(() => {
      this.updatePosition();
      if (this.fieldEl && this.panelEl) {
        this.stopAutoUpdate = startFloatingPanelAutoUpdate(this.fieldEl, this.panelEl, this.updatePosition);
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

  private onFieldClick = () => {
    if (this.disabled) {
      return;
    }
    this.toggleOpen();
  };

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
          this.toggleValue(this.activeValue);
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
    const { label, showLabel, required, helpText, showHelpText, state, disabled, isOpen, placeholder, currentValues } = this;
    const listboxId = `${this.instanceId}-listbox`;
    const activeOptionId = this.activeValue !== undefined ? `${this.instanceId}-option-${this.activeValue}` : undefined;

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
        <div
          class={{ field: true, [state]: true, open: isOpen, disabled }}
          role="combobox"
          tabindex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={isOpen ? 'true' : 'false'}
          aria-controls={listboxId}
          aria-activedescendant={isOpen ? activeOptionId : undefined}
          aria-required={required ? 'true' : undefined}
          aria-disabled={disabled ? 'true' : undefined}
          ref={(el) => (this.fieldEl = el as HTMLDivElement)}
          onClick={this.onFieldClick}
          onKeyDown={this.onKeyDown}
        >
          <span class="chips">
            {currentValues.length === 0 && <span class="placeholder">{placeholder}</span>}
            {currentValues.map((value) => (
              <wend-chip
                key={value}
                label={this.labelFor(value)}
                disabled={disabled}
                onWendClose={() => this.removeValue(value)}
              ></wend-chip>
            ))}
          </span>
          <span class="icons">
            {currentValues.length > 0 && (
              <button
                type="button"
                class="icon-button"
                disabled={disabled}
                aria-label="Clear all selected"
                onClick={this.clearAll}
              >
                <wend-icon name="remove-circle" size="16px"></wend-icon>
              </button>
            )}
            <span class="chevron">
              <wend-icon name={isOpen ? 'chevron-up' : 'chevron-down'} size="16px"></wend-icon>
            </span>
          </span>
        </div>
        {showHelpText && helpText && <wend-help-text text={helpText} type={state}></wend-help-text>}
        <div
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          class={{ panel: true, open: isOpen }}
          ref={(el) => (this.panelEl = el as HTMLDivElement)}
        >
          <slot></slot>
        </div>
      </div>
    );
  }
}
