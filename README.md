# egg-typegoose

<!--
Description here.
-->

## Install

```bash
$ npm i github:qianjiang/egg-typegoose --save
```

## Usage

### Plugin

```ts
// {app_root}/config/plugin.ts
const plugin: EggPlugin = {
  typegoose: {
    enable: true,
    package: 'egg-typegoose',
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

## Controller

```ts
import { Controller } from 'egg'

export default class UserController extends Controller {
  public async index() {
    const { ctx } = this
    const result = await ctx.model.User.findOne()
    if (result) {
      ctx.body = result.avatar
    }

  }
}

```

## Questions & Suggestions

Please open an issue [here](https://github.com/forsigner/egg-typegoose/issues).

## License

[MIT](LICENSE)
