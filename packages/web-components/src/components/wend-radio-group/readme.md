# wend-radio-group



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute  | Description                                                                          | Type                  | Default     |
| ------------------- | ---------- | ------------------------------------------------------------------------------------ | --------------------- | ----------- |
| `disabled`          | `disabled` | Disables every radio in the group.                                                   | `boolean`             | `false`     |
| `label`             | `label`    | The group's label text. Can be an empty string for a label-less group.               | `string`              | `''`        |
| `name` _(required)_ | `name`     | Name applied to every wend-radio child, so they act as one mutually-exclusive group. | `string`              | `undefined` |
| `value`             | `value`    | Value of the currently selected radio in the group.                                  | `string \| undefined` | `undefined` |


## Events

| Event        | Description                              | Type                  |
| ------------ | ---------------------------------------- | --------------------- |
| `wendChange` | Emitted when the selected value changes. | `CustomEvent<string>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
