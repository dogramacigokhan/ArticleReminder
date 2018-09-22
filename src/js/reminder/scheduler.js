import {tap} from "rxjs/operators";
import {notifier} from "./notifier";
import {OptionsData} from "../options/optionsData";

const alarmKey = 'article-alarm';

class Scheduler {
    ScheduleReminder() {
        return OptionsData.GetFromStorage()
            .pipe(tap(() => this.StartListeningAlarm()))
            .pipe(tap(o => this.CreateAlarm(o)));
    }

    StartListeningAlarm() {
        chrome.alarms.onAlarm.removeListener(this._onNotifyAlarm);
        chrome.alarms.onAlarm.addListener(alarm => this._onNotifyAlarm(alarm));
    }

    CreateAlarm(options) {
        chrome.alarms.create(alarmKey, {
            when: this._getFirstAlarmDate(options),
            periodInMinutes: this._getPeriod(options)
        });
    }

    _getFirstAlarmDate(options) {
        // TODO
        return Date.now() + 1;
    }

    _getPeriod(options) {
        // TODO
    }

    _onNotifyAlarm(alarm) {
        if (!alarm || alarm.name !== alarmKey) {
            return;
        }
        notifier.NotifyUser();
    }
}

export let scheduler = new Scheduler();
