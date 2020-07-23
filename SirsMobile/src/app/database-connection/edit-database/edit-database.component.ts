import { Component, OnInit } from '@angular/core';

import { Validators, FormBuilder, FormGroup, FormsModule, FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DatabaseModel } from 'src/app/models/database.model';


@Component({
  selector: 'app-edit-database',
  templateUrl: './edit-database.component.html',
  styleUrls: ['./edit-database.component.scss'],
})
export class EditDatabaseComponent implements OnInit {

  databaseForm: FormGroup;

  name: FormControl;
  url: FormControl;
  user_id: FormControl;
  password: FormControl;
  databases: Array<DatabaseModel> = [];
  idDB = 0;

  constructor(private formBuilder: FormBuilder, private router: Router,
    private nativeStorage: NativeStorage, private route: ActivatedRoute) {}

  ngOnInit() {
    this.idDB = parseInt(this.route.snapshot.paramMap.get('id'));
    console.log("id", this.idDB);
    this.nativeStorage.getItem('databases')
    .then(
      (data) => {
        console.log(data);
        this.databases = data;
      },
      (error) => {
        console.log('There is no database in hard disk', error);
        this.onBack();
      }
    ).then(
      () => {
        this.name = this.formBuilder.control(this.databases[this.idDB].name, Validators.required);
        this.url = this.formBuilder.control(this.databases[this.idDB].url, Validators.required);
        this.user_id = this.formBuilder.control(this.databases[this.idDB].user_id, Validators.required);
        this.password = this.formBuilder.control(this.databases[this.idDB].password, Validators.required);
        this.databaseForm = this.formBuilder.group({
          name: this.name,
          url: this.url,
          user_id: this.user_id,
          password: this.password,
        });
      }
    )
  }

  onBack() {
    this.router.navigateByUrl('/database-connection');
  }

  editStorage() {
        this.databases[this.idDB] = this.databaseForm.value;
        this.nativeStorage.setItem('databases', this.databases);
        this.onBack();
  }

}
