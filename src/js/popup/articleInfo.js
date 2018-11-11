import {truncateWords} from "../util/stringUtil";

class ArticleInfo {
    ShowArticle(article) {
        this._setPageElements();

        if (article.topImage)
            this.articleImageEl.attr('src', article.topImage);

        this.titleEl.text(article.title);
        this.readNowButton.attr('href', article.url);

        // Read time
        if (article.readTime) {
            let readTime = Math.ceil(article.readTime / 60) + " minutes";
            this.readTimeValEl.text(readTime);
        }
        this.readTimeEl.toggle(0, !!article.readTime);

        // Publish date
        if (article.publishDate)
            this.publishDateValEl.text(article.publishDate);
        this.publishDateEl.toggle(0, !!article.publishDate);

        // Summary
        if (article.summary) {
            article.summary = truncateWords(article.summary, 40);
            this.summaryValEl.text(article.summary);
        }
        this.summaryEl.show();

        this._updateBreadcrumb(article.sourceInfo);
    }

    _updateBreadcrumb(sourceInfo) {
        if (!sourceInfo || !sourceInfo.path) {
            this.breadcrumbEl.hide();
        }
        else {
            this.breadcrumbEl.empty();
            sourceInfo.path.slice(0, -1).forEach(p => {
                this.breadcrumbEl.append($('<a href="#"></a>').text(p))
            });
            this.breadcrumbEl.show()
        }
    }

    _setPageElements() {
        this.articleImageEl = $('.article-image img');
        this.readTimeEl = $('.read-time');
        this.readTimeValEl = $('.read-time-value');
        this.publishDateEl = $('.publish-date');
        this.publishDateValEl = $('.publish-date-value');
        this.summaryEl = $('.summary');
        this.summaryValEl = $('.summary-value');
        this.titleEl = $('.article-title');
        this.readNowButton = $('.read-now');
        this.breadcrumbEl = $('.custom-breadcrumb');
    }
}

export let articleInfo = new ArticleInfo();
