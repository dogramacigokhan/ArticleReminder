import "bootstrap/dist/css/bootstrap.css"
import "../sass/breadcrumb.scss";
import "../sass/spinner.scss";
import "../sass/popup.scss";

import "bootstrap"
import {fromEvent} from "rxjs"
import {mergeMap} from "rxjs/operators";
import {articleInfo} from "./popup/articleInfo";
import {articleManager} from "./article/articleManager";

class Popup {
    Init() {
        this._setPageElements();
        this._hideNotification();
        this._listenButtons();

        // Todo: Show a dummy article on start for now
        this.loadingEl.show();

        articleManager.GetSource(0)
            .GetArticle(0)
            .subscribe(article => this._onArticleReceived(article), err => this._onArticleError(err));
    }

    _hideNotification() {
        chrome.browserAction.setBadgeText({text: ""});
    }

    _listenButtons() {
        let sourceId = 0;
        let articleId = 0;

        fromEvent($('.recommend-another'), 'click')
            .subscribe(() => this._recommendArticle(sourceId, articleId));
    }

    _recommendArticle(sourceId, articleId) {
        this.articleErrorEl.hide();
        this.articleInfoEl.hide();
        this.loadingEl.show();

        let source = articleManager.GetSource(sourceId);
        source.InvalidateCache()
            .pipe(mergeMap(() => source.GetArticle(articleId)))
            .subscribe(article => this._onArticleReceived(article), err => this._onArticleError(err));
    }

    _onArticleReceived(article) {
        articleInfo.ShowArticle(article);
        this.articleErrorEl.hide();
        this.articleInfoEl.show();
        this.loadingEl.hide();
    }

    _onArticleError(err) {
        console.error(err);
        this.articleErrorEl.show();
        this.articleInfoEl.hide();
        this.loadingEl.hide();
    }

    _setPageElements() {
        this.articleInfoEl = $('.article-info');
        this.articleErrorEl = $('.article-error');
        this.loadingEl = $('.loading');
    }
}

$(document).ready(() => {
    new Popup().Init();
});
