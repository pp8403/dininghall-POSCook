import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NomealPage } from './nomeal';

@NgModule({
  declarations: [
    NomealPage,
  ],
  imports: [
    IonicPageModule.forChild(NomealPage),
  ],
})
export class NomealPageModule {}
