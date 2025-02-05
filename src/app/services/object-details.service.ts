import { Injectable } from '@angular/core';
import { LocalDatabase } from './local-database.service';
import { Router } from '@angular/router';
import { EditionModeService } from './edition-mode.service';
import { MapManagerService } from './map-manager.service';
import { AlertController } from '@ionic/angular';
import { FormsTemplateService } from './formstemplate.service';
import { PluginUtils } from '../utils/plugin-utils';
import { DocToStringPipe } from "../pipe/doc-to-string/doc-to-string.pipe";
import { AppLayersService } from "./app-layers.service";
import { StorageService } from "@ionic-lib/lib-storage/storage.service";

@Injectable({
  providedIn: 'root'
})
export class ObjectDetails {

  // Paths
  photoDir: string | null;
  notesDir: string | null;
  docDic: string | null;

  // Selections
  selectedFeatures: Array<any>;
  selectedObject: any;
  selectedObservation: any;
  selectedPhoto: any;

  abstract: any;
  detailsType: 'objectDetails' | 'observationDetails' | 'photoDetails';

  // Prestations
  prestationMap: Object;
  tempPrestation: any;
  allPrestationList: Array<any>;
  prestationList: Array<any>;

  // Desordres
  desordreMap: Object;
  tempDesordre: any;
  allDesordreList: Array<any>;
  desordreList: Array<any>;

  // isDependance
  isDependance: boolean;

  // isDeletable
  isDeletable: boolean;

  constructor(private localDB: LocalDatabase,
              private route: Router,
              private editionService: EditionModeService,
              private mapManagerService: MapManagerService,
              private alertCtrl: AlertController,
              private formService: FormsTemplateService,
              private docToStringPipe: DocToStringPipe,
              private appLayersService: AppLayersService,
              private storageService: StorageService,
  ) {
    // Paths
    this.photoDir = null;
    this.notesDir = null;
    this.docDic = null;

    // Selections
    this.selectedFeatures = [];
    this.selectedObject = null;
    this.selectedObservation = null;

    this.abstract = {};

    // Prestations
    this.prestationMap = {};
    this.tempPrestation = null;
    this.allPrestationList = [];
    this.prestationList = [];

    // Desordres
    this.desordreMap = {};
    this.tempDesordre = null;
    this.allDesordreList = [];
    this.desordreList = [];

    // isDependance
    this.isDependance = false;

    // is deletable
    this.isDeletable = false;
  }

  /**
   * Initializes the object.
   *
   * @return {Promise<void>} A promise that resolves when the initialization is complete.
   */
  public async init(): Promise<void> {
    if (this.selectedObject) {
      let prestationClass: string;
      let desordreClass: string;
      let linearId: string;
      this.isDependance = PluginUtils.isDependanceAhDoc(this.selectedObject);

      await this.initDisplayedValuesForReferences();
      if (this.isDependance) {
        desordreClass = 'fr.sirs.core.model.DesordreDependance';
        prestationClass = 'fr.sirs.core.model.PrestationAmenagementHydraulique';
        linearId = null;
      } else if (this.selectedObject['@class'] === 'fr.sirs.core.model.Photo') {
        desordreClass = 'fr.sirs.core.model.Desordre';
        prestationClass = 'fr.sirs.core.model.Prestation';
        linearId = null;
      } else {
        desordreClass = 'fr.sirs.core.model.Desordre';
        prestationClass = 'fr.sirs.core.model.Prestation';
        linearId = this.selectedObject.linearId;
      }
      await Promise.all([
        this.initPrestation(prestationClass, linearId),
        this.initDesordre(desordreClass, linearId),
      ]);
      await this.initIsDeletable();
    } else {
      console.error("Unexpected behavior: you must define selectedObject before initialization.");
    }
  }

  /**
   * Initializes the displayed values for references in the selected object.
   *
   * @returns {Promise<void>} A Promise that resolves when the method is complete.
   * @throws {Error} If the selectedObject is not initialized.
   */
  private async initDisplayedValuesForReferences(): Promise<void> {
    if (this.selectedObject === undefined || this.selectedObject === null) {
      throw Error('SelectedObject must be initialized before using initIsDeletable');
    }

    this.abstract = {};
    const regex: RegExp = new RegExp('.*Id$');

    for (let key in this.selectedObject) {

      if (regex.test(key)) {

        const id: string = this.selectedObject[key];
        if (id === null || id === undefined) {
          continue;
        }

        try {
          const doc: any = await this.localDB.get(id);
          this.abstract[key.substr(0, key.length - 2)] = this.docToStringPipe.transform(doc);
        } catch (e) {
          console.log('No document found for this ID (' + id + '). ' + e);
        }

      } else if (key.toLowerCase() === 'author') {

        const value: string = this.selectedObject[key];

        try {
          const doc: any = await this.localDB.get(value);
          this.abstract['author'] = doc.login;
        } catch (e) {
          console.log('No document found for this author ID (' + value + '). ' + e);
        }

      }
    }
  }

