import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingRemotePage } from './setting-remote';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    SettingRemotePage,
  ],
  imports: [
    PipesModule,
    IonicPageModule.forChild(SettingRemotePage),
  ],
})
export class SettingRemotePageModule {}
