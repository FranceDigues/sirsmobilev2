import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ModalController,AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AppLayersService } from 'src/app/services/app-layers.service';
import { DatabaseService } from 'src/app/services/database.service';
import { MapManagerService } from 'src/app/services/map-manager.service';
import { DatabaseModel } from 'src/app/components/database-connection/models/database.model';
import { EditionLayerService } from 'src/app/services/edition-layer.service';
import { AppTronconsService, TronconController } from 'src/app/services/troncon.service';
import { MapService } from 'src/app/services/map.service';
import { element } from 'protractor';

export type dataFromDB = {
  offset: number,
  rows: any[],
  total_rows: number 
}
@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss'],
})
export class SearchModalComponent implements OnInit {
  public form: FormGroup;
  public types: any[] = [];
  public specificTypes: {field: string,types: any[]} = {field:'',types:[]};
  public items: dataFromDB = null;
  public tronconNamesCache = new Map<string, string>();

  constructor(private modalCtrl: ModalController, 
              private fb: FormBuilder,
              private appLayersService: AppLayersService,
              private appTronconsService: AppTronconsService,
              private mapManagerService: MapManagerService, 
              private editionLayerService: EditionLayerService,
              public mapService: MapService,
              private cdRef:ChangeDetectorRef,
              public tronconCtrl: TronconController,
              private alertController: AlertController,
              private databaseService: DatabaseService) { 
    this.form = this.fb.group({
      designation: [''],
      type: [''],
      specificType:['']
    },{ validator: this.atLeastOneFieldFilledValidator() });
  }

  ngOnInit() {
    this.appLayersService.getAvailable()
    .then(
      (layers) => {
        //HACK hard to remove old dependance module configuration from desktop
        const withoutOldDependanceModules = this.oldDependanceFilter(layers);
        this.types = this.order(withoutOldDependanceModules);
      }
    );
    this.form.get('type')?.valueChanges.subscribe(async selectedType => {
      const result = await this.getObjectByfilter(null, selectedType);
      if (result && result.rows.length > 0) {
        let elm = null;
        let typeFieldValue = null;
        let typeField = null
        // Parcourir le tableau pour trouver un élément avec un champ commençant par "type"
        for (const row of result.rows) {
          const keys = Object.keys(row.doc);
          typeField = keys.find(key => key.startsWith('type')); // Trouver le champ qui commence par "type"
    
          if (typeField) {
            elm = row;
            typeFieldValue = row.doc[typeField].split(":")[0]; // Récupérer la valeur du champ "type"
            break; // Arrêter la boucle une fois que l'élément est trouvé
          }
        }
    
        if (elm) {
          console.log("Élément trouvé:", elm);
          console.log("Valeur du champ typeField:", typeFieldValue);
          const categories = await this.getCategorieObject(typeFieldValue);
          console.warn('categorie: ', categories)
          this.specificTypes = {field:typeField , types:categories.rows};
        } else {
          console.log("Aucun élément avec un champ commençant par 'type' trouvé.");
          this.specificTypes = {field:null, types:[]};
          this.cdRef.detectChanges();
        }
    
        
      } else {
        console.log("Aucun élément trouvé pour ce type.");
        this.specificTypes = {field:null, types:[]};
        this.cdRef.detectChanges();
      }
    });
    
  }

  private oldDependanceFilter(layers) {
    return layers.filter(l => !(Array.isArray(l.categories) && l.categories.includes('Dépendances')))
  }

  private order(value: any) {
    const data = value.sort(this.sortOn());
    return data;
  }

  closeModal() {
    this.modalCtrl.dismiss(null);
  }

