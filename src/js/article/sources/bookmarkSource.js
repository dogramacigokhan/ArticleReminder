import {from, of} from "rxjs"
import {map, mergeMap, tap, filter} from "rxjs/operators"
import {getBookmark} from "../../util/chromeApi";
import {OptionsData} from "../../options/optionsData";
import {Article} from "../article";
import {articleParserUrl, ArticleSource} from "./articleSource";

export class BookmarkSource extends ArticleSource {
    GetArticle() {
        return Article.GetFromStorage()
            .pipe(mergeMap(a => a ? of(a) : this._getRandomArticle()));
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
            .pipe(map(a => this._constructArticle(a)));
    }

    _constructArticle(articleData, bookmark) {
        let article = new Article(articleData);
        article.title = article.title || bookmark.title;
        return article;
    }
}
