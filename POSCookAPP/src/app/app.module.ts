import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';
import { NativeAudio } from '@ionic-native/native-audio';
import { Device } from '@ionic-native/device';
import { AppVersion } from '@ionic-native/app-version';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Clipboard } from '@ionic-native/clipboard';


import { CommonProvider } from '../providers/common/common';


import { HearbeatProvider } from '../providers/hearbeat/hearbeat';

import { AudioPlayProvider } from '../providers/audio-play/audio-play';
import { HttpRequestProvider } from '../providers/http-request/http-request';
import { UpdateProvider } from '../providers/update/update';
import { ComponentsModule } from '../components/components.module';
import { SettimeoutProvider } from '../providers/settimeout/settimeout';



@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    IonicModule.forRoot(MyApp,{
      // backButtonText: '返回首页',
      // backButtonIcon: 'ios-arrow-back',
      // mode: 'ios'
    }),
    IonicStorageModule.forRoot(),
    ComponentsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    AppVersion,Clipboard,
    FileTransfer, FileTransferObject ,
    File,FileOpener,InAppBrowser,Diagnostic,
    Device,
    NativeAudio,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    CommonProvider,
    AudioPlayProvider,
    HttpRequestProvider,
    UpdateProvider,
    
    HearbeatProvider,
    
    SettimeoutProvider,
  ]
})
export class AppModule {}
