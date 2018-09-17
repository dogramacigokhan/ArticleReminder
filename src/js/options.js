import "bootstrap/dist/css/bootstrap.css"
import "../sass/tree-multiselect.scss"
import "../sass/options.scss";

import {of, fromEvent} from 'rxjs'
import {mergeMap, tap} from "rxjs/operators";
import "jquery"
import "bootstrap"
import "tree-multiselect"
import {scheduler} from "./reminder/scheduler"
import {OptionsKey, OptionsData} from "./options/optionsData"
import {setStorage, getBookmarksTree, getFromStorage, clearStorage} from "./util/chromeApi";

class Options {
    Init() {
        getFromStorage(OptionsKey)
            .pipe(tap(data => this.SyncData(data)))
            .pipe(mergeMap(() => getBookmarksTree()))
            .pipe(mergeMap(bookmarks => this.CreateBookmarkTree(bookmarks)))
            .pipe(tap(tree => this.ShowBookmarkTree(tree)))
            .subscribe(() => this.ListenButtons());
    }

    SyncData(data) {
        this.data = new OptionsData(data[OptionsKey]);
        $('#remind-days').val(this.data.remindDays);
        $('#remind-frequency').val(this.data.remindFrequency);
    }

    CreateBookmarkTree(bookmarkTree) {
        let rootBookmark = bookmarkTree[0];
        rootBookmark.title = 'Bookmarks';

        let tree = $("#bookmarks");
        rootBookmark.children.forEach(bookmark => {
            this.AddBookmarksRecursively(tree, bookmark, "Bookmarks")
        });
        return of(tree);
    }

    AddBookmarksRecursively(tree, bookmark, section = "") {
        if (bookmark.children) {
            section += "/" + bookmark.title;
            bookmark.children.forEach(child => this.AddBookmarksRecursively(tree, child, section));
        }
        else if (bookmark.title) {
            let el = $('<option></option>');
            el.attr('value', bookmark.id);
            el.attr('data-section', section);
            el.attr('data-index', bookmark.id);
            el.text(bookmark.title);

            if (this.data.selectedBookmarkIds.includes(+bookmark.id)) {
                el.attr('selected', 'selected');
            }
            tree.append(el);
        }
    }

    ShowBookmarkTree(tree) {
        tree.treeMultiselect({
            hideSidePanel: true,
            startCollapsed: true,
            onChange: (all) => this.OnBmTreeChanged(all)
        });
    }

    OnBmTreeChanged(allSelectedItems) {
        this.data.selectedBookmarkIds = allSelectedItems.map(i => +i.value);
    }

    ListenButtons() {
        fromEvent($('#btn-save'), 'click')
            .pipe(mergeMap(() => this.UpdateData()))
            .pipe(mergeMap(data => setStorage({[OptionsKey]: data})))
            .pipe(tap(data => scheduler.ScheduleReminder(data)))
            .subscribe(() => Options.ShowInfoText(true, 'Saved changes.'),
                err => Options.ShowInfoText(false, 'Unable to save changes!', err));

        fromEvent($('#btn-reset'), 'click')
            .pipe(mergeMap(() => clearStorage()))
            .subscribe(() => window.location.reload(true),
                err => Options.ShowInfoText(false, 'Unable to reset settings!', err));
    }

    UpdateData() {
        this.data.remindDays = $('#remind-days').val();
        this.data.remindFrequency = $('#remind-frequency').val();
        return of(this.data)
    }

    static ShowInfoText(success, message, log) {
        let id = success ? 'success-alert' : 'failed-alert';
        $(`#${id}`).text(message).stop(true).fadeIn('fast').delay(3000).fadeOut();
        console.log(log || message);
    }
}

$(document).ready(() => {
    new Options().Init();
});

