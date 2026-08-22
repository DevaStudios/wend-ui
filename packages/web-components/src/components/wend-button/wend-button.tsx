import { Component, Prop, h } from '@stencil/core';

export type WendButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'destructive-primary'
  | 'destructive-secondary'
  | 'destructive-tertiary';

@Component({
  tag: 'wend-button',
  styleUrl: '../../../../styles/src/components/wend-button.css',
  shadow: false,
  scoped: true
})
export class WendButton {
  /** Visual style of the button. */
  @Prop() variant: WendButtonVariant = 'primary';

  /** Disables the button. */
  @Prop() disabled = false;

  /**
   * The content of the button. This is required, but can be an empty string for an icon-only button as it will be skipped for icon-only buttons.
   * @default ''
   */
  @Prop() label: string = '';

  /** Name of a wend-ui icon to render on the left of the button label. */
  @Prop() iconLeft?: string;

  /** Name of a wend-ui icon to render on the right of the button label. */
  @Prop() iconRight?: string;

  render() {
    const {
      label,
      variant,
      disabled,
      iconLeft,
      iconRight
    } = this;
    return (
      <button class={{ [variant]: true }} disabled={disabled}>
        {iconLeft && <wend-icon name={iconLeft} />}
        <span>{label}</span>
        {iconRight && <wend-icon name={iconRight} />}
      </button>
    );
  }
}
