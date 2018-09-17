import {reminder} from "./bmReminder";

const alarmKey = 'bm-alarm';

class Scheduler {
    ScheduleReminder(options) {
        this.StartListeningAlarm();
        this.CreateAlarm(options);
    }

    CreateAlarm(options) {
        chrome.alarms.create(alarmKey, {
            when: this.GetFirstAlarmDate(options),
            periodInMinutes: this.GetPeriod(options)
        });
    }

    GetFirstAlarmDate(options) {
        return Date.now() + 1;
    }

    GetPeriod(options) {
    }

    // TODO: Move this to background.js
    StartListeningAlarm() {
        chrome.alarms.onAlarm.removeListener(this.OnAlarm);
        chrome.alarms.onAlarm.addListener(alarm => this.OnAlarm(alarm));
    }

    OnAlarm(alarm) {
        if (!alarm || alarm.name !== alarmKey) {
            return;
        }
        reminder.Remind();
    }
}

export let scheduler = new Scheduler();
