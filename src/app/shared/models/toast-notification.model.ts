export class ToastNotification {
    message;
    duration;
    position;

    constructor(message="Warning", duration=2000, position="top") {
        this.message = message;
        this.duration = duration;
        this.position = position;
    }
}
