import {getFromStorage, setStorage} from "../util/chromeApi";
import {map, tap} from "rxjs/operators";

const articleStorageKey = 'ar-article';

export class Article {
    constructor(article) {
        article = article || {};
        this.url = article['url'] || "";
        this.authors = article['authors'] || [];
        this.keywords = article['keywords'] || [];
        this.publishDate = article['publish_date'] || "";
        this.readTime = article['read_time'] || 0;
        this.summary = article['summary'] || "";
        this.title = article['title'];
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
