// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { IonicModule } from '@ionic/angular';
// import { AppModule } from 'src/app/app.module';
//
// import { AddDatabaseComponent } from './add-database.component';
// import { FormBuilder } from '@angular/forms';
// import { NativeStorage } from '@ionic-native/native-storage/ngx';
//
// describe('Testing AddDatabaseComponent', () => {
//   let component: AddDatabaseComponent ;
//   let fixture: ComponentFixture<AddDatabaseComponent>;
//   let nativeStorage: NativeStorage;
//
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//         imports: [ IonicModule.forRoot({
//             _testing: true
//         }), AppModule, RouterTestingModule ],
//       declarations: [ AddDatabaseComponent ],
//       providers: [ FormBuilder, NativeStorage ]
//     })
//     .compileComponents();
//   }));
//
//   beforeEach(() => {
//     fixture = TestBed.createComponent(AddDatabaseComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//     nativeStorage = TestBed.inject(NativeStorage);
//   });
//
//   it('should be created', () => {
//     expect(component).toBeTruthy();
//   });
//
//   it('onBack method should emit 0 with statusChange Output variable', () => {
//     spyOn(component.statusChange, 'emit');
//
//     component.onBack();
//
//     expect(component.statusChange.emit).toHaveBeenCalledWith(0);
//   });
//
//   it('addStorage method should add the new database informations in hardDisk', (done) => {
//     spyOn(nativeStorage, 'getItem').and.returnValue(Promise.resolve([]));
//     spyOn(nativeStorage, 'setItem');
//
//     component.addStorage();
//
//     setTimeout(() => {
//         expect(nativeStorage.getItem).toHaveBeenCalled();
//         expect(nativeStorage.setItem).toHaveBeenCalled();
//         done();
//     }, 10);
//   });
//
//   it('addStorage method should save the new database informations in hardDisk', (done) => {
//     spyOn(nativeStorage, 'getItem').and.returnValue(Promise.reject());
//     spyOn(nativeStorage, 'setItem');
//
//     component.addStorage();
//
//     setTimeout(() => {
//         expect(nativeStorage.getItem).toHaveBeenCalled();
//         expect(nativeStorage.setItem).toHaveBeenCalled();
//         done();
//     }, 10);
//   });
// });
