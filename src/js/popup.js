import "../sass/popup.scss";

import {mergeMap, tap} from "rxjs/operators";
import {articleManager} from "./article/articleManager";


class Popup {
    Init() {
        articleManager.GetRandomSource()
            .pipe(mergeMap(s => s.GetArticle()))
            .pipe(tap(() => this._hideNotification()))
            .pipe(tap(a => this._syncForm(a)))
            .subscribe();
    }

    _hideNotification() {
        chrome.browserAction.setBadgeText({text: ""});
    }

    _syncForm(article) {
        if (article.readTime) {
            let readTime = Math.ceil(article.readTime / 60) + " minutes";
            $('#read-time-value').text(readTime);
            $('#read-time').show();
        }
        if (article.publishDate) {
            $('#publish-date-value').text(article.publishDate);
            $('#publish-date').show();
        }
        if (article.summary) {
            $('#summary-value').text(article.summary);
            $('#summary').show();
        }
        $('#article-title').text(article.title);
        $('#path-value').text(article.sourceInfo.path.join('/'));
        $('#url').attr('href', article.url);
        $('.loading').hide();
        $('.article-info').show();
    }
}

$(document).ready(() => {
    new Popup().Init();
});
