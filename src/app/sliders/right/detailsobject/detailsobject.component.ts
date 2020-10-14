import { Component, EventEmitter, OnInit, Output, AfterViewInit } from '@angular/core';
import { ObjectDetails } from 'src/app/objectdetails.service';
import { AuthService } from '../../../auth.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { LocalDatabase } from '../../../usingLocalDatabase.service';
import { EditionLayer } from '../../../layers.service';
import { SelectedObjectsService } from 'src/app/selectedobjects.service';

declare var M: any;

@Component({
  selector: 'right-slide-details-objects',
  templateUrl: './detailsobject.component.html',
  styleUrls: ['./detailsobject.component.scss'],
})
export class DetailsObjectComponent implements OnInit, AfterViewInit {

  static observationsObjectType = [
    'Desordre',
    'StationPompage',
    'ReseauHydrauliqueFerme',
    'OuvrageHydrauliqueAssocie',
    'ReseauHydrauliqueCielOuvert',
    'VoieAcces',
    'OuvrageFranchissement',
    'OuvertureBatardable',
    'VoieDigue',
    'OuvrageVoirie',
    'ReseauTelecomEnergie',
    'OuvrageTelecomEnergie',
    'OuvrageParticulier',
    'Prestation',
    'EchelleLimnimetrique',
    'DesordreDependance'
  ];
  static prestationsObjectType = [
    'StationPompage',
    'ReseauHydrauliqueFerme',
    'OuvrageHydrauliqueAssocie',
    'ReseauHydrauliqueCielOuvert',
    'VoieAcces',
    'OuvrageFranchissement',
    'OuvertureBatardable',
    'VoieDigue',
    'OuvrageVoirie',
    'ReseauTelecomEnergie',
    'OuvrageTelecomEnergie',
    'OuvrageParticulier',
    'EchelleLimnimetrique',
    'Desordre'
  ];
  static desordreObjectType = [
    'StationPompage',
    'ReseauHydrauliqueFerme',
    'OuvrageHydrauliqueAssocie',
    'ReseauHydrauliqueCielOuvert',
    'VoieAcces',
    'OuvrageFranchissement',
    'OuvertureBatardable',
    'VoieDigue',
    'OuvrageVoirie',
    'ReseauTelecomEnergie',
    'OuvrageTelecomEnergie',
    'OuvrageParticulier',
    'Prestation',
    'EchelleLimnimetrique'
  ];
  static editableDocumentClasses = [
    "fr.sirs.core.model.BorneDigue",
    "fr.sirs.core.model.TronconDigue"
  ];

  @Output() readonly statusChange = new EventEmitter<string>();

  activeTab = 'description';
  document;
  objectType;

  constructor(public objectDetails: ObjectDetails, private authService: AuthService,
              private route: Router, private alertCtrl: AlertController,
              private localDB: LocalDatabase, private editionLayer: EditionLayer,
              private selectedObjectsService: SelectedObjectsService) {
                this.objectDetails.detailsType = 'objectDetails';
                this.document = this.objectDetails.selectedObject;
                this.objectType = this.document['@class'].substring(
                  this.document['@class'].lastIndexOf('.') + 1
                );
                this.objectDetails.init();
              }

  ngOnInit() {
  }

  ngAfterViewInit() {
    const elem = document.querySelector('.tabs');
    const options = {};
    M.Tabs.init(elem, options); // initialize materialize tabs to show indicator
  }


  goBack() {
    this.statusChange.emit('general');
  }

  setActiveTab(string) {
    this.activeTab = string;
  }

  canShowObservationsTab() {
    if (DetailsObjectComponent.observationsObjectType.indexOf(this.objectType) !== -1) {
      return true;
    } else {
      return false;
    }
  }

  canShowPrestationsTab() {
    if (DetailsObjectComponent.prestationsObjectType.indexOf(this.objectType) !== -1) {
      return true;
    } else {
      return false;
    }
  }

  canShowDesordresTab() {
    if (DetailsObjectComponent.desordreObjectType.indexOf(this.objectType) !== -1) {
      return true;
    } else {
      return false;
    }
  }

  canShowEditionButtons() {
    if (DetailsObjectComponent.editableDocumentClasses.indexOf(this.document['@class']) !== -1) {
      return false;
    }
    if (this.authService.getValue().role === 'USER' || this.authService.getValue().role === 'ADMIN') {
      return true;
    }
    if (this.authService.getValue().role === 'GUEST') {
      return false;
    }
    if (this.authService.getValue().role === 'EXTERN') {
      return this.document.author && this.authService.getValue()._id === this.document.author;
    }
  }

  canAddObservation() {
    return this.activeTab === 'observations' && this.authService.getValue().role !== 'GUEST';
  }

  editObject() {
    this.route.navigateByUrl('/object/' + this.objectType + '/' + this.document._id);
  }

  removeObject() {
    this.alertCtrl.create({
      header: 'Suppression d\'un object',
      message: 'Voulez-vous vraiment supprimer cet object ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: () => {
            this.localDB.remove(this.document)
            .then(
              () => {
                let i = this.objectDetails.selectedFeatures.length;
                while (i--) {
                  if (this.objectDetails.selectedFeatures[i].get('id') === this.document._id) {
                    this.objectDetails.selectedFeatures.splice(i, 1);
                    break;
                  }
                }
                // Remove the selected features
                this.selectedObjectsService.deleteFeature(this.document._id);
                this.goBack();
                this.editionLayer.redrawEditionLayerAfterSynchronization();
              }
            );
          }
        }
      ]
    })
    .then(
      (alert) => {
        alert.present();
      }
    );
  }

  addObservation() {
    this.route.navigateByUrl('/observation/' + this.document._id.toString());
  }


}
