import {setStorage} from "../util/chromeApi";
import {bookmarkArticleStorageKey} from "../util/constants";

export class Article {
    constructor(article) {
        article = article || {};
        this.authors = article['authors'] || [];
        this.keywords = article['keywords'] || [];
        this.publishDate = article['publish_date'] || "";
        this.readTime = +article['read_time'] || 0;
        this.sourceInfo = article['sourceInfo'] || new ArticleSourceInfo();
        this.summary = article['summary'] || "";
        this.title = article['title'] || "";
        this.topImage = article['top_image'] || "";
        this.url = article['url'] || "";
    }

    SaveToStorage() {
        return setStorage({[bookmarkArticleStorageKey]: this});
    }

    SaveToStorageSync() {
        this.SaveToStorage().subscribe();
    }
}

export class ArticleSourceInfo {
    constructor(name, path) {
        this.name = name || "";
        this.path = path || [];
    }
}
