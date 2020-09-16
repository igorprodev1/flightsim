import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VariableEditorDirective } from './variable-editor.directive';
import { FormsModule } from '@angular/forms';
import { MatInputModule, MatSelectModule, MatTooltipModule } from '@angular/material';



@NgModule({
  declarations: [VariableEditorDirective],
  // schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  imports: [
    CommonModule,
    // BrowserModule,
    // AppRoutingModule,
    // BrowserAnimationsModule,
    // HttpClientModule,
    // NoopAnimationsModule,
    FormsModule,

    // material
    MatInputModule,
    MatSelectModule,
    MatTooltipModule
  ],
  exports: [
    VariableEditorDirective
  ],
  
})
export class DirectivesModule { }
