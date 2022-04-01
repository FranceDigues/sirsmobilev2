import { Component, EventEmitter, Output, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Base64ToGallery, Base64ToGalleryOptions } from '@ionic-native/base64-to-gallery/ngx';
import { Platform, ToastController } from '@ionic/angular';
import { File, Entry } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';

@Component({
  selector: 'edit-note',
  templateUrl: './edit-note.component.html',
  styleUrls: ['./edit-note.component.scss'],
})
export class EditNoteComponent implements AfterViewInit {

  @Output() readonly slidePathChange = new EventEmitter<string>();
  @Output() readonly successData = new EventEmitter();
  @ViewChild('imageCanvas', { static: false }) canvas: ElementRef;

  canvasElement: any;
  saveX: any;
  saveY: any;

  selectedColor: string = '#9e2956';
  lineWidth: number = 5;
  colors: Array<string>;
  drawing: boolean = false;

  constructor(private platform: Platform, private base64ToGallery: Base64ToGallery,
              private toastCtrl: ToastController, private file: File,
              //private androidPermissions: AndroidPermissions,  #TODO: can be use to ask permission access before saving file in the gallery
              private webview: WebView) {
                this.colors = [
                  '#9e2956',
                  '#c2281d',
                  '#de722f', '#edbf4c', '#5db37e', '#459cde', '#4250ad', '#802fa3' ];
              }

  ngAfterViewInit(): void {
    this.canvasElement = this.canvas.nativeElement;

    this.canvasElement.width = this.platform.width() + '';
    this.canvasElement.height = 400;
  }

  goBack() {
    this.slidePathChange.emit('form');
  }

  validate() {
    this.exportCanvasImage().then(
      res => {
        this.successData.emit(res);
        this.goBack();
      },
      err => {
        console.error(err);
        this.goBack();
      }
    );
  }

  private radioGroupChange(event) {
    this.selectedColor = event.detail.value;
  }

  startDrawing(ev) {
    this.drawing = true;
    let pageX: number;
    let pageY: number;
    let canvasPosition = this.canvasElement.getBoundingClientRect();
    let ctx = this.canvasElement.getContext('2d');
    ctx.lineWidth = 5;

    if (ev.touches) {
      pageX = ev.touches[0].pageX;
      pageY = ev.touches[0].pageY;
    } else {
      pageX = ev.pageX;
      pageY = ev.pageY;
    }
    this.saveX = pageX - canvasPosition.x;
    this.saveY = pageY - canvasPosition.y;
  }

  endDrawing() {
    this.drawing = false;
  }

  clearCanvas() {
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }

  moved(ev) {
    if (!this.drawing) return;

    let pageX: number;
    let pageY: number;
    let canvasPosition = this.canvasElement.getBoundingClientRect();
    let ctx = this.canvasElement.getContext('2d');

    if (ev.touches) {
      pageX = ev.touches[0].pageX;
      pageY = ev.touches[0].pageY;
    } else {
      pageX = ev.pageX;
      pageY = ev.pageY;
    }
    let currentX = pageX - canvasPosition.x;
    let currentY = pageY - canvasPosition.y;

    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.selectedColor;

    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();

    ctx.stroke();

    this.saveX = currentX;
    this.saveY = currentY;
  }

  //TODO: bug when saving note and access to gallery is disable
//   checkPermissions() {
//     this.androidPermissions
//     .checkPermission(this.androidPermissions
//     .PERMISSION.WRITE_EXTERNAL_STORAGE)
//     .then((result) => {
//      console.log('Has permission?',result.hasPermission);
//      this.hasWriteAccess = result.hasPermission;
//    },(err) => {
//        this.androidPermissions
//          .requestPermission(this.androidPermissions
//          .PERMISSION.WRITE_EXTERNAL_STORAGE);
//     });
//     if (!this.hasWriteAccess) {
//       this.androidPermissions
//         .requestPermissions([this.androidPermissions
//         .PERMISSION.WRITE_EXTERNAL_STORAGE]);
//     }
//  }

  exportCanvasImage(): Promise<any> {
    return new Promise((resolve, rejects) => {
      let dataUrl = this.canvasElement.toDataURL();

      // Clear the current canvas
      let ctx = this.canvasElement.getContext('2d');
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);


      const options: Base64ToGalleryOptions = { prefix: 'canvas_', mediaScanner:  true };

      this.base64ToGallery.base64ToGallery(dataUrl, options).then(
        async res => {
          const toast = await this.toastCtrl.create({
            message: 'Image saved to camera roll.',
            duration: 2000
          });
          toast.present();
          const url = "file://" + res;
          this.file.resolveLocalFilesystemUrl(url)
          .then(
            (file: Entry) => {
              resolve(file);
            }
          );
        },
        err =>  {
          console.error('Error saving image to gallery ', err);
          rejects(err);
        }
      );
    });
  }
}
