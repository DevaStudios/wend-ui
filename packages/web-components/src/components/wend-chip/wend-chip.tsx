import { Component, Prop, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'wend-chip',
  styleUrl: '../../../../styles/src/components/wend-chip.css',
  shadow: false,
  scoped: true
})
export class WendChip {
  /** The chip's label text. */
  @Prop() label: string = '';

  /** Disables the chip and its close button. */
  @Prop() disabled = false;

  /** Whether the chip renders a close button for removing it. */
  @Prop() closable = true;

  /** Emitted when the close button is activated. Not emitted while disabled. */
  @Event() wendClose!: EventEmitter<void>;

  private onClose = () => {
    this.wendClose.emit();
  };

  render() {
    const { label, disabled, closable } = this;
    return (
      <span class={{ chip: true, disabled }}>
        <span class="label">{label}</span>
        {closable && (
          <button
            type="button"
            class="close"
            disabled={disabled}
            aria-label={`Remove ${label}`}
            onClick={this.onClose}
          >
            <wend-icon name="close-solid" size="16px"></wend-icon>
          </button>
        )}
      </span>
    );
  }
}
