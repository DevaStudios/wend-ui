import { Component, Prop, State, Watch, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'wend-checkbox',
  styleUrl: '../../../../styles/src/components/wend-checkbox.css',
  shadow: false,
  scoped: true
})
export class WendCheckbox {
  /** Whether the checkbox is checked. */
  @Prop() checked = false;

  /** The checkbox's label text. Can be an empty string for a label-less checkbox. */
  @Prop() label: string = '';

  /** Disables the checkbox. */
  @Prop() disabled = false;

  /**
   * Mirrors `checked` so the component can update its own render (the checkmark icon)
   * in response to user interaction, not just to a new `checked` prop from the consumer.
   * Set in `componentWillLoad`, not as a field initializer — the initializer runs in the
   * constructor, before Stencil applies the initial `checked` attribute value onto `this.checked`,
   * which left `isChecked` stuck at `false` on first render even when `checked="true"` was set.
   */
  @State() isChecked!: boolean;

  componentWillLoad() {
    this.isChecked = this.checked;
  }

  @Watch('checked')
  syncChecked(checked: boolean) {
    this.isChecked = checked;
  }

  /** Emitted when the checkbox is toggled by the user. */
  @Event() wendChange!: EventEmitter<boolean>;

  private onChange = (event: Event) => {
    this.isChecked = (event.target as HTMLInputElement).checked;
    this.wendChange.emit(this.isChecked);
  };

  render() {
    const { isChecked, label, disabled } = this;
    return (
      <label class={{ disabled }}>
        <input type="checkbox" checked={isChecked} disabled={disabled} onChange={this.onChange} />
        <span class="box">{isChecked && <wend-icon name="check-solid" size="12px" />}</span>
        {label && <span>{label}</span>}
      </label>
    );
  }
}
