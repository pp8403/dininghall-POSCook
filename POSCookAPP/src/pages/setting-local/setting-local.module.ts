import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingLocalPage } from './setting-local';

@NgModule({
  declarations: [
    SettingLocalPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingLocalPage),
  ],
})
export class SettingLocalPageModule {}
