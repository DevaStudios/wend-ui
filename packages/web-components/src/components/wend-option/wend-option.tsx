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
    const { selected, active, disabled, optionId } = this;
    return (
      <div
        id={optionId}
        role="option"
        aria-selected={selected ? 'true' : 'false'}
        aria-disabled={disabled ? 'true' : undefined}
        class={{ row: true, selected, active, disabled }}
        onClick={this.onClick}
      >
        <span class="value">
          <slot></slot>
        </span>
        {selected && <wend-icon name="check-solid" size="16px"></wend-icon>}
      </div>
    );
  }
}
