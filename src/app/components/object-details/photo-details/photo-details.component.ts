import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { ObjectDetails } from 'src/app/services/object-details.service';
import { File } from '@ionic-native/file/ngx';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController } from '@ionic/angular';
import { LocalDatabase } from 'src/app/services/local-database.service';
import { EditObjectService } from 'src/app/services/edit-object.service';
import { EditionModeService } from 'src/app/services/edition-mode.service';

@Component({
  selector: 'photo-details',
  templateUrl: './photo-details.component.html',
  styleUrls: ['./photo-details.component.scss'],
})
export class PhotoDetailsComponent implements OnInit {

  @Output() readonly detailsTypeChange = new EventEmitter<any>();

  photoPath: string;
  orientationPhoto: string;
  cote: string;
  photographe: string;

  constructor(private objectDetails: ObjectDetails, private file: File, private localDB: LocalDatabase,
    private webview: WebView, private fileOpener: FileOpener, private editionModeService: EditionModeService,
    private router: Router, private alertCtrl: AlertController, private authService: AuthService) { }

  ngOnInit() {
    //Init photo path
    const mediaPath = `${this.file.dataDirectory}medias`;
    const path = `${mediaPath}/${this.objectDetails.selectedPhoto.id}.jpg`;
    this.photoPath = this.webview.convertFileSrc(path);

    //Init references
    if (this.objectDetails.selectedPhoto.orientationPhoto) {
      this.localDB.get(this.objectDetails.selectedPhoto.orientationPhoto)
        .then((result) => {
          this.orientationPhoto = result.libelle
        });
    }
    if (this.objectDetails.selectedPhoto.coteId) {
      this.localDB.get(this.objectDetails.selectedPhoto.coteId)
        .then((result) => {
          this.cote = result.libelle
        });
    }
    if (this.objectDetails.selectedPhoto.photographeId) {
      this.localDB.get(this.objectDetails.selectedPhoto.photographeId)
        .then((result) => {
          if (result.nom) {
            this.photographe = result.prenom ? result.nom + ' ' + result.prenom : result.nom; 
          } else {
            this.photographe = result._id;
          }
        });
    }
  }

  open() {
    const indexList = this.homemadeIndexOf(this.photoPath, '/');
    const finalPath = this.photoPath.substring(indexList[3]);
    this.fileOpener.open(finalPath, 'image/jpeg')
      .then(
        () => {
          console.debug('File opened successfully');
        },
        (error) => {
          console.error('Error open method :', error);
        }
      );
  }

  // Index of looking for multiple occurrence of a character and returning a list with all the indexes.
  homemadeIndexOf(myString: string, character: string) {
    const list: number[] = [];
    for (let i = 0; i < myString.length; i++) {
      if (myString.charAt(i) === character) {
        list.push(i);
      }
    }
    return list;
  }

  goBack() {
    this.detailsTypeChange.emit();
  }

  editObject() {
    if (this.objectDetails.selectedObject._id && this.objectDetails.selectedPhoto.id) {
      this.router.navigateByUrl('/photo/' + this.objectDetails.selectedObject._id + '/' + this.objectDetails.selectedPhoto.id);
    } else {
      console.log("Impossible to access edition, parent=" + this.objectDetails.selectedObject._id + ", id=" + this.objectDetails.selectedPhoto.id)
    }
  }

  canShowEditionButtons() {
    if (this.authService.getValue().role === 'USER' || this.authService.getValue().role === 'ADMIN') {
      return true;
    }
    if (this.authService.getValue().role === 'GUEST') {
      return false;
    }
    if (this.authService.getValue().role === 'EXTERN') {
      return this.objectDetails.selectedPhoto.author && this.authService.getValue()._id === this.objectDetails.selectedPhoto.author;
    }
  }

  async removePhoto() {
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: 'Suppression d\'une photo',
      message: 'Voulez-vous vraiment supprimer cette photo ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'OK',
          handler: () => {
            //Remove photo from parent
            this.removeSelectedPhotoFromParent();

            //Remove corresponding attachment
            if (this.objectDetails.selectedObject._attachments) delete this.objectDetails.selectedObject._attachments[this.objectDetails.selectedObject.id];

            //Save parent and go back
            this.saveParent().then(() => this.goBack());
          }
        }
      ]
    });
    await alert.present();
  }

  private removeSelectedPhotoFromParent() {
    let array: Array<any> = this.objectDetails.selectedObject.photos;
    let indexFound = -1;
    for (let i = 0; i < array.length; i++) {
      if (array[i].id === this.objectDetails.selectedPhoto.id) {
        indexFound = i;
      }
    }
    if (indexFound === -1) throw new Error("Unexpected behavior. the parent object " + this.objectDetails.selectedObject._id + " does not contain the photo " + this.objectDetails.selectedPhoto.id);
    array.splice(indexFound, 1);
  }

  private saveParent() {
    return new Promise(resolve => {
      this.objectDetails.selectedObject.valid = false;
      this.objectDetails.selectedObject.dateMaj = new Date().toISOString().split('T')[0];
      this.editionModeService.updateObject(this.objectDetails.selectedObject).then(() => {
        resolve();
      });
    })
  }
}
