import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
                private nativeStorage: NativeStorage) {
    }

    ngOnInit() {
        this.name = this.formBuilder.control('', Validators.required);
        this.url = this.formBuilder.control('https://', Validators.required);
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
            lastLocation: null
        };
    }

    addStorage() {
        this.addDefaultProperties();
        this.nativeStorage.getItem('databases-settings')
            .then(
                (data) => {
                    data.push(this.databaseForm.value);
                    this.nativeStorage.setItem('databases-settings', data);
                    this.onBack();
                },
                (error) => {
                    const array = [
                        this.databaseForm.value
                    ];
                    this.nativeStorage.setItem('databases-settings', array);
                    this.onBack();
                }
            );
    }
}
