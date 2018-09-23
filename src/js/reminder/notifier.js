import {mergeMap, tap} from "rxjs/operators";
import {clearNotification, createNotification} from "../util/chromeApi";
import {articleManager} from "../article/articleManager";
import {notificationKey} from "../util/constants";

class Notifier {
    NotifyUser() {
        articleManager.GetRandomSource()
            .pipe(mergeMap(s => s.GetArticle()))
            .pipe(tap(console.log))
            .pipe(mergeMap(a => this._createNotification(a)))
            .subscribe();
    }

    _createNotification(article) {
        chrome.browserAction.setBadgeText({text: "1"});

        let readTime = article.readTime ? Math.ceil(article.readTime / 60) + " minutes" : "";
        let message = readTime ? "Read Time: " + readTime : "";

        let notificationData = {
            type: 'basic',
            iconUrl: 'icon-128.png',
            title: 'Article Reminder',
            message: message,
            contextMessage: article.title,
            buttons: [{title: "Read Now"}]
        };
        return clearNotification(notificationKey)
            .pipe(mergeMap(() => createNotification(notificationKey, notificationData)));
    }
}

export let notifier = new Notifier();