import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ToastNotification } from '../shared/models/toast-notification.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  notifications = [];
  isRunning = false;

  constructor(private toastController: ToastController) { }

  showAll() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.shiftNotification();
  }

  shiftNotification() {
    if (this.notifications.length >= 1) {
      const n = this.notifications.shift();
      n.present();
      n.onDidDismiss()
      .then(() => {
        this.shiftNotification();
      })
    } else {
      this.isRunning = false;
    }
  }

  show(notification: ToastNotification) {
    this.toastController.create({
      message: notification.message,
      duration: notification.duration,
      position: notification.position
    })
    .then(t => {
      this.notifications.push(t);
      this.showAll();
    })
  }
}
