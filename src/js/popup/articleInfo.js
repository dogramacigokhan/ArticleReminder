import {catchError, mergeMap, tap} from "rxjs/operators";
import {truncateWords} from "../util/stringUtil";
import {articleManager} from "../article/articleManager";

class ArticleInfo {
    ShowArticle(useStorage) {
        this._initPage();
        return articleManager.GetRandomSource()
            .pipe(tap(() => this._toggleLoading(true)))
            .pipe(mergeMap(s => s.GetArticle(useStorage)))
            .pipe(tap(console.log))
            .pipe(tap(() => this._hideError()))
            .pipe(tap(a => this._showArticle(a)))
            .pipe(catchError(err => this._onError(err)));
    }

    _initPage() {
        this.articleInfoEl = $('.article-info');
        this.loadingEl = $('.loading');
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

    _toggleLoading(state) {
        this.loadingEl.toggle(state);
        this.articleInfoEl.toggle(!state);
    }

    _showArticle(article) {
        if (article.topImage) {
            this.articleImageEl.attr('src', article.topImage);
        }

        this.titleEl.text(article.title);
        this.readNowButton.attr('href', article.url);

        // Read time
        if (article.readTime) {
            let readTime = Math.ceil(article.readTime / 60) + " minutes";
            this.readTimeValEl.text(readTime);
        }
        this.readTimeEl.toggle(0, !!article.readTime);

        // Publish date
        if (article.publishDate) {
            this.publishDateValEl.text(article.publishDate);
        }
        this.publishDateEl.toggle(0, !!article.publishDate);

        // Summary
        if (article.summary) {
            article.summary = truncateWords(article.summary, 40);
            this.summaryValEl.text(article.summary);
        }
        this.summaryEl.show();

        this._updateBreadcrumb(article.sourceInfo);
        this._toggleLoading(false);
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

    _hideError() {
        $('.article-error').hide();
    }

    _onError(err) {
        console.error(err);
        $('.loading').hide();
        $('.article-error').show();
    }
}

export let articleInfo = new ArticleInfo();
