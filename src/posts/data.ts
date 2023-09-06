
import * as db from '../database';
import * as plugins from '../plugins';
import * as utils from '../utils';
import { PostObject } from '../types';

const intFields: string[] = [
    'uid', 'pid', 'tid', 'deleted', 'timestamp',
    'upvotes', 'downvotes', 'deleterUid', 'edited',
    'replies', 'bookmarks',
];

interface myPostObject extends PostObject{
    edited: number;
    editedISO: string;
}

function modifyPost(post: myPostObject, fields: Array<number>) {
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
            post.timestampISO = utils.toISOString(post.timestamp) as string;
        }
        if (post.hasOwnProperty('edited')) {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            post.editedISO = post.edited !== 0 ? utils.toISOString(post.edited) as string : '';
        }
    }
}

export async function getPostsFields(pids: Array<number>, fields: Array<number>): Promise<PostObject[]> {
    if (!Array.isArray(pids) || !pids.length) {
        return [];
    }
    const keys = pids.map(pid => `post:${pid}`);
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const postData: object = await db.getObjects(keys, fields) as object;
    const result = await plugins.hooks.fire('filter:post.getFields', {
        pids: pids,
        posts: postData,
        fields: fields,
    });
    result.posts.forEach(post => modifyPost(post, fields));
    return result.posts as PostObject[];
}


export async function getPostData(pid: number): Promise<PostObject> {
    const posts: Array<PostObject> = await getPostsFields([pid], []);
    return posts && posts.length ? posts[0] : null;
}


export async function getPostsData(pids: number[]): Promise<PostObject[]> {
    return await getPostsFields(pids, []);
}

export async function getPostFields(pid: number, fields: number[]): Promise<PostObject> {
    const posts = await getPostsFields([pid], fields);
    return posts ? posts[0] : null;
}

export async function getPostField(pid: number, field: number): Promise<PostObject> {
    const post = await getPostFields(pid, [field]);
    return post ? post[field] : null;
}

export async function setPostFields(pid: number, data: object): Promise<void> {
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await db.setObject(`post:${pid}`, data);
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await plugins.hooks.fire('action:post.setFields', { data: { ...data, pid } });
}

export async function setPostField(pid: number, field: number, value: string): Promise<void> {
    await setPostFields(pid, { [field]: value });
}
