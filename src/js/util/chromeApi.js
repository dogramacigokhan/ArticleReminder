import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'

// Todo: fromCallback
function processChromeResult(observer, result) {
    if (chrome.runtime.lastError) {
        console.error("Chrome error", chrome.runtime.lastError);
        observer.error(chrome.runtime.lastError);
    }
    else {
        observer.next(result);
    }
    observer.complete();
}

// Storage
export function setStorage(data) {
    return Observable.create(observer => {
        chrome.storage.sync.set(data, () => processChromeResult(observer));
    });
}

export function getFromStorage(key) {
    return Observable.create(observer => {
        chrome.storage.sync.get([key], data => processChromeResult(observer, data[key]));
    });
}

export function removeFromStorage(key) {
    return Observable.create(observer => {
        chrome.storage.sync.remove([key], () => processChromeResult(observer));
    })
}

export function clearStorage() {
    return Observable.create(observer => {
        chrome.storage.sync.clear(() => processChromeResult(observer));
    });
}

// Bookmarks
export function getBookmarksTree() {
    return Observable.create(observer => {
        chrome.bookmarks.getTree(tree => processChromeResult(observer, tree));
    });
}

export function getBookmarksDict() {
    return getBookmarksTree()
        .pipe(map(trees => _convertToDict(trees)));
}

export function getBookmark(id) {
    return Observable.create(observer => {
        chrome.bookmarks.get('' + id, bookmark => processChromeResult(observer, bookmark ? bookmark[0] : bookmark));
    });
}

export function searchBookmark(query) {
    return Observable.create(observer => {
        chrome.bookmarks.search(query, result => processChromeResult(observer, result));
    });
}

function _convertToDict(bmTrees) {
    let dict = {};
    bmTrees.forEach(tree => _addToDictRecursively(dict, tree));
    return dict;
}

function _addToDictRecursively(dict, bookmark) {
    if (bookmark.children) {
        bookmark.children.forEach(c => _addToDictRecursively(dict, c));
    }
    dict[bookmark.id] = _bmTreeNodeToDictEl(bookmark);
}

function _bmTreeNodeToDictEl(bookmark) {
    return {
        id: bookmark.id,
        parentId: bookmark.parentId,
        url: bookmark.url,
        title: bookmark.title,
        dateAdded: bookmark.dateAdded
    }
}

// Alarms
export function clearAlarm(name) {
    return Observable.create(observer => {
        chrome.alarms.clear(name, wasCleared => processChromeResult(observer, wasCleared));
    });
}

// Notifications
export function clearNotification(id) {
    return Observable.create(observer => {
        chrome.notifications.clear(id, wasCleared => processChromeResult(observer, wasCleared));
    });
}

export function createNotification(id, data) {
    return Observable.create(observer => {
        chrome.notifications.create(id, data, id => processChromeResult(observer, id));
    });
}