  /**
   * Retrieves all prestations from the current section (troncon) and populates
   * `this.prestationMap`, `this.allPrestationList` and `this.prestationList`
   * @param prestationClass class of prestations in the db
   * @param linearId id of the section (troncon)
   * @private
   */
  private async initPrestation(prestationClass: string, linearId: string): Promise<void> {
    try {
      // we retrieve the prestations in the current section (tronçon)
      const response: { value: any, doc: any }[] = await this.localDB.query('Element/byClassAndLinear', {
        startkey: [prestationClass, linearId],
        endkey: [prestationClass, linearId, {}],
        include_docs: true
      });

      this.prestationMap = {};
      this.allPrestationList = [];

      for (const elt of response) {
        let prestaFinished = false;
        if (elt.doc.date_fin !== undefined) {
          try {
            const dateFin = new Date(elt.doc.date_fin);
            const dateNow = new Date();
            if (dateFin < dateNow) {
              prestaFinished = true;
            }
          } catch (_) {
            prestaFinished = true;
            console.info(`Cannot read end date of prestation "${elt.value.id}", assuming it is finished.`);
          }
        }

        elt.value.prestationFinished = prestaFinished;
        this.prestationMap[elt.value.id] = elt.value.designation ? elt.value.designation + ' ' + (elt.value.libelle ? elt.value.libelle : '') : elt.value.id;
        this.allPrestationList.push(elt.value);
      }

      this.prestationList = this.filterPrestationList();
      this.tempPrestation = null;
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * Retrieves all degradations from the current section (troncon) and populates
   * `this.desordreMap`, `this.allDesordreList` and `this.desordreList`
   * @param desordreClass class of desordre in the db
   * @param linearId id of the section (troncon)
   * @private
   */
  private async initDesordre(desordreClass: string, linearId: string): Promise<void> {
    try {
      const response: { value: any }[] = await this.localDB.query('Element/byClassAndLinear', {
        startkey: [desordreClass, linearId],
        endkey: [desordreClass, linearId, {}]
      });

      this.desordreMap = {};
      this.allDesordreList = [];

      for (const elt of response) {
        this.desordreMap[elt.value.id] = elt.value.designation ? elt.value.designation : elt.value.id;
        this.allDesordreList.push(elt.value);
      }

      this.desordreList = this.filterDesordreList();
      this.tempDesordre = null;
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Initializes the `isDeletable` property.
   *
   * @throws {Error} Throws an error if `selectedObject` is not initialized.
   *
   * @returns {Promise<void>} A promise that resolves when the `isDeletable` property is initialized.
   */
  private async initIsDeletable(): Promise<void> {
    if (this.selectedObject === undefined || this.selectedObject === null) {
      throw Error('SelectedObject must be initialized before using initIsDeletable');
    }

    // delete createFromMobile attribute if object are already validate
    if (this.selectedObject.valid === true && this.selectedObject.createFromMobile) {
      delete this.selectedObject.createFromMobile;
      await this.localDB.save(this.selectedObject);
    }
    this.isDeletable = this.selectedObject.createFromMobile === true;
  }

  /**
   * Opens the details of an observation.
   *
   * @param {any} observation - The observation object to display details for.
   */
  public openObservationDetails(observation: any): void {
    this.selectedObservation = observation;
    this.detailsType = 'observationDetails';
  }

  /**
   * Opens the photo details for the given photo.
   *
   * @param {any} photo - The photo object to display details for.
   *
   * @return {void}
   */
  public openPhotoDetails(photo: any): void {
    this.selectedPhoto = photo;
    this.detailsType = 'photoDetails';
  }

  /**
   * Opens a Desordre link based on the given ID.
   * If the isDependance flag is true, it opens the link to DesordreDependance, otherwise it opens the link to Desordre.
   *
   * @param {string | number} id - The ID of the Desordre object.
   *
   * @return {Promise<void>} - Resolves when the link is successfully opened.
   */
  public async openDesordreLink(id: string | number): Promise<void> {
    if (this.isDependance) {
      await this.route.navigateByUrl('/object/DesordreDependance/' + id);
    } else {
      await this.route.navigateByUrl('/object/Desordre/' + id);
    }
  }

  /**
   * Link a desordre to an object
   */
  public async addDesordre(): Promise<void> {
    if (!this.tempDesordre) {
      return;
    }
    if (!this.selectedObject.desordreIds) {
      this.selectedObject.desordreIds = [];
    }
    this.selectedObject.desordreIds.push(this.tempDesordre);
    try {
      await this.addObjectId(this.tempDesordre, this.selectedObject["_id"], 'prestationIds');
    } catch (e) {
      console.warn(e);
    }
    this.tempDesordre = null;
    this.desordreList = this.filterDesordreList();
    this.selectedObject.valid = false;
    this.selectedObject.dateMaj = new Date().toISOString().split('T')[0];
    await this.editionService.updateObject(this.selectedObject);
    this.mapManagerService.syncAllAppLayer();
    this.mapManagerService.clearAll();
  }

  /**
   * Unlink a desordre from an object
   * @param index
   */
  public async removeDesordre(index: number): Promise<void> {
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: 'Suppression de l\'association',
      message: 'Voulez vous vraiment supprimer cette association ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'ok',
        }
      ]
    });
    await alert.present();
    const res = await alert.onDidDismiss();

    if (res.role === 'ok') {
      const desordre = (this.selectedObject.desordreIds as string[]).splice(index, 1)[0];
      if (this.selectedObject.desordreIds.length === 0) {
        delete this.selectedObject.desordreIds;
      }
      try {
        await this.removeObjectId(desordre, this.selectedObject["_id"], 'prestationIds');
      } catch (e) {
        console.warn(e);
      }
      this.selectedObject.valid = false;
      this.selectedObject.dateMaj = new Date().toISOString().split('T')[0];
      this.desordreList = this.filterDesordreList();
      await this.editionService.updateObject(this.selectedObject);
      this.mapManagerService.syncAllAppLayer();
      this.mapManagerService.clearAll();
    }
  }

