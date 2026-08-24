# wend-radio



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                                                   | Type                  | Default     |
| ---------- | ---------- | --------------------------------------------------------------------------------------------- | --------------------- | ----------- |
| `disabled` | `disabled` | Disables the radio button.                                                                    | `boolean`             | `false`     |
| `label`    | `label`    | The radio button's label text. Can be an empty string for a label-less radio button.          | `string`              | `''`        |
| `name`     | `name`     | Name of the radio group this button belongs to. Radios sharing a name are mutually exclusive. | `string \| undefined` | `undefined` |
| `selected` | `selected` | Whether the radio button is selected.                                                         | `boolean`             | `false`     |
| `value`    | `value`    | Value submitted for this radio button when part of a form.                                    | `string \| undefined` | `undefined` |


## Events

| Event        | Description                                            | Type                   |
| ------------ | ------------------------------------------------------ | ---------------------- |
| `wendChange` | Emitted when the radio button is selected by the user. | `CustomEvent<boolean>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
