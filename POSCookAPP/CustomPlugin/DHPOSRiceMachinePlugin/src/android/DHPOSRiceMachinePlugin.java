package com.esquel.dininghall.usbpl2303;

import android.app.Activity;
import android.content.Context;
import android.hardware.usb.UsbManager;
import android.os.Handler;
import android.text.format.Time;
import android.util.Log;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

import tw.com.prolific.driver.pl2303.PL2303Driver;

public class DHPOSRiceMachinePlugin extends CordovaPlugin {
  String TAG = "DHPOSRiceMachinePlugin_APLog";
  public Activity _activity;

  PL2303Driver mSerial;
  int quee=0;

  private PL2303Driver.BaudRate mBaudrate = PL2303Driver.BaudRate.B4800;//波特率
  private PL2303Driver.DataBits mDataBits = PL2303Driver.DataBits.D8;//数据位
  private PL2303Driver.Parity mParity = PL2303Driver.Parity.NONE;//效验位
  private PL2303Driver.StopBits mStopBits = PL2303Driver.StopBits.S1;//停止位
  private PL2303Driver.FlowControl mFlowControl = PL2303Driver.FlowControl.OFF;
  private static final String ACTION_USB_PERMISSION = "com.esquel.dininghall.usbpl2303.USB_PERMISSION";


  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    if (action.equals("Test")) {
      String message = args.getString(0);
      this.Test(message, callbackContext);
      return true;
    }else if (action.equals("Open")) {
      this.Open(callbackContext);
      return true;
    }else if (action.equals("SendCommon")) {
      String message = args.getString(0);
      this.SendCommon(message,callbackContext);
      return true;
    }

    return false;
  }
  private Activity getActivity(){
    if(this._activity==null) this._activity=cordova.getActivity();
    return this._activity;
  }
  String ByteToStr(int byteSize, byte[] in) {
    String ret = new String("");
    if (in.length < byteSize)
      return ret;

    for (int i = 0; i < byteSize; i++) {
      ret = ret.concat(String.format("%1$02X ", in[i]));
    }
    return ret;
  }

  private void Test(String message, CallbackContext callbackContext) {
    if (message != null && message.length() > 0) {
      callbackContext.success("return:" + message);
    } else {
      callbackContext.error(ReturnValue(0,"Expected one non-empty string argument.",null));
    }
  }

  private void Open(final CallbackContext callbackContext) {
    if(mSerial == null) {
      UsbManager usbManager = (UsbManager) getActivity().getSystemService(Context.USB_SERVICE);
      mSerial = new PL2303Driver(usbManager, getActivity(), ACTION_USB_PERMISSION);
    }
    // check USB host function.
    if (!mSerial.PL2303USBFeatureSupported()) {
      mSerial = null;
      callbackContext.error(ReturnValue(0,"No Support USB host API",null));//"No Support USB host API"
      return;
    }

    if(!mSerial.isConnected()) {
      if( !mSerial.enumerate() ) {
        callbackContext.error(ReturnValue(1,"No more devices found.",null));
        return;
      } else {
        Log.d(TAG, "enumerate succeeded!");
      }
    }//if isConnected

    Handler handler = new Handler();
    handler.postDelayed(new Runnable() {
      @Override
      public void run() {
        int res = 0;
        try {
          res = mSerial.setup(mBaudrate, mDataBits, mStopBits, mParity, mFlowControl);
        } catch (IOException e) {
          e.printStackTrace();
        }

        if( res<0 ) {
          callbackContext.error(ReturnValue(2,"Fail to setup",null));
          return;
        }

        if (mSerial.isConnected()) {
          callbackContext.success("connected");
          return;
        }
        callbackContext.error(ReturnValue(3,"Cannot connect",null));

      }
    }, 1000);


  }
  private void SendCommon(String message, CallbackContext callbackContext) {
    Log.d(TAG, "Enter writeDataToSerial");

    if(null==mSerial) {

      callbackContext.error(ReturnValue(1,"No more devices found..",null));
      return;
    }

    if(!mSerial.isConnected()){
      if( !mSerial.enumerate() ) {
        callbackContext.error(ReturnValue(1,"No more devices found...",null));
        return;
      } else {
        Log.d(TAG, "enumerate succeeded!");
      }
      return;
    }

		/*
					1个字节起始码：0x02
					1个字节数据长度：数据+校验=0x07
					6个字节的数据
					   命令字:0x01, 占1字节。
					   状态：0x01刷卡成功，0x02刷卡失败，占1字节
					   时分秒：压缩bcd码，占3字节
					   序号：pos维护，每发一次自动加1 占1字节
					1个字节的校验位（校验和）只针对数据字节算数据区的6字节数据累加（只取低字节）

					例子：
					02 07 01 01 14 15 01 00 2C

					* */
    Time now=new Time();//Time("GMT+8");
    now.setToNow();
    byte[] dataSend=new byte[9];
    dataSend[0]=0x02;//1个字节起始码：0x02
    dataSend[1]=0x07;//1个字节数据长度：数据+校验=0x07
    dataSend[2]=0x01;//6个字节的数据,命令字:0x01, 占1字节。
    dataSend[3]=0x01;//状态：0x01刷卡成功，0x02刷卡失败，占1字节
    dataSend[4]=(byte)now.hour;//时分秒：压缩bcd码，占3字节
    dataSend[5]=(byte)now.minute;
    dataSend[6]=(byte)now.second;
    dataSend[7]=(byte)quee++;//序号：pos维护，每发一次自动加1 占1字节
    dataSend[8]=(byte)(dataSend[2]+dataSend[3]+dataSend[4]+dataSend[5]+dataSend[6]+dataSend[7]);


    Log.d(TAG, "PL2303Driver Write 2(" + dataSend.length + ") : " + ByteToStr(dataSend.length,dataSend));

    int res = mSerial.write(dataSend, dataSend.length);
    if( res<0 ) {
      callbackContext.error(ReturnValue(4,"Fail to write",res));
      return;
    }

    if(quee>255) quee=0;

    callbackContext.success(ReturnValue(0,"success",ByteToStr(dataSend.length,dataSend)));

    Log.d(TAG, "Leave writeDataToSerial");

  }
  JSONObject ReturnValue( int code,String msg,Object data){
        /* erroCode
            0,No Support USB host API
            1,no more devices found
            2,fail to setup
            3,cannot connect
            4,Fail to write
         */
    JSONObject re=new JSONObject();
    try {
      re.put("code", code);
      re.put("msg", msg);
      re.put("data", data);
    }catch (Exception e){

    }
    return  re;
  }
}
