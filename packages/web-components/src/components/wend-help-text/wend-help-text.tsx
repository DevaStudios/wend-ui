import { Component, Prop, h } from '@stencil/core';

export type WendHelpTextType = 'default' | 'success' | 'warning' | 'error';

@Component({
  tag: 'wend-help-text',
  styleUrl: '../../../../styles/src/components/wend-help-text.css',
  shadow: false,
  scoped: true
})
export class WendHelpText {
  /** The help text's message. Can be an empty string to render nothing. */
  @Prop() text: string = '';

  /** Visual tone of the help text. */
  @Prop() type: WendHelpTextType = 'default';

  render() {
    const { text, type } = this;
    return <span class={{ 'help-text': true, [type]: true }}>{text}</span>;
  }
}
