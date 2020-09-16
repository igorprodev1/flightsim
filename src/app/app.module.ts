import { AppInterceptor } from './app-interceptor';
import { GamepadService } from './services/gamepad.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

// angularfire2
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

// cesium
import { AngularCesiumModule } from 'angular-cesium';

// material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

// custom
import { FlightsimComponent } from './pages/flightsim/flightsim.component';
import { AircraftDialogComponent } from './dialogs/aircraft-dialog/aircraft-dialog.component';
import { SelLocationDialogComponent } from './dialogs/sel-location-dialog/sel-location-dialog.component';
import { NewLocationDialogComponent } from './dialogs/new-location-dialog/new-location-dialog.component';
import { EditLocationDialogComponent } from './dialogs/edit-location-dialog/edit-location-dialog.component';
import { SelectControllerDialogComponent } from './dialogs/select-controller-dialog/select-controller-dialog.component';
import { ConfigControllerDialogComponent } from './dialogs/config-controller-dialog/config-controller-dialog.component';
import { LoginComponent } from './pages/login/login.component';
import { environment } from 'src/environments/environment';
import { RegisterComponent } from './pages/register/register.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorPopupComponent } from './dialogs/error-popup/error-popup.component';
import { GuideDialogComponent } from './dialogs/guide-dialog/guide-dialog.component';
import { WindConditionsDialogComponent } from './dialogs/wind-conditions-dialog/wind-conditions-dialog.component';
import { DirectivesModule } from './directives/directives.module';
import { AircraftStateDialogComponent } from './dialogs/aircraft-state-dialog/aircraft-state-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    FlightsimComponent,
    AircraftDialogComponent,
    SelLocationDialogComponent,
    NewLocationDialogComponent,
    EditLocationDialogComponent,
    SelectControllerDialogComponent,
    ConfigControllerDialogComponent,
    LoginComponent,
    RegisterComponent,
    ErrorPopupComponent,
    GuideDialogComponent,
    WindConditionsDialogComponent,
    AircraftStateDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    DirectivesModule,
    // NoopAnimationsModule,
    FormsModule,
    // angularfire2
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    // cesium
    AngularCesiumModule.forRoot(),
    // material
    MatToolbarModule,
    MatButtonModule,
    MatDialogModule,
    DragDropModule,
    MatListModule,
    MatGridListModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatMenuModule,
    MatCheckboxModule,
    MatRadioModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSliderModule,
    MatButtonToggleModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    AircraftDialogComponent,
    SelLocationDialogComponent,
    NewLocationDialogComponent,
    EditLocationDialogComponent,
    SelectControllerDialogComponent,
    ConfigControllerDialogComponent,
    ErrorPopupComponent,
    GuideDialogComponent,
    WindConditionsDialogComponent,
    AircraftStateDialogComponent
  ],
  providers: [
    GamepadService,
    AngularFireAuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
