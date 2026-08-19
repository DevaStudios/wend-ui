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

  /** Name of a wend-ui icon to render on the left of the button label. */
  @Prop() iconLeft?: string;

  /** Name of a wend-ui icon to render on the right of the button label. */
  @Prop() iconRight?: string;

  render() {
    return (
      <button class={{ [this.variant]: true }} disabled={this.disabled}>
        {this.iconLeft && <wend-icon name={this.iconLeft} />}
        <slot />
        {this.iconRight && <wend-icon name={this.iconRight} />}
      </button>
    );
  }
}
