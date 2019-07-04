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
