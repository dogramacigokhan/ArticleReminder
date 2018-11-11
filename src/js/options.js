import "bootstrap/dist/css/bootstrap.css"
import "../sass/tree-multiselect.scss"
import "../sass/options.scss";

import "jquery"
import "bootstrap"
import "tree-multiselect"
import {fromEvent} from 'rxjs'
import {mergeMap, tap} from "rxjs/operators";
import {scheduler} from "./reminder/scheduler"
import {OptionsData} from "./options/optionsData"
import {getBookmarksTree, clearStorage} from "./util/chromeApi";

class Options {
    Init() {
        OptionsData.GetFromStorage()
            .subscribe(data => this._onOptionsUpdated(data));

        this._listenButtons();
    }

    _onOptionsUpdated(optionsData) {
        this.data = optionsData;
        this._updateForm();

        getBookmarksTree()
            .pipe(mergeMap(bookmarks => this._createBookmarkTree(bookmarks)))
            .subscribe();
    }

    _createBookmarkTree(bookmarkTree) {
        let rootBookmark = bookmarkTree[0];
        rootBookmark.title = 'Bookmarks';

        let tree = $("#bookmarks");
        rootBookmark.children.forEach(bookmark => {
            this._addBookmarksRecursively(tree, bookmark, "Bookmarks")
        });

        this._showBookmarkTree(tree);
    }

    _addBookmarksRecursively(tree, bookmark, section = "") {
        if (bookmark.children) {
            section += "/" + bookmark.title;
            bookmark.children.forEach(child => this._addBookmarksRecursively(tree, child, section));
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

    _showBookmarkTree(tree) {
        tree.treeMultiselect({
            hideSidePanel: true,
            startCollapsed: true,
            onChange: (all) => this._onBmTreeChanged(all)
        });
    }

    _onBmTreeChanged(allSelectedItems) {
        this.data.selectedBookmarkIds = allSelectedItems.map(i => +i.value);
    }

    _listenButtons() {
        fromEvent($('#btn-save'), 'click')
            .pipe(tap(() => this._updateData()))
            .pipe(mergeMap(() => this.data.SaveToStorage()))
            .pipe(mergeMap(() => scheduler.ScheduleReminder()))
            .subscribe(() => this._showInfoText(true, 'Saved changes.'),
                err => this._showInfoText(false, 'Unable to save changes!', err));

        fromEvent($('#btn-reset'), 'click')
            .pipe(mergeMap(() => clearStorage()))
            .subscribe(() => window.location.reload(true),
                err => this._showInfoText(false, 'Unable to reset settings!', err));
    }

    _updateForm() {
        $('#remind-days').val(this.data.remindDays);
        $('#remind-frequency').val(this.data.remindFrequency);
    }

    _updateData() {
        this.data.remindDays = $('#remind-days').val();
        this.data.remindFrequency = $('#remind-frequency').val();
    }

    _showInfoText(success, message, log) {
        let id = success ? 'success-alert' : 'failed-alert';
        $(`#${id}`).text(message).stop(true).fadeIn('fast').delay(3000).fadeOut();
        console.log(log || message);
    }
}

$(document).ready(() => {
    new Options().Init();
});

