import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormsModule, FormControl } from '@angular/forms'
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-database',
  templateUrl: './add-database.component.html',
  styleUrls: ['./add-database.component.scss'],
})
export class AddDatabaseComponent implements OnInit {

  databaseForm: FormGroup;

  title: FormControl;
  url: FormControl;
  user_id: FormControl;
  password: FormControl;

  // form = {
  //   title: '',
  //   url: 'http://',
  //   user_id: '',
  //   password: ''
  // };
  constructor(private formBuilder: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.title = this.formBuilder.control('', Validators.required);
    this.url = this.formBuilder.control('http://', Validators.required);
    this.user_id = this.formBuilder.control('', Validators.required);
    this.password = this.formBuilder.control('', Validators.required);
    this.databaseForm = this.formBuilder.group({
      title: this.title,
      url: this.url,
      user_id: this.user_id,
      password: this.password,
    });
  }

  logForm() {
    console.log(this.databaseForm.value);
  }

  onBack() {
    this.router.navigateByUrl('/database-connection');
  }

}
