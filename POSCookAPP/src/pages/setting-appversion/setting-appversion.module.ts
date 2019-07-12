import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingAppversionPage } from './setting-appversion';
import { ComponentsModule } from '../../components/components.module';

// import {QrcodeComponent} from "../../components/qrcode/qrcode";
@NgModule({
  declarations: [
    //QrcodeComponent,
    SettingAppversionPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingAppversionPage),
    ComponentsModule
  ],
})
export class SettingAppversionPageModule {}
