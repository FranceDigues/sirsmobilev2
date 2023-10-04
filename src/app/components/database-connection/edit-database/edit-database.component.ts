import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DatabaseService } from 'src/app/services/database.service';
import { DatabaseModel } from 'src/app/components/database-connection/models/database.model';


@Component({
  selector: 'app-edit-database',
  templateUrl: './edit-database.component.html',
  styleUrls: ['./edit-database.component.scss'],
})
export class EditDatabaseComponent implements OnInit {

  @Input() databaseIndex;
  @Output() readonly statusChange = new EventEmitter<any>();

  databaseForm: FormGroup;
  name: FormControl;
  url: FormControl;
  userId: FormControl;
  password: FormControl;
  databases: Array<DatabaseModel> = [];

  constructor(private formBuilder: FormBuilder,
              private nativeStorage: NativeStorage,
              private dbService: DatabaseService) {}

  ngOnInit() {
    this.nativeStorage.getItem('databases-settings')
    .then(
      (data) => {
        this.databases = data;
        this.name = this.formBuilder.control(this.databases[this.databaseIndex].name, Validators.required);
        this.url = this.formBuilder.control(this.databases[this.databaseIndex].url, Validators.required);
        this.userId = this.formBuilder.control(this.databases[this.databaseIndex].userId, Validators.required);
        this.password = this.formBuilder.control(this.databases[this.databaseIndex].password, Validators.required);
        this.databaseForm = this.formBuilder.group({
          name: this.name,
          url: this.url,
          userId: this.userId,
          password: this.password,
          replicated: false
        });
      },
      (error) => {
        console.error('There is no database in hard disk', error);
        this.onBack();
      }
    );
  }

  onBack() {
    this.statusChange.emit(0);
  }

  private addDefaultProperties() {
    this.databaseForm.value.favorites = [];
    this.databaseForm.value.context = {
      showText: 'fullName',
      authUser: null,
      currentView: null,
      backLayer: {
        active: {
                  name: 'OpenStreetMap',
                  source: {
                      type: 'OSM',
                      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  }
                },
        list:
        [
          {
              name: 'OpenStreetMap',
              source: {
                  type: 'OSM',
                  url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
          },
          {
              name: 'Landscape',
              source: {
                  type: 'OSM',
                  url: 'https://{a-c}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png'
              }
          }
        ]
      },
      settings: {
        geolocation: true,
        edition: false,
      },
      lastLocation: null,
      version: null
    };
  }

  editStorage() {
      this.addDefaultProperties();
      this.databases[this.databaseIndex] = this.databaseForm.value;
      this.dbService.saveDatabaseSettings(this.databases);
      this.onBack();
  }

}
