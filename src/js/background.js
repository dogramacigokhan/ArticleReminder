import '../img/icon-128.png'
import '../img/icon-34.png'
import {scheduler} from "./reminder/scheduler";

chrome.runtime.onInstalled.addListener(function() {
    // TODO: Register scheduler
    // scheduler.ScheduleReminder().subscribe();
    // TODO: Create default options
});

// TODO: Handle bookmark changes: add, delete, change
