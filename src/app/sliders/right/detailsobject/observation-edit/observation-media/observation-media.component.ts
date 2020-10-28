import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ObservationEditService } from 'src/app/observationedit.service';
import { ModalController, ToastController } from '@ionic/angular';
import { PositionByBorneModal2Component } from './positionbyborne-modal2/positionbyborne-modal2.component';
import { GeolocService } from 'src/app/geoloc.service';
import { CameraService } from '@ionic-lib/lib-camera/camera.service';
import { Options } from '@ionic-lib/lib-camera/interface.model';
import { Camera } from '@ionic-native/camera/ngx';
import { File, Entry, Metadata, DirectoryEntry } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { UuidUtils } from 'src/app/uuid-utils';
import { formatDate } from '@angular/common';
import { GlobalConfigService } from 'src/app/globalconfig.service';
import { EditionModeService } from 'src/app/editionmode.service';
import { AppLayer } from 'src/app/layers.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'observation-media',
  templateUrl: './observation-media.component.html',
  styleUrls: ['./observation-media.component.scss'],
})
export class ObservationMediaComponent implements OnInit {

  @Output() readonly viewChange = new EventEmitter<string>();

  view: 'media' | 'map' | 'note';
  config: 'fullName' | 'abstract' | 'both';

  constructor(public OES: ObservationEditService, private modalCtrl: ModalController,
              private geolocService: GeolocService, private cameraService: CameraService,
              private camera: Camera, private file: File, private webview: WebView,
              private toastCtrl: ToastController,  private cdr: ChangeDetectorRef,
              private globalConfigService: GlobalConfigService,
              private editionService: EditionModeService, private appLayer: AppLayer,
              private http: HttpClient) {
                this.view = 'media';
                this.config = this.globalConfigService.context;
                this.OES.importPhotoData = null;
                this.OES.mediaOptions.id = '';
              }

  ngOnInit() {}

  cancel() {
    this.viewChange.emit('form');
  }

  setView(str: 'media' | 'map' | 'note') {
    this.view = str;
  }

  showText(str: 'fullName' | 'abstract' | 'both') {
    const isSameString = this.config === str;
    return isSameString;
  }

  initData() {
    // Create borne position
    if (!this.OES.mediaOptions.systemeRepId) {
        return  {
            systemeRepId: '',
            borne_aval: '',
            borne_distance: 0,
            borneId: '',
            borneLibelle: '',
            media: true
        };
    }

    // Edit Debut
    if (this.OES.mediaOptions.systemeRepId) {
        return {
            systemeRepId: this.OES.mediaOptions.systemeRepId,
            borne_aval: this.OES.mediaOptions.borne_debut_aval ? 'true' : 'false',
            borne_distance: this.OES.mediaOptions.borne_debut_distance,
            borneId: this.OES.mediaOptions.borneDebutId,
            borneLibelle: this.OES.mediaOptions.borneDebutLibelle || '',
            media: true
        };
    }
  }

  async selectPosBySR() {
    const data = this.initData();
    const modal = await this.modalCtrl.create({
      component: PositionByBorneModal2Component,
      animated: true,
      cssClass: 'modal-css',
      componentProps: {
        data: data
      }
    });
    return await modal.present();
  }

  editNote() {
    this.setView('note');
  }

  locateMe() {
    this.geolocService.getCurrentLocation()
    .then(
      (position) => {
        this.OES.handlePos(position);
      }
    );
  }

  takePhotoInGallery() {
    const options: Options = {
      quality: 50,
      encodingType: this.camera.EncodingType.JPEG,
      destinationType: this.camera.DestinationType.FILE_URI,
    };
    this.cameraService.getPictureInGallery(options)
    .then(
      (value: string) => {
        const valueTmp = value.replace('data:image/jpeg;base64,', '') ;
        console.log('galleryPhoto: ', value);
        this.file.resolveLocalFilesystemUrl(valueTmp)
        .then(
          (file: Entry) => {
            console.log('galleryPhoto file: ', file);
            this.savePicture(file);
          }
        );
      }
    );
  }

  saveNoteEdit(file) {
    this.savePicture(file);
  }

  takePhoto() {
    const options: Options = {
      quality: 50,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG
    };
    this.cameraService.takePhoto(options)
    .then(
      (value: string) => {
        const valueTmp = value.replace('data:image/jpeg;base64,', '') ;
        this.file.resolveLocalFilesystemUrl(valueTmp)
        .then(
          (file: Entry) => {
            this.savePicture(file);
          }
        );
      }
    );
  }

  savePicture(file: Entry) {
    file.getMetadata((metadata: Metadata) => {
      if (metadata.size > 1048576) {
        this.OES.warningSizeMessage();
        file.remove(() => console.log('File has been removed correctly'));
        return;
      } else {
        this.file.resolveDirectoryUrl(this.OES.mediaPath)
        .then(
          (targetDir: DirectoryEntry) => {
            const photoId = UuidUtils.generateUuid();
            const fileName = photoId + '.jpg';
            // Copy image file in its final directory.
            file.copyTo(targetDir, fileName, () => {
              // Store the photo in the object document.
              this.fillMediaOptions(photoId, fileName);
              // Set Photo Path
              this.OES.importPhotoData = this.OES.getPhotoPath(this.OES.mediaOptions);
              // Force Image to change
              this.cdr.detectChanges();
            })
          }
        );
      }
    });
  }

  fillMediaOptions(photoId: string, fileName: string) {
    // Store the photo in the object document.
    this.OES.mediaOptions['id'] = photoId;
    this.OES.mediaOptions['@class'] = 'fr.sirs.core.model' + (this.OES.objectType === 'DesordreDependance' ? '.PhotoDependance' : '.Photo');
    this.OES.mediaOptions['date'] = formatDate(Date.now(), 'yyyy-MM-dd', 'en-US');
    this.OES.mediaOptions['chemin'] = '/' + fileName;
    this.OES.mediaOptions['valid'] = false;
  }

  save() {
      if (this.OES.mediaOptions.id && this.OES.mediaOptions.id !== '') {
        if (typeof this.OES.photos === 'undefined') {
          this.OES.doc.photos = [];
        }
        const mediaOptions = Object.assign({}, this.OES.mediaOptions);
        this.OES.doc.photos.push(mediaOptions);
        if (this.OES.importPhotoData) {
          if (typeof this.OES.objectDoc._attachments === 'undefined') {
            this.OES.objectDoc._attachments = {};
          }

          // Convert url image to blob
          this.OES.getImage(this.OES.importPhotoData).subscribe(
            (blob) => {
              let reader = new FileReader();
              reader.readAsDataURL(blob);
              // Convert blob to base64
              reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    let base64data = reader.result.replace('data:image/jpeg;base64,', '');
                    // Save the photo like attachment to the object
                    this.OES.objectDoc._attachments[this.OES.mediaOptions.id] = {
                      content_type: 'image/jpeg',
                      data: base64data
                    }
                    this.editionService.saveObject(this.OES.objectDoc)
                    .then(() => {
                        this.cancel();
                        this.appLayer.syncAllAppLayer();
                    });
                }
              }
            }
        );
      }
    } else {
      this.toastCtrl.create({
        message: 'Formulaire d\'ajout de média incomplet: Veuillez au moins ajouter une image/note',
        duration: 7000
      }).then(toast => toast.present());
    }
  }

}
