import {getFromStorage, setStorage} from "../util/chromeApi";
import {map, tap} from "rxjs/operators";
import {articleStorageKey} from "../util/constants";

export class Article {
    constructor(article) {
        article = article || {};
        this.authors = article['authors'] || [];
        this.keywords = article['keywords'] || [];
        this.publishDate = article['publish_date'] || "";
        this.readTime = +article['read_time'] || 0;
        this.sourceInfo = article['sourceInfo'] || {};
        this.summary = article['summary'] || "";
        this.title = article['title'] || "";
        this.topImage = article['top_image'] || "";
        this.url = article['url'] || "";
    }

    SaveToStorage() {
        return setStorage({[articleStorageKey]: this});
    }

    static GetFromStorage() {
        return getFromStorage(articleStorageKey)
            .pipe(map(d => d[articleStorageKey]))
            .pipe(tap(a => console.log("Article in cache", a)));
    }
}
