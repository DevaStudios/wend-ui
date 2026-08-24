import { Component, Prop, Watch, Element, Event, EventEmitter, Listen, h } from '@stencil/core';

type RadioLike = HTMLElement & {
  name?: string;
  selected?: boolean;
  disabled?: boolean;
  value?: string;
};

@Component({
  tag: 'wend-radio-group',
  styleUrl: '../../../../styles/src/components/wend-radio-group.css',
  shadow: false,
  scoped: true
})
export class WendRadioGroup {
  @Element() el!: HTMLElement;

  /** The group's label text. Can be an empty string for a label-less group. */
  @Prop() label: string = '';

  /** Name applied to every wend-radio child, so they act as one mutually-exclusive group. */
  @Prop() name!: string;

  /** Value of the currently selected radio in the group. */
  @Prop() value?: string;

  /** Disables every radio in the group. */
  @Prop() disabled = false;

  /** Emitted when the selected value changes. */
  @Event() wendChange!: EventEmitter<string>;

  componentDidLoad() {
    this.syncChildren();
  }

  @Watch('value')
  @Watch('name')
  @Watch('disabled')
  onGroupPropsChange() {
    this.syncChildren();
  }

  @Listen('wendChange')
  onChildChange(event: CustomEvent<boolean>) {
    if (event.target === this.el) {
      return;
    }
    const radio = event.target as RadioLike;
    if (event.detail && radio.value !== undefined && radio.value !== this.value) {
      this.value = radio.value;
      this.wendChange.emit(this.value);
    }
  }

  private syncChildren() {
    const radios = Array.from(this.el.querySelectorAll('wend-radio')) as RadioLike[];
    for (const radio of radios) {
      radio.name = this.name;
      radio.selected = radio.value !== undefined && radio.value === this.value;
      if (this.disabled) {
        radio.disabled = true;
      }
    }
  }

  render() {
    const { label, disabled } = this;
    return (
      <fieldset disabled={disabled}>
        {label && <legend>{label}</legend>}
        <slot></slot>
      </fieldset>
    );
  }
}
