import "bootstrap/dist/css/bootstrap.css"
import "../sass/breadcrumb.scss";
import "../sass/spinner.scss";
import "../sass/popup.scss";

import "bootstrap"
import {fromEvent} from "rxjs"
import {catchError, mergeMap, tap} from "rxjs/operators";
import {articleManager} from "./article/articleManager";
import {truncateWords} from "./util/stringUtil";

class Popup {
    Init() {
        this._getArticle(true)
            .subscribe(() => this._listenButtons());
    }

    _getArticle(useStorage) {
        this._showLoading();
        return articleManager.GetRandomSource()
            .pipe(mergeMap(s => s.GetArticle(useStorage)))
            .pipe(tap(() => this._hideNotification()))
            .pipe(tap(a => this._showArticle(a)))
            .pipe(catchError(err => this._onError(err)));
    }

    _hideNotification() {
        chrome.browserAction.setBadgeText({text: ""});
    }

    _showArticle(article) {
        if (article.topImage) {
            $('.article-image img').attr('src', article.topImage);
        }
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
            article.summary = truncateWords(article.summary, 40);
            $('#summary-value').text(article.summary);
            $('#summary').show();
        }
        $('#article-title').text(article.title);
        $('.read-now').attr('href', article.url);

        $('.custom-breadcrumb').empty();
        article.sourceInfo.path.slice(0, -1).forEach(p => {
            $('.custom-breadcrumb').append($('<a href="#"></a>').text(p))
        });

        $('.loading').hide();
        $('.article-error').hide();
        $('.article-info').show();
    }

    _showLoading() {
        $('.article-info').hide();
        $('.article-error').hide();
        $('.loading').show();
    }

    _onError(err) {
        console.error(err);
        $('.loading').hide();
        $('.article-error').show();
    }

    _listenButtons() {
        fromEvent($('.recommend-another'), 'click')
            .pipe(mergeMap(() => this._getArticle(false)))
            .subscribe();
    }
}

$(document).ready(() => {
    new Popup().Init();
});
