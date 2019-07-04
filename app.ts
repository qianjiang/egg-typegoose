import { Application } from 'egg'
import * as fs from 'fs-extra'
import { join, sep } from 'path'
import { find } from 'fs-jetpack'
import { watch } from 'chokidar'
import * as prettier from 'prettier'
import * as mongoose from 'mongoose'

async function connectDB(app: Application) {
  const { url, options } = app.config.typegoose
  const connection = await mongoose.connect(url, options)
  app.context.connection = connection
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getModelName(file: string) {
  const filename = file.split(sep).pop() || ''
  const name = capitalizeFirstLetter(filename.replace(/\.ts$|\.js$/g, ''))
  return name
}

async function loadModel(app: Application) {
  const { baseDir } = app
  const modelDir = join(baseDir, 'app', 'model')
  if (!fs.existsSync(modelDir)) return

  // TODO: handle other env
  const matching = app.config.env === 'local' ? '*.ts' : '*.js'

  const files = find(modelDir, { matching })
  app.context.model = {}

  try {
    for (const file of files) {
      const modelPath = join(baseDir, file)
      const Model = require(modelPath).default
      const name = getModelName(file)
      app.context.model[name] = new Model().getModelForClass(Model)
    }
  } catch (e) {
    console.log(e)
  }
}

function watchModel(app: Application) {
  const { baseDir } = app
  const modelDir = join(baseDir, 'app', 'model')
  const typingsDir = join(baseDir, 'typings')

  if (!fs.existsSync(modelDir)) return

  fs.ensureDirSync(typingsDir)
  watch(modelDir).on('all', (eventType: string) => {
    if (['add', 'change'].includes(eventType)) {
      createTyingFile(app)
    }

    if (['unlink'].includes(eventType)) {
      createTyingFile(app)
    }
  })
}

function createTyingFile(app: Application) {
  const { baseDir } = app
  const modelDir = join(baseDir, 'app', 'model')
  const files = find(modelDir, { matching: '*.ts' })
  const typingPath = join(baseDir, 'typings', 'typegoose.d.ts')
  const pathArr = formatPaths(files)
  const importText = pathArr
    .map(i => `import ${i.name} from '${i.importPath}'`)
    .join('\n')
  const repoText = pathArr
    .map(i => `${i.name}: ModelType<InstanceType<${i.name}>>`)
    .join('\n')

  const text = getTypingText(importText, repoText)
  writeTyping(typingPath, text)
}

function getTypingText(importText: string, modelText: string) {
  const tpl = `
import 'egg'
import { InstanceType, ModelType } from 'typegoose'
import * as mongoose from 'mongoose'

${importText}

declare module 'egg' {
  interface Context {
    connection: mongoose.Collection
    model: {
      ${modelText}
    }
  }
}
`
  return tpl
}

function writeTyping(path: string, text: string) {
  fs.writeFileSync(path, formatCode(text), { encoding: 'utf8' })
}

export function formatCode(text: string) {
  return prettier.format(text, {
    semi: false,
    tabWidth: 2,
    singleQuote: true,
    parser: 'typescript',
    trailingComma: 'all',
  })
}

function formatPaths(files: string[]) {
  return files.map(file => {
    const name = getModelName(file)
    file = file.split(sep).join('/')
    const importPath = `../${file}`.replace(/\.ts$|\.js$/g, '')
    return {
      name,
      importPath,
    }
  })
}

export default async (app: Application) => {
  const config = app.config.typegoose
  if (!config) {
    throw new Error('please config typegoose in config file')
  }

  app.beforeStart(async () => {
    try {
      await connectDB(app)
      watchModel(app)
      await loadModel(app)
    } catch (error) {
      app.logger.info(JSON.stringify(error))
    }
  })
}
