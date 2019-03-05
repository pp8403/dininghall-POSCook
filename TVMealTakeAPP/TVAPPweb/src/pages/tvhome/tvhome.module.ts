import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TvhomePage } from './tvhome';

@NgModule({
  declarations: [
    TvhomePage,
  ],
  imports: [
    IonicPageModule.forChild(TvhomePage),
  ],
})
export class TvhomePageModule {}
