import { Component, Prop, State, Watch, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'wend-radio',
  styleUrl: '../../../../styles/src/components/wend-radio.css',
  shadow: false,
  scoped: true
})
export class WendRadio {
  /** Whether the radio button is selected. */
  @Prop() selected = false;

  /** Name of the radio group this button belongs to. Radios sharing a name are mutually exclusive. */
  @Prop() name?: string;

  /** Value submitted for this radio button when part of a form. */
  @Prop() value?: string;

  /** The radio button's label text. Can be an empty string for a label-less radio button. */
  @Prop() label: string = '';

  /** Disables the radio button. */
  @Prop() disabled = false;

  /**
   * Mirrors `selected` so the component can update its own render in response to user
   * interaction, not just to a new `selected` prop from the consumer. Set in `componentWillLoad`,
   * not as a field initializer — the initializer runs in the constructor, before Stencil applies
   * the initial `selected` attribute value onto `this.selected`.
   */
  @State() isSelected!: boolean;

  componentWillLoad() {
    this.isSelected = this.selected;
  }

  @Watch('selected')
  syncSelected(selected: boolean) {
    this.isSelected = selected;
  }

  /** Emitted when the radio button is selected by the user. */
  @Event() wendChange!: EventEmitter<boolean>;

  private onChange = (event: Event) => {
    this.isSelected = (event.target as HTMLInputElement).checked;
    this.wendChange.emit(this.isSelected);
  };

  render() {
    const { isSelected, name, value, label, disabled } = this;
    return (
      <label class={{ disabled }}>
        <input
          type="radio"
          name={name}
          value={value}
          checked={isSelected}
          disabled={disabled}
          onChange={this.onChange}
        />
        <span class="control">
          <span class="dot"></span>
        </span>
        {label && <span>{label}</span>}
      </label>
    );
  }
}
