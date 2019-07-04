# egg-typegoose

[typegoose](https://github.com/szokodiakos/typegoose) plugin for Egg.js.

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@forsigner/egg-typegoose.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@forsigner/egg-typegoose
[download-image]: https://img.shields.io/npm/dm/@forsigner/egg-typegoose.svg?style=flat-square
[download-url]: https://npmjs.org/package/@forsigner/egg-typegoose

<!--
Description here.
-->

## Install

```bash
$ yarn add @forsigner/egg-typegoose
```

## Usage

### Plugin

```ts
// {app_root}/config/plugin.ts
const plugin: EggPlugin = {
  typegoose: {
    enable: true,
    package: '@forsigner/egg-typegoose',
  },
}
```

### Configuration

```ts
// {app_root}/config/config.default.ts
config.typegoose = {
  url: 'mongodb://localhost:27017/test',
  options: {},
}
```

### Create entity files

```bash
├── controller
│   └── home.ts
├── model
    ├── Post.ts
    └── User.ts
```

### Model file

```ts
// app/model/User.ts
class User extends Typegoose {
  @prop()
  name?: string
}
export default User
```

## Example

[example](https://github.com/forsigner/egg-typegoose/tree/master/example)

## Questions & Suggestions

Please open an issue [here](https://github.com/forsigner/egg-typegoose/issues).

## License

[MIT](LICENSE)
