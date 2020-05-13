"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCode = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs-extra"));
const path_1 = require("path");
const fs_jetpack_1 = require("fs-jetpack");
const chokidar_1 = require("chokidar");
const prettier = tslib_1.__importStar(require("prettier"));
const mongoose = tslib_1.__importStar(require("mongoose"));
async function connectDB(app) {
    const { url, options } = app.config.typegoose;
    const connection = await mongoose.connect(url, options);
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
    if (!fs.existsSync(modelDir))
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
    if (!fs.existsSync(modelDir))
        return;
    fs.ensureDirSync(typingsDir);
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
    fs.writeFileSync(path, formatCode(text), { encoding: 'utf8' });
}
function formatCode(text) {
    return prettier.format(text, {
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
            watchModel(app);
            await loadModel(app);
        }
        catch (error) {
            app.logger.info(JSON.stringify(error));
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFDQSxxREFBOEI7QUFDOUIsK0JBQWdDO0FBQ2hDLDJDQUFpQztBQUNqQyx1Q0FBZ0M7QUFDaEMsMkRBQW9DO0FBQ3BDLDJEQUFvQztBQUVwQyxLQUFLLFVBQVUsU0FBUyxDQUFDLEdBQWdCO0lBQ3ZDLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUE7SUFDN0MsTUFBTSxVQUFVLEdBQUcsTUFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUN2RCxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDckMsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsR0FBVztJQUN4QyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNuRCxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsSUFBWTtJQUNoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQTtJQUM1QyxNQUFNLElBQUksR0FBRyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ3hFLE9BQU8sSUFBSSxDQUFBO0FBQ2IsQ0FBQztBQUVELEtBQUssVUFBVSxTQUFTLENBQUMsR0FBZ0I7SUFDdkMsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQTtJQUN2QixNQUFNLFFBQVEsR0FBRyxXQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUM5QyxJ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