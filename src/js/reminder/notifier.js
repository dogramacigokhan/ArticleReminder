import {mergeMap} from "rxjs/operators";
import {clearNotification, createNotification} from "../util/chromeApi";
import {articleManager} from "../article/articleManager";

const notificationId = 'ar-notification';

class Notifier {
    NotifyUser() {
        articleManager.GetRandomSource()
            .pipe(mergeMap(s => s.GetArticle()))
            .pipe(mergeMap(a => this._createNotification(a)))
            .subscribe();
    }

    _createNotification(article) {
        chrome.browserAction.setBadgeText({text: "1"});

        let readTime = article.readTime ? Math.ceil(article.readTime / 60) + " mins" : "";
        let message = readTime ? "Average read time: " + readTime : "";

        let notificationData = {
            type: 'basic',
            iconUrl: 'icon-128.png',
            title: 'Article Reminder',
            message: message,
            contextMessage: article.title,
            buttons: [{title: "Read Now"}]
        };
        return clearNotification(notificationId)
            .pipe(mergeMap(() => createNotification(notificationId, notificationData)));
    }
}

export let notifier = new Notifier();