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
    let dataUrl = this.canvasElement.toDataURL();

    this.saveBase64ImageToGallery(dataUrl).then(
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

  public radioGroupChange(event) {
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

  saveBase64ImageToGallery(base64Data: string): Promise<Entry> {
    return new Promise((resolve, reject) => {
      // Check if we're running on a real device
      if (this.platform.is('android')) {
              this.saveImage(base64Data).then(resolve).catch(reject);
      } else {
        console.log('This feature works only on a real device.');
        reject(new Error('This feature works only on a real device.'));
      }
    });
  }

  saveImage(base64Data: string): Promise<Entry> {
    return new Promise((resolve, reject) => {
            
      const directory = this.file.externalRootDirectory + 'Pictures/';
            
      const blob = this.base64ToBlob(base64Data, 'image/jpeg');
      
      const fileName = 'image_' + new Date().getTime() + '.jpg';
      
      this.file.writeFile(directory, fileName, blob, { replace: true }).then((fileEntry: Entry) => {
        console.log('File saved successfully to:', fileEntry.nativeURL);
        resolve(fileEntry);  // Resolve with the FileEntry object
      }).catch(err => {
        console.log('Error saving file:', err);
        reject(err);  // Reject if writing the file fails
      });
    });
  }
  
  // Convert base64 to Blob
  base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
}
