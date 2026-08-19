import { Component, Prop, h, Host } from '@stencil/core';
import svgStrings from '@wend-ui/icons/svg-strings';
import { getIconSvg } from '@wend-ui/icons/get-icon-svg';

@Component({
  tag: 'wend-icon',
  shadow: false,
  scoped: false
})
export class WendIcon {
  /** Name of the icon to render, matching a name in the wend-ui icons manifest. */
  @Prop() name!: string;

  /** Icon size, as a CSS length. */
  @Prop() size = '1em';

  /** Icon fill color, as a CSS color. */
  @Prop() color = 'currentColor';

  render() {
    const svg = getIconSvg(svgStrings, this.name, {
      size: this.size,
      color: this.color
    });

    if (!svg) {
      console.warn(`wend-icon: unknown icon name "${this.name}"`);
      return <Host></Host>;
    }

    return <Host innerHTML={svg}></Host>;
  }
}
