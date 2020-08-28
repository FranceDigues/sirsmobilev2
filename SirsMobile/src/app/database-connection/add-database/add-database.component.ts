import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-add-database',
  templateUrl: './add-database.component.html',
  styleUrls: ['./add-database.component.scss'],
})
export class AddDatabaseComponent implements OnInit {

  @Output() readonly statusChange = new EventEmitter<any>();

  databaseForm: FormGroup;

  name: FormControl;
  url: FormControl;
  userId: FormControl;
  password: FormControl;

  constructor(private formBuilder: FormBuilder, private router: Router,
              private nativeStorage: NativeStorage) {}

  ngOnInit() {
    this.name = this.formBuilder.control('', Validators.required);
    this.url = this.formBuilder.control('http://', Validators.required);
    this.userId = this.formBuilder.control('', Validators.required);
    this.password = this.formBuilder.control('', Validators.required);
    this.databaseForm = this.formBuilder.group({
      name: this.name,
      url: this.url,
      userId: this.userId,
      password: this.password,
      replicated: false
    });
  }

  onBack() {
    this.statusChange.emit(0);
  }

  private addDefaultProperties() {
    this.databaseForm.value.favorites = [
      {
        visible: false,
        title: 'Ouvrage revanche de berge',
        filterValue: '',
        realPosition: true,
        featLabels: true,
        selectable: true,
        editable: true,
        color: [255, 0, 0]
      },
      {
        visible: false,
        title: 'Ouvrage particulier',
        filterValue: '',
        realPosition: false,
        featLabels: false,
        selectable: false,
        editable: false,
        color: [0, 0, 0]
      }
    ];
    this.databaseForm.value.context = {
      showText: 'fullName',
      authUser: null,
      backLayer: {
        active: {
                  name: 'OpenStreetMap',
                  source: {
                      type: 'OSM',
                      url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  }
                },
        list:
        [
          {
              name: 'OpenStreetMap',
              source: {
                  type: 'OSM',
                  url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
          },
          {
              name: 'Landscape',
              source: {
                  type: 'OSM',
                  url: 'http://{a-c}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png'
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

  addStorage() {
    this.addDefaultProperties();
    this.nativeStorage.getItem('databases')
    .then(
      (data) => {
        data.push(this.databaseForm.value);
        this.nativeStorage.setItem('databases', data);
        this.onBack();
      },
      (error) => {
        const array = [
          this.databaseForm.value
        ];
        console.log('');
        this.nativeStorage.setItem('databases', array);
        this.onBack();
      }
    );
  }
}