  async validate() {
    const { designation, type, specificType } = this.form.value;
    this.items = await this.getObjectByfilter(designation,type, specificType);
    console.warn("item: ", this.items)
    if(designation){
      this.form.controls['type'].setValue(null);

    }
    this.loadTronconNames();
  }
  private async getObjectByfilter(designation?:string, type?: string, speceficType?: string){
    let queryOptions = {
      include_docs: true
    };
    if (designation) {
      queryOptions['startkey'] = [designation];
      queryOptions['endkey'] = [designation, type || {}];
      
      const view = 'byDesignation/byDesignation';

      try {
          return await this.databaseService.getLocalDB().query(view, queryOptions);
      } catch (error) {
          console.error("Error querying database:", error);
          throw error; // Lever une exception pour gérer les erreurs en amont
      }
    }
    if(type){
 
      queryOptions['startkey']= [type];
      queryOptions['endkey']= [type,{}]
      const allDocsByType = await this.databaseService.getLocalDB().query('Element/byClassAndLinear' , queryOptions);
      const fieldToFilter = this.specificTypes.field;
      if(speceficType){
        const filteredDocs = allDocsByType.rows.filter(item => item.doc[fieldToFilter] === speceficType);
        return {rows:filteredDocs};
        console.warn("filtrered: ", filteredDocs) 
      }
      return allDocsByType;
    }
    
    return null;
  }

  public async getCategorieObject(refType: string){
    let queryOptions = {
      include_docs: true
    };
    if(refType){
      queryOptions['startkey']= ["fr.sirs.core.model."+refType];
      queryOptions['endkey']= ["fr.sirs.core.model."+refType,{}]
      return await this.databaseService.getLocalDB().query('Element/byClassAndLinear' , queryOptions);
    }
  }

  private sortOn() {
    return (a, b) => {
      const lowtitlea = a.title.toLowerCase();
      const lowtitleb = b.title.toLowerCase();

      if (lowtitlea.localeCompare(lowtitleb) < 0) {
        return -1;
      } else if (lowtitlea.localeCompare(lowtitleb) > 0){
        return 1;
      } else {
          return 0;
      }
    };
  }
  public async goToItem(item: any){
    let alertShown = false;
    const troncon = this.getTronconNameCached(item.foreignParentId)
    const currLayer = this.appLayersService.getFavorites().find(e => e.filterValue === item['@class']);
    if(!currLayer || (!currLayer.visible || !currLayer.selectable)){
      const couche = this.getclass(item['@class']);
      await this.showAlert("Activez la couche " + couche,"Veuillez activer la couche "+ couche+ ", la rendre <strong>visible</strong> et <strong>séléctionnable</strong>")
      alertShown = true;
    }
    else if( !this.appTronconsService.favorites.find( e => e.libelle === troncon ) && troncon != "Unknown"){ 
      await this.showAlert("Activer le tronçon " + troncon, "Veuillez activer le tronçon " + troncon);
      alertShown = true;
    }
    else if(item.date_fin && !this.mapService.archiveObjectsFlag ){
      await this.showAlert("Activer les objets archivés", "Veuillez activer les objets archivés.");
      alertShown = true;
    }
    if(!alertShown){
      this.modalCtrl.dismiss(item);
    }
    
  }


  public getclass(fullclass : string){
    return fullclass.split(".").pop();
  }

  public async getTronconName(id: string){
    const res =  await this.databaseService.getLocalDB().query("byId", {
      key: id,
      include_docs: true // pour inclure les documents complets
    });
    return res.rows[0].doc.libelle;
  }

  public getTronconNameCached(id: string): string {
    return this.tronconNamesCache.get(id) || 'Unknown'; 
  }
  public async loadTronconNames() {
    for (let item of this.items?.rows) {
      const id = item.doc?.foreignParentId;
      if (id && !this.tronconNamesCache.has(id)) {
        const tronconName = await this.getTronconName(id);
        this.tronconNamesCache.set(id, tronconName);
      }
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
  
    await alert.present();
  }
  public atLeastOneFieldFilledValidator(): ValidatorFn {
    return (form: FormGroup): { [key: string]: any } | null => {
      const designation = form.get('designation')?.value;
      const type = form.get('type')?.value;
  
      if (!designation && !type) {
        return { atLeastOneRequired: true };
      }
      return null;
    };
  }

}
