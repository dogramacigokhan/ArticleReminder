import {of} from "rxjs"
import {map, mergeMap, tap, filter} from "rxjs/operators"
import "reading-time"
import {clearNotification, createNotification, getBookmark, getFromStorage} from "../util/chromeApi";
import {OptionsKey} from "../options/optionsData"
const extractor = require("unfluff/lib/unfluff");

const remindId = 'bm-remind-id';

class BmData {
    constructor(data) {
        data = data || {};
        this.id = data['id'] || "";
        this.title = data['title'] || "?";
        this.dateAdded = data['dateAdded'] || 0;
        this.url = data['url'] || "";
        this.readTime = +data['readTime'] || 0;
    }
}

class BmReminder {
    Remind() {
        this.GetRandomBookmark()
            .pipe(filter(bookmark => bookmark))
            .pipe(mergeMap(b => this.ConstructBmData(b)))
            .pipe(tap(b => this.GetReadTime(b)))
            .pipe(mergeMap(b => this.CreateNotification(b)))
            .subscribe();
    }

    GetRandomBookmark() {
        return getFromStorage(OptionsKey)
            .pipe(map(BmReminder.SelectRandomBookmarkId))
            .pipe(mergeMap(id => getBookmark(id)))
    }

    ConstructBmData(rawData) {
        return of(new BmData(rawData));
    }

    GetReadTime(bmData) {
        console.log(bmData.url);
        let data = extractor(bmData.url);
        console.log(data);
    }

    CreateNotification(bmData) {
        chrome.browserAction.setBadgeText({text: "1"});
        let notificationData = {
            type: 'basic',
            iconUrl: 'icon-128.png',
            title: 'Bookmark Reminder',
            message: "Average read time: " + bmData.readTime,
            contextMessage: bmData.title,
            buttons: [{title: "Read Now"}]
        };
        return clearNotification(remindId)
            .pipe(mergeMap(() => createNotification(remindId, notificationData)));
    }

    static SelectRandomBookmarkId(data) {
        let bookmarks = data[OptionsKey];
        if (!bookmarks || !bookmarks.selectedBookmarkIds) {
            return "";
        }
        return bookmarks.selectedBookmarkIds[Math.floor(Math.random() * bookmarks.selectedBookmarkIds.length)];
    }
}

export let reminder = new BmReminder();