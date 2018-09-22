import {map, tap} from "rxjs/operators"
import {OptionsData} from "../options/optionsData";
import {BookmarkSource} from "./sources/bookmarkSource";

export const DefaultArticleSources = [
    new BookmarkSource()
];

class ArticleManager {
    constructor() {
        this.sources = DefaultArticleSources;
    }

    GetRandomSource() {
        return OptionsData.GetFromStorage()
            .pipe(map(o => this._selectRandomSourceId(o)))
            .pipe(map(id => this.GetSource(id)));
    }

    GetSource(id) {
        return this.sources[id];
    }

    _selectRandomSourceId(options) {
        let randomIndex = options.articleSources[Math.floor(Math.random() * options.articleSources.length)];
        return options.articleSources[randomIndex];
    }
}

export let articleManager = new ArticleManager();