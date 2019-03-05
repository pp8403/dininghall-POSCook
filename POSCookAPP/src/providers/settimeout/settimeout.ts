import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  主要用于有业务上的timeout处理，统一管理
*/
@Injectable()
export class SettimeoutProvider {
  //private setTimeoutValue = null;
  private commonkey=Symbol();

  private mapThread=new Map();
  
  constructor(public http: HttpClient) {
    
  }
  regAction(action:any,timeout){
    // clearTimeout(this.setTimeoutValue);
    // this.setTimeoutValue=setTimeout(action, timeout);
    this.regActionSingle(this.commonkey,action,timeout);
  }
  clear(){
    //clearTimeout(this.setTimeoutValue);
    this.clearSingle(this.commonkey);
  }

  regActionSingle(key:any,action:any,timeout){
    clearTimeout(this.mapThread.get(key));
    let t=setTimeout(action, timeout);
    this.mapThread.set(key,t);
  }

  clearSingle(key:any){
    clearTimeout(this.mapThread.get(key));
  }
}
