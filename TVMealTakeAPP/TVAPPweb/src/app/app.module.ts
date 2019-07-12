import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { IonicStorageModule } from '@ionic/storage';
import { HttpClientModule } from '@angular/common/http';

import { MyApp } from './app.component';
//import { BasehomePage } from '../pages/basehome/basehome';
import { HttpRequestProvider } from '../providers/http-request/http-request';
import { CommonProvider } from '../providers/common/common';
import { HearbeatProvider } from '../providers/hearbeat/hearbeat';
import { SettimeoutProvider } from '../providers/settimeout/settimeout';

@NgModule({
  declarations: [
    MyApp,
    //BasehomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    HttpClientModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    //BasehomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    HttpRequestProvider,
    CommonProvider,
    HearbeatProvider,
    SettimeoutProvider
  ]
})
export class AppModule {}
