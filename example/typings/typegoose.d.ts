import 'egg'
import { InstanceType, ModelType } from 'typegoose'
import * as mongoose from 'mongoose'

import User from '../app/model/User'

declare module 'egg' {
  interface Context {
    connection: mongoose.Collection
    model: {
      User: ModelType<InstanceType<User>>
    }
  }
}
