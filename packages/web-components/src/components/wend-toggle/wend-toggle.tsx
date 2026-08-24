import { Component, Prop, State, Watch, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'wend-toggle',
  styleUrl: '../../../../styles/src/components/wend-toggle.css',
  shadow: false,
  scoped: true
})
export class WendToggle {
  /** Whether the toggle is on. */
  @Prop() checked = false;

  /** Disables the toggle. */
  @Prop() disabled = false;

  /**
   * Mirrors `checked` so the component can update its own render in response to user
   * interaction, not just to a new `checked` prop from the consumer. Set in `componentWillLoad`,
   * not as a field initializer — the initializer runs in the constructor, before Stencil applies
   * the initial `checked` attribute value onto `this.checked`.
   */
  @State() isChecked!: boolean;

  componentWillLoad() {
    this.isChecked = this.checked;
  }

  @Watch('checked')
  syncChecked(checked: boolean) {
    this.isChecked = checked;
  }

  /** Emitted when the toggle is switched by the user. */
  @Event() wendChange!: EventEmitter<boolean>;

  private onChange = (event: Event) => {
    this.isChecked = (event.target as HTMLInputElement).checked;
    this.wendChange.emit(this.isChecked);
  };

  render() {
    const { isChecked, disabled } = this;
    return (
      <label class={{ disabled }}>
        <input type="checkbox" role="switch" checked={isChecked} disabled={disabled} onChange={this.onChange} />
        <span class="track">
          <span class="thumb"></span>
        </span>
      </label>
    );
  }
}