  /**
   * Filters the list of disorder items based on the selected object's disorder ids.
   *
   * @returns {any[]} - The filtered disorder list.
   */
  private filterDesordreList(): any[] {
    return this.allDesordreList.filter((item) => {
      return !this.selectedObject.desordreIds || this.selectedObject.desordreIds.indexOf(item.id) === -1;
    });
  }

  /**
   * Opens the prestation link.
   *
   * @param {number|string} id - The ID of the prestation.
   *
   * @return {Promise<void>} - A promise that resolves when the prestation link is opened successfully.
   */
  public async openPrestationLink(id: number | string): Promise<void> {
    if (this.isDependance) {
      await this.route.navigateByUrl('/object/PrestationAmenagementHydraulique/' + id);
    } else {
      await this.route.navigateByUrl('/object/Prestation/' + id);
    }
  }

  /**
   * Add a prestation to the selected object.
   *
   * @returns {Promise<void>} - A promise that resolves when the prestation has been added.
   */
  public async addPrestation(): Promise<void> {
    if (!this.tempPrestation) {
      return;
    }

    if (!this.selectedObject.prestationIds) {
      this.selectedObject.prestationIds = [];
    }
    this.selectedObject.prestationIds.push(this.tempPrestation);
    this.prestationList = this.filterPrestationList();
    // Make the doc in edit mode
    this.selectedObject.valid = false;
    this.selectedObject.dateMaj = new Date().toISOString().split('T')[0];
    await this.editionService.updateObject(this.selectedObject);

    // Reciproque ajout dans l'objet prestation
    let clazz = PluginUtils.doc2Class(this.selectedObject);
    let attribute: string;
    if (this.isDependance) {
      attribute = this.formService.attributeNameOfObjectFromClass("PrestationAmenagementHydraulique", clazz);
    } else {
      attribute = this.formService.attributeNameOfObjectFromClass("Prestation", clazz);
    }
    const regex = /.*Ids$/;
    if (regex.test(attribute)) {
      await this.addObjectId(this.tempPrestation, this.selectedObject["_id"], attribute);
    }

    // reset temporary prestation
    this.tempPrestation = null;
  }

