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

  addStorage() {
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
