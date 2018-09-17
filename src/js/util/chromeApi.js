import {Observable} from 'rxjs/Observable'

function processChromeResult(observer, result) {
    if (chrome.runtime.lastError) {
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
        chrome.storage.sync.get([key], data => processChromeResult(observer, data));
    });
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

export function getBookmark(id) {
    return Observable.create(observer => {
        chrome.bookmarks.get('' + id, bookmark => processChromeResult(observer, bookmark ? bookmark[0] : bookmark));
    });
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

