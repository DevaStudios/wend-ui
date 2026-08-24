import { Component, Prop, State, Watch, Event, EventEmitter, h } from '@stencil/core';

export type WendTextInputState = 'default' | 'success' | 'warning' | 'error';

@Component({
  tag: 'wend-text-input',
  styleUrl: '../../../../styles/src/components/wend-text-input.css',
  shadow: false,
  scoped: true
})
export class WendTextInput {
  /** The input's label text. Can be an empty string for a label-less input. */
  @Prop() label: string = '';

  /** Whether the label is rendered. */
  @Prop() showLabel = true;

  /** The input's current text value. */
  @Prop() value: string = '';

  /** Placeholder text shown when the input is empty. */
  @Prop() placeholder?: string;

  /** Supplementary message shown below the input, e.g. a validation message. Can be an empty string to render nothing. */
  @Prop() helpText: string = '';

  /** Whether the help text is rendered. */
  @Prop() showHelpText = true;

  /**
   * Validation state of the input. Drives the field's border color and the help text's tone.
   * The interactive focus ring is handled separately via CSS `:focus-within`, not this prop,
   * so a focused input keeps combining with whichever validation state is already set.
   */
  @Prop() state: WendTextInputState = 'default';

  /** Disables the input. */
  @Prop() disabled = false;

  /** Marks the input as required. Renders a marker after the label and sets the native `required`/`aria-required` attributes on the input. */
  @Prop() required = false;

  /** Name submitted for this input when part of a form. */
  @Prop() name?: string;

  /**
   * Mirrors `value` so the component can update its own render in response to user
   * interaction, not just to a new `value` prop from the consumer. Set in `componentWillLoad`,
   * not as a field initializer — the initializer runs in the constructor, before Stencil applies
   * the initial `value` attribute value onto `this.value`.
   */
  @State() currentValue!: string;

  componentWillLoad() {
    this.currentValue = this.value;
  }

  @Watch('value')
  syncValue(value: string) {
    this.currentValue = value;
  }

  /** Emitted as the user types. */
  @Event() wendChange!: EventEmitter<string>;

  private onInput = (event: Event) => {
    this.currentValue = (event.target as HTMLInputElement).value;
    this.wendChange.emit(this.currentValue);
  };

  render() {
    const { label, showLabel, currentValue, placeholder, helpText, showHelpText, state, disabled, required, name } =
      this;
    return (
      <label class={{ disabled }}>
        {showLabel && label && (
          <span class="label-text">
            {label}
            {required && (
              <span class="required-marker" aria-hidden="true">
                *
              </span>
            )}
          </span>
        )}
        <span class={{ field: true, [state]: true }}>
          <input
            type="text"
            value={currentValue}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-required={required ? 'true' : undefined}
            name={name}
            onInput={this.onInput}
          />
        </span>
        {showHelpText && helpText && <wend-help-text text={helpText} type={state}></wend-help-text>}
      </label>
    );
  }
}
