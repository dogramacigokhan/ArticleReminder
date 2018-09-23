import {from, of} from "rxjs"
import {map, mergeMap, tap, filter} from "rxjs/operators"
import {getBookmark, getBookmarksDict} from "../../util/chromeApi";
import {OptionsData} from "../../options/optionsData";
import {articleParserUrl} from "../../util/constants";
import {Article} from "../article";

export class BookmarkSource {
    GetArticle() {
        return Article.GetFromStorage()
            .pipe(mergeMap(a => a ? of(a) : this._getRandomArticle()))
    }

    _getRandomArticle() {
        return OptionsData.GetFromStorage()
            .pipe(filter(d => d.selectedBookmarkIds))
            .pipe(map(d => this._selectRandomBookmarkId(d)))
            .pipe(mergeMap(id => getBookmark(id)))
            .pipe(mergeMap(bm => this._parseArticleFrom(bm)))
            .pipe(tap(article => article.SaveToStorage().subscribe()));
    }

    _selectRandomBookmarkId(data) {
        return data.selectedBookmarkIds[Math.floor(Math.random() * data.selectedBookmarkIds.length)];
    }

    _parseArticleFrom(bookmark) {
        console.log("Parsing bookmark with url: " + bookmark.url);
        return from($.get(articleParserUrl + encodeURIComponent(bookmark.url)))
            .pipe(map(d => new Article(d)))
            .pipe(mergeMap(a => this._setSourceInfo(a, bookmark)));
    }

    _setSourceInfo(article, bookmark) {
        return getBookmarksDict()
            .pipe(map(d => this._getBmPathRecursively(d, bookmark)))
            .pipe(map(p => {
                article.title = article.title || bookmark.title;
                article.sourceInfo = {
                    name: "Bookmarks",
                    path: p
                };
                return article;
            }));
    }

    _getBmPathRecursively(bookmarksDict, bookmark, path = []) {
        path = path.splice(0, 0, bookmark.title);
        if (bookmark.parentId) {
            return this._getBmPathRecursively(bookmarksDict, bookmarksDict[bookmark.parentId], path);
        }
        return path;
    }
}