  /**
   * Removes a prestation at the specified index.
   *
   * @param index - The index of the prestation to remove.
   * @returns A Promise that resolves when the prestation is removed successfully.
   */
  public async removePrestation(index: number): Promise<void> {

    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: 'Suppression de l\'association',
      message: 'Voulez vous vraiment supprimer cette association ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'ok',
        }
      ]
    });
    await alert.present();
    const res = await alert.onDidDismiss();

    if (res.role === 'ok') {
      let removedIds = this.selectedObject.prestationIds.splice(index, 1);
      if (this.selectedObject.prestationIds.length === 0) {
        delete this.selectedObject.prestationIds;
      }
      this.selectedObject.valid = false;
      this.selectedObject.dateMaj = new Date().toISOString().split('T')[0];
      this.prestationList = this.filterPrestationList();
      await this.editionService.updateObject(this.selectedObject);

      // Reciproque suppression dans l'objet prestation
      if (removedIds && removedIds.length == 1) {
        let clazz = PluginUtils.doc2Class(this.selectedObject);
        let attribute: string;
        if (this.isDependance) {
          attribute = this.formService.attributeNameOfObjectFromClass("PrestationAmenagementHydraulique", clazz);
        } else {
          attribute = this.formService.attributeNameOfObjectFromClass("Prestation", clazz);
        }
        const regex = new RegExp('.*Ids$');
        if (regex.test(attribute)) {
          await this.removeObjectId(removedIds[0], this.selectedObject["_id"], attribute);
        }
      }
    }
  }

  /**
   * Filters the prestation list based on the selected object's prestationIds.
   * @private
   * @returns {Array} - The filtered prestation list.
   */
  private filterPrestationList(): any[] {
    return this.allPrestationList.filter((item) => {
      return !this.selectedObject.prestationIds || this.selectedObject.prestationIds.indexOf(item.id) === -1;
    });
  }

  /**
   * Adds an ID to a document in the local database.
   *
   * @param {string} receiverId - The ID of the document to add the ID to.
   * @param {string} idToAdd - The ID to add.
   * @param {string} attribute - The attribute to add the ID to.
   * @return {Promise<void>} A promise that resolves when the ID is added to the document successfully.
   */
  private async addObjectId(receiverId: string, idToAdd: string, attribute: string): Promise<void> {
    const doc: any = await this.localDB.get(receiverId);

    if (!doc) {
      console.error("Document (" + receiverId + ") not found.");
      return;
    }

    if (doc[attribute]) {
      doc[attribute].push(idToAdd);
    } else {
      doc[attribute] = [idToAdd];
    }
    doc.valid = false;
    doc.dateMaj = new Date().toISOString().split('T')[0];
    // Check if the layer model is visible or not
    const isVisible = !!this.appLayersService.getFavorites().find(item => item.filterValue === doc['@class']);
    await this.editionService.updateObject(doc, isVisible);
  }

  /**
   * Removes an object ID from a document in the local database.
   *
   * @param {string} receiverId - The ID of the receiver document.
   * @param {string} idToRemove - The ID to be removed.
   * @param {string} attribute - The attribute on which to perform the removal.
   * @returns {Promise<void>} - A Promise that resolves when the removal is complete.
   */
  private async removeObjectId(receiverId: string, idToRemove: string, attribute: string): Promise<void> {
    const doc: any = await this.localDB.get(receiverId);

    if (!doc) {
      console.error("Document (" + receiverId + ") not found.");
      return;
    }

    if (doc[attribute] && Array.isArray(doc[attribute]) && doc[attribute].indexOf(idToRemove) != -1) {
      doc[attribute].splice(doc[attribute].indexOf(idToRemove), 1);
    }
    doc.valid = false;
    doc.dateMaj = new Date().toISOString().split('T')[0];
    // Check if the layer model is visible or not
    const isVisible = !!this.appLayersService.getFavorites().find(item => item.filterValue === doc['@class']);
    await this.editionService.updateObject(doc, isVisible);
  }

  async getShowBorneRelativePosition(): Promise<boolean> {
    const lsRes: boolean = await this.storageService.getItem<boolean>('showBorneRelativePosition');
    if (lsRes === undefined) return false;
    return lsRes;
  }

  async setShowBorneRelativePosition(value: boolean): Promise<void> {
    return this.storageService.setItem<boolean>('showBorneRelativePosition', value);
  }

}
