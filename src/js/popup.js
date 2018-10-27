import "bootstrap/dist/css/bootstrap.css"
import "../sass/breadcrumb.scss";
import "../sass/spinner.scss";
import "../sass/popup.scss";

import "bootstrap"
import {fromEvent} from "rxjs"
import {mergeMap, tap} from "rxjs/operators";
import {articleInfo} from "./popup/articleInfo";

class Popup {
    Init() {
        articleInfo.ShowArticle(true)
            .pipe(tap(() => this._hideNotification()))
            .subscribe(() => this._listenButtons());
    }

    _hideNotification() {
        chrome.browserAction.setBadgeText({text: ""});
    }

    _listenButtons() {
        fromEvent($('.recommend-another'), 'click')
            .pipe(mergeMap(() => articleInfo.ShowArticle(false)))
            .subscribe();
    }
}

$(document).ready(() => {
    new Popup().Init();
});
