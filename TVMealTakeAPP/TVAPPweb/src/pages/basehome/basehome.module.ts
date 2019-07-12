import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BasehomePage } from './basehome';

@NgModule({
  declarations: [
    BasehomePage,
  ],
  imports: [
    IonicPageModule.forChild(BasehomePage),
  ],
})
export class BasehomePageModule {}
