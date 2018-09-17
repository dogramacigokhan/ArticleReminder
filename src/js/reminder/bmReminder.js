import {of, from} from "rxjs"
import {map, mergeMap, tap, filter} from "rxjs/operators"
import "reading-time"
import {clearNotification, createNotification, getBookmark, getFromStorage} from "../util/chromeApi";
import {OptionsKey} from "../options/optionsData"

const remindId = 'bm-remind-id';
const articleParserUrl = 'https://article-reminder-parser.herokuapp.com/api/parse?url=';

class ParsedArticle {
    constructor(data) {
        data = data || {};
        this.authors = data['authors'] || [];
        this.keywords = data['keywords'] || [];
        this.publishDate = data['publish_date'] || "";
        this.readTime = +data['read_time'] || 0;
        this.summary = data['summary'] || "";
        this.title = data['title'] || "";
    }
}

class BmReminder {
    Remind() {
        this.GetRandomBookmark()
            .pipe(filter(bookmark => bookmark))
            .pipe(mergeMap(b => this.ParseBookmark(b)))
            .pipe(mergeMap(b => this.ConstructBmData(b)))
            .pipe(mergeMap(b => this.CreateNotification(b)))
            .subscribe();
    }

    GetRandomBookmark() {
        return getFromStorage(OptionsKey)
            .pipe(map(BmReminder.SelectRandomBookmarkId))
            .pipe(mergeMap(id => getBookmark(id)))
    }

    ParseBookmark(bookmark) {
        console.log("Parsing bookmark with url: " + bookmark.url);
        return from(
            $.get(articleParserUrl + encodeURIComponent(bookmark.url))
        );
    }

    ConstructBmData(data) {
        return of(new ParsedArticle(data));
    }

    CreateNotification(article) {
        chrome.browserAction.setBadgeText({text: "1"});
        let notificationData = {
            type: 'basic',
            iconUrl: 'icon-128.png',
            title: 'Bookmark Reminder',
            message: "Average read time: " + Math.ceil(article.readTime / 60) + " mins",
            contextMessage: article.title,
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