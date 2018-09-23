import {of} from "rxjs"
import {map, mergeMap, tap} from "rxjs/operators";
import {getBookmarksTree, getFromStorage, setStorage} from "../util/chromeApi";
import {DefaultArticleSources} from "../article/articleManager";
import {optionsStorageKey} from "../util/constants";

export class OptionsData {

    constructor(data) {
        data = data || {};
        this.articleSources = data['articleSources'] || [];
        this.selectedBookmarkIds = data['selectedBookmarkIds'] || [];
        this.remindDays = +(data['remindDays']) || 0;
        this.remindFrequency = data['remindFrequency'] || 0;
    }

    SaveToStorage() {
        return setStorage({[optionsStorageKey]: this});
    }

    static GetFromStorage() {
        return getFromStorage(optionsStorageKey)
            .pipe(map(d => d[optionsStorageKey]))
            .pipe(mergeMap(d => d ? of(new OptionsData(d)) : OptionsData._getDefault()));
    }

    static _getDefault() {
        return getBookmarksTree()
            .pipe(map(t => OptionsData._processBmTree(t)))
            .pipe(map(ids => OptionsData._createDefaultData(ids)))
            .pipe(tap(d => d.SaveToStorage().subscribe()));
    }

    static _processBmTree(bookmarkTrees) {
        let ids = [];
        bookmarkTrees.forEach(tree => OptionsData._fillIds(ids, tree));
        return ids;
    }

    static _createDefaultData(bookmarkIds) {
        return new OptionsData({
            articleSources: Array.from(Array(DefaultArticleSources.length).keys()),
            selectedBookmarkIds: bookmarkIds,
            remindDays: 0,
            remindFrequency: 0
        });
    }

    static _fillIds(ids, bookmark) {
        if (bookmark.children) {
            bookmark.children.forEach(c => OptionsData._fillIds(ids, c));
        }
        else {
            ids.push(+bookmark.id);
        }
    }
}
