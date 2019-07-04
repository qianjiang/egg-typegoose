import { prop, Typegoose } from 'typegoose'
import * as shortid from 'shortid'

export class User extends Typegoose {
  @prop({ default: shortid.generate })
  slug: string

  @prop()
  email: string

  @prop()
  nickname: string

  @prop()
  username: string

  @prop()
  password: string

  @prop()
  avatar: string

  @prop({ default: Date.now })
  updatedAt: Date

  @prop({ default: Date.now })
  createdAt: Date
}

export default User;