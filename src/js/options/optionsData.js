export const OptionsKey = 'br-options';

export class OptionsData {
    constructor(data) {
        data = data || {};
        this.selectedBookmarkIds = data['selectedBookmarkIds'] || [];
        this.remindDays = +(data['remindDays']) || 0;
        this.remindFrequency = data['remindFrequency'] || 0;
    }
}
