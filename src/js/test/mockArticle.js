import {Article, ArticleSourceInfo} from "../article/article";

class MockArticle {
    Get() {
        let article = new Article();
        article.authors = ["Test Author", "Another Author"];
        article.keywords = ["some", "article", "keywords", "to", "test"];
        article.publishDate = Date.now();
        article.readTime = 615;
        article.sourceInfo = this._getArticleSourceInfo();
        article.summary = "This is a long summary about the article, which is written by the developer carefully, by considering every details of the application. This text should be long enough to show.";
        article.title = "Test Article";
        article.topImage = "./icon-128.png";
        article.url = "http://www.example.com/";
        return article;
    }

    _getArticleSourceInfo() {
        return new ArticleSourceInfo("Test Source", ["Test Source", "And", "Some", "Path"]);
    }
}

export let mockArticle = new MockArticle();