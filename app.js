"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCode = void 0;
// import * as fs from 'fs-extra'
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const fs_jetpack_1 = require("fs-jetpack");
const chokidar_1 = require("chokidar");
const prettier_1 = require("prettier");
// import * as mongoose from 'mongoose'
const mongoose_1 = require("mongoose");
async function connectDB(app) {
    const { url, options } = app.config.typegoose;
    const connection = await mongoose_1.connect(url, options);
    app.context.connection = connection;
}
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function getModelName(file) {
    const filename = file.split(path_1.sep).pop() || '';
    const name = capitalizeFirstLetter(filename.replace(/\.ts$|\.js$/g, ''));
    return name;
}
async function loadModel(app) {
    const { baseDir } = app;
    const modelDir = path_1.join(baseDir, 'app', 'model');
    if (!fs_extra_1.existsSync(modelDir))
        return;
    // TODO: handle other env
    const matching = app.config.env === 'local' ? '*.ts' : '*.js';
    const files = fs_jetpack_1.find(modelDir, { matching });
    app.context.model = {};
    try {
        for (const file of files) {
            const modelPath = path_1.join(baseDir, file);
            const Model = require(modelPath).default;
            const name = getModelName(file);
            app.context.model[name] = new Model().getModelForClass(Model);
        }
    }
    catch (e) {
        console.log(e);
    }
}
function watchModel(app) {
    const { baseDir } = app;
    const modelDir = path_1.join(baseDir, 'app', 'model');
    const typingsDir = path_1.join(baseDir, 'typings');
    if (!fs_extra_1.existsSync(modelDir))
        return;
    fs_extra_1.ensureDirSync(typingsDir);
    chokidar_1.watch(modelDir).on('all', (eventType) => {
        if (['add', 'change'].includes(eventType)) {
            createTyingFile(app);
        }
        if (['unlink'].includes(eventType)) {
            createTyingFile(app);
        }
    });
}
function createTyingFile(app) {
    const { baseDir } = app;
    const modelDir = path_1.join(baseDir, 'app', 'model');
    const files = fs_jetpack_1.find(modelDir, { matching: '*.ts' });
    const typingPath = path_1.join(baseDir, 'typings', 'typegoose.d.ts');
    const pathArr = formatPaths(files);
    const importText = pathArr
        .map(i => `import ${i.name} from '${i.importPath}'`)
        .join('\n');
    const repoText = pathArr
        .map(i => `${i.name}: ModelType<InstanceType<${i.name}>>`)
        .join('\n');
    const text = getTypingText(importText, repoText);
    writeTyping(typingPath, text);
}
function getTypingText(importText, modelText) {
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
`;
    return tpl;
}
function writeTyping(path, text) {
    fs_extra_1.writeFileSync(path, formatCode(text), { encoding: 'utf8' });
}
function formatCode(text) {
    return prettier_1.format(text, {
        semi: false,
        tabWidth: 2,
        singleQuote: true,
        parser: 'typescript',
        trailingComma: 'all',
    });
}
exports.formatCode = formatCode;
function formatPaths(files) {
    return files.map(file => {
        const name = getModelName(file);
        file = file.split(path_1.sep).join('/');
        const importPath = `../${file}`.replace(/\.ts$|\.js$/g, '');
        return {
            name,
            importPath,
        };
    });
}
exports.default = async (app) => {
    const config = app.config.typegoose;
    if (!config) {
        throw new Error('please config typegoose in config file');
    }
    app.beforeStart(async () => {
        try {
            await connectDB(app);
            if (app.config.env === 'local') {
                watchModel(app);
            }
            await loadModel(app);
        }
        catch (error) {
            app.logger.error(JSON.stringify(error));
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLGlDQUFpQztBQUNqQyx1Q0FBb0U7QUFDcEUsK0JBQWdDO0FBQ2hDLDJDQUFpQztBQUNqQyx1Q0FBZ0M7QUFDaEMsdUNBQWlDO0FBQ2pDLHVDQUF1QztBQUN2Qyx1Q0FBbUM7QUFHbkMsS0FBSyxVQUFVLFNBQVMsQ0FBQyxHQUFnQjtJQUN2QyxNQUFNLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFBO0lBQzdDLE1BQU0sVUFBVSxHQUFHLE1BQU0sa0JBQU8sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDOUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO0FBQ3JDLENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUFDLEdBQVc7SUFDeEMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbkQsQ0FBQztBQUVELFNBQVMsWUFBWSxDQUFDLElBQVk7SUFDaEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUE7SUFDNUMsTUFBTSxJQUFJLEdBQUcscUJBQXFCLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUN4RSxPQUFPLElBQUksQ0FBQTtBQUNiLENBQUM7QUFFRCxLQUFLLFVBQVUsU0FBUyxDQUFDLEdBQWdCO0lBQ3ZDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUE7SUFDdkIsTUFBTSxRQUFRLEdBQUcsV0FBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxD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