"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPostField = exports.setPostFields = exports.getPostField = exports.getPostFields = exports.getPostsData = exports.getPostData = exports.getPostsFields = void 0;
const db = __importStar(require("../database"));
const plugins = __importStar(require("../plugins"));
const utils = __importStar(require("../utils"));
const intFields = [
    'uid', 'pid', 'tid', 'deleted', 'timestamp',
    'upvotes', 'downvotes', 'deleterUid', 'edited',
    'replies', 'bookmarks',
];
function modifyPost(post, fields) {
    if (post) {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        db.parseIntFields(post, intFields, fields);
        if (post.hasOwnProperty('upvotes') && post.hasOwnProperty('downvotes')) {
            post.votes = post.upvotes - post.downvotes;
        }
        if (post.hasOwnProperty('timestamp')) {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            post.timestampISO = utils.toISOString(post.timestamp);
        }
        if (post.hasOwnProperty('edited')) {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            post.editedISO = post.edited !== 0 ? utils.toISOString(post.edited) : '';
        }
    }
}
function getPostsFields(pids, fields) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!Array.isArray(pids) || !pids.length) {
            return [];
        }
        const keys = pids.map(pid => `post:${pid}`);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const postData = yield db.getObjects(keys, fields);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const result = yield plugins.hooks.fire('filter:post.getFields', {
            pids: pids,
            posts: postData,
            fields: fields,
        });
        result.posts.forEach(post => modifyPost(post, fields));
        return result.posts;
    });
}
exports.getPostsFields = getPostsFields;
function getPostData(pid) {
    return __awaiter(this, void 0, void 0, function* () {
        const posts = yield getPostsFields([pid], []);
        return posts && posts.length ? posts[0] : null;
    });
}
exports.getPostData = getPostData;
function getPostsData(pids) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield getPostsFields(pids, []);
    });
}
exports.getPostsData = getPostsData;
function getPostFields(pid, fields) {
    return __awaiter(this, void 0, void 0, function* () {
        const posts = yield getPostsFields([pid], fields);
        return posts ? posts[0] : null;
    });
}
exports.getPostFields = getPostFields;
function getPostField(pid, field) {
    return __awaiter(this, void 0, void 0, function* () {
        const post = yield getPostFields(pid, [field]);
        return post ? post[field] : null;
    });
}
exports.getPostField = getPostField;
function setPostFields(pid, data) {
    return __awaiter(this, void 0, void 0, function* () {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        yield db.setObject(`post:${pid}`, data);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        yield plugins.hooks.fire('action:post.setFields', { data: Object.assign(Object.assign({}, data), { pid }) });
    });
}
exports.setPostFields = setPostFields;
function setPostField(pid, field, value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield setPostFields(pid, { [field]: value });
    });
}
exports.setPostField = setPostField;
