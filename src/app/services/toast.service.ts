import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ToastNotification } from '../shared/models/toast-notification.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  store = [];
  notification = null;

  constructor(private toastController: ToastController) { }

  show(notification: ToastNotification) {
    this.toastController.create({
      message: notification.message,
      duration: notification.duration,
      position: notification.position
    })
    .then(t => {
      if (this.notification) {
        //shit the notification if message is the same of the current running or the same of one already stored
        //this way we limit doublon
        if (this.notification.message !== t.message && this.alreadyStore(t)) {
          this.store.push(t);
        }
      } else {
        this.showNext(t);
      }
    })
  }

  private alreadyStore(t0) {
    for (const t of this.store)
      if (t.message === t0.message)
        return true;
    return false;
  }

  private showNext(t) {
    this.notification = t;
    this.notification.onDidDismiss(this.dismiss);
    this.notification.present();
  }

  private dismiss() {
    if (this.store.length === 0) this.notification = null;
    else this.showNext(this.store.shift());
  }
}
