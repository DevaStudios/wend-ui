import { Component, Prop, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'wend-option',
  styleUrl: '../../../../styles/src/components/wend-option.css',
  shadow: false,
  scoped: true
})
export class WendOption {
  /** Value submitted for this option when selected by its parent wend-select. */
  @Prop() value!: string;

  /** Whether this option is the currently selected one. Set by the parent wend-select, not by the consumer directly. */
  @Prop() selected = false;

  /** Whether this option is the keyboard-active one (highlighted, not necessarily selected). Set by the parent wend-select. */
  @Prop() active = false;

  /** Disables this option, excluding it from selection and keyboard navigation. */
  @Prop() disabled = false;

  /**
   * Renders a decorative checkbox indicator on the left instead of the trailing checkmark
   * icon on the right. Set by a multi-select coordinator (wend-combo-box), never by the
   * consumer directly — mirrors how `selected`/`active`/`optionId` are also coordinator-set.
   * Purely visual: the real selection state is still carried by `aria-selected` on this same
   * element, exactly like the single-select checkmark it replaces.
   */
  @Prop() multi = false;

  /**
   * DOM id applied to the option's role="option" element. Set by the parent wend-select
   * (not by the consumer) so its trigger button's aria-activedescendant can reference the
   * keyboard-active option directly.
   */
  @Prop() optionId?: string;

  /**
   * Emitted when the option is clicked. Mirrors wend-radio's wendChange shape (a boolean,
   * always true here since clicking an option only ever means "select me") so the parent
   * wend-select can reuse the same @Listen('wendChange') coordinator pattern wend-radio-group
   * uses for wend-radio.
   */
  @Event() wendChange!: EventEmitter<boolean>;

  private onClick = () => {
    if (this.disabled) {
      return;
    }
    this.wendChange.emit(true);
  };

  render() {
    const { selected, active, disabled, optionId, multi } = this;
    return (
      <div
        id={optionId}
        role="option"
        aria-selected={selected ? 'true' : 'false'}
        aria-disabled={disabled ? 'true' : undefined}
        class={{ row: true, selected, active, disabled }}
        onClick={this.onClick}
      >
        {multi && (
          <span class={{ checkbox: true, checked: selected }} aria-hidden="true">
            {selected && <wend-icon name="check-solid" size="12px"></wend-icon>}
          </span>
        )}
        <span class="value">
          <slot></slot>
        </span>
        {!multi && selected && <wend-icon name="check-solid" size="16px"></wend-icon>}
      </div>
    );
  }
}
