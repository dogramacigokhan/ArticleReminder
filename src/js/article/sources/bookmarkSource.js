import {from, of} from "rxjs"
import {map, mergeMap, filter, tap} from "rxjs/operators"
import {getBookmark, getBookmarksDict, getFromStorage, removeFromStorage} from "../../util/chromeApi";
import {OptionsData} from "../../options/optionsData";
import {articleParserUrl, bookmarkArticleStorageKey} from "../../util/constants";
import {Article, ArticleSourceInfo} from "../article";
import {mockArticle} from "../../test/mockArticle";

export class BookmarkSource {
    GetArticle() {
        return getFromStorage(bookmarkArticleStorageKey)
            .pipe(mergeMap(article => this._processArticleFromStorage(article)));
    }

    InvalidateCache() {
        return removeFromStorage(bookmarkArticleStorageKey);
    }

    _processArticleFromStorage(article) {
        if (article) {
            console.log("Article found in cache", article);
            return of(article);
        }

        console.log("Unable to get article from storage, getting random article.");
        return this._getRandomArticle();
    }

    _getRandomArticle() {
        if (!navigator.onLine) { // TODO: If not production env.
            console.log("Offline mode, returning a mock article for testing purposes.")
            return of(mockArticle.Get());
        }

        return this._getRandomBookmark()
            .pipe(mergeMap(bm => this._parseArticleFromBookmark(bm)))
            .pipe(tap(article => article.SaveToStorageSync()));
    }

    _getRandomBookmark() {
        return OptionsData.GetFromStorage()
            .pipe(filter(d => d.selectedBookmarkIds))
            .pipe(map(d => this._selectRandomBookmarkId(d)))
            .pipe(mergeMap(id => getBookmark(id)));
    }

    _selectRandomBookmarkId(data) {
        return data.selectedBookmarkIds[Math.floor(Math.random() * data.selectedBookmarkIds.length)];
    }

    _parseArticleFromBookmark(bookmark) {
        let url = articleParserUrl + encodeURIComponent(bookmark.url);
        console.log("Parsing bookmark: " + url);

        return from($.get(url))
            .pipe(map(d => new Article(d)))
            .pipe(mergeMap(a => this._setSourceInfo(a, bookmark)));
    }

    _setSourceInfo(article, bookmark) {
        return getBookmarksDict()
            .pipe(map(d => this._getBmPathRecursively(d, bookmark)))
            .pipe(map(path => {
                article.title = article.title || bookmark.title;
                article.sourceInfo = new ArticleSourceInfo("Bookmarks", path);
                return article;
            }));
    }

    _getBmPathRecursively(bookmarksDict, bookmark, path = []) {
        path.splice(0, 0, bookmark.title);
        if (+bookmark.parentId) {
            return this._getBmPathRecursively(bookmarksDict, bookmarksDict[bookmark.parentId], path);
        }
        return path;
    }
}

export let bookmarkSource = new BookmarkSource();
