package com.esquel.dininghall.secondscreen;


import android.app.Activity;
import android.content.Context;
import android.hardware.display.DisplayManager;
import android.os.Handler;
import android.view.Display;
import android.view.WindowManager;
import android.widget.Toast;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * This class echoes a string called from JavaScript.
 */
public class DHPOSSecScreenPlugin extends CordovaPlugin {

    SecondScreenPresentation  lastDisplayPresentation;
    private Activity _activity;
    Display[]  displays;//屏幕数组
    CallbackContext StartSecScreenCallbackContext;
    String _url;String _receiveMsgFun;

    private Activity getActivity(){
        if(this._activity==null) this._activity=cordova.getActivity();
        return this._activity;
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("Test")) {
            String message = args.getString(0);
            this.Test(message, callbackContext);
            return true;
        }else if (action.equals("GetScreenCount")) {
            this.GetScreenCount(callbackContext);
            return true;
        }else if (action.equals("StartSecScreen")) {
            String url = args.getString(0);
            String receiveMsgFun=args.getString(1);
            this.StartSecScreen(url,receiveMsgFun,callbackContext);
            return true;
        }else if (action.equals("SendMsg")) {
            String msg = args.getString(0);
            this.SendMsg(msg,callbackContext);
            return true;
        }else if (action.equals("Close")) {
            CloseSecondScreen();

            return true;
        }
        return false;
    }

    private void CloseSecondScreen(){
        if (lastDisplayPresentation != null) {
            lastDisplayPresentation.dismiss();
            lastDisplayPresentation = null;
        }
    }
    private void Test(String message, CallbackContext callbackContext) {
        if (message != null && message.length() > 0) {
            callbackContext.success("return:" + message);
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }

    private void GetScreenCount(CallbackContext callbackContext) {
        DisplayManager mDisplayManager = (DisplayManager)getActivity().getSystemService(Context.DISPLAY_SERVICE);
        this.displays =mDisplayManager.getDisplays();
        callbackContext.success(this.displays.length);
    }
    private void StartSecScreen(String url,String receiveMsgFun,CallbackContext callbackContext) {
        this.StartSecScreenCallbackContext=callbackContext;
        DisplayManager mDisplayManager;//屏幕管理类
        this._url=url;
        this._receiveMsgFun=receiveMsgFun;

        mDisplayManager = (DisplayManager)getActivity().getSystemService(Context.DISPLAY_SERVICE);
        this.displays =mDisplayManager.getDisplays();

        if(displays.length<2){
            callbackContext.error("未检测到副屏:display count=" + displays.length);
            return;
        }
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {

                //mSecondScreen =new SecondScreenPresentation (getActivity(),displays[1],_url,_receiveMsgFun);//displays[1]是副屏
                //mSecondScreen.getWindow().setType(WindowManager.LayoutParams.TYPE_SYSTEM_ALERT);
                //mSecondScreen.show();

                new Handler().postDelayed(new Runnable() {
                    @Override
                    public void run() {

                        final SecondScreenPresentation mSecondScreen =new SecondScreenPresentation (getActivity(),displays[1],_url,_receiveMsgFun);//displays[1]是副屏

                        mSecondScreen.show();
                        StartSecScreenCallbackContext.success("已开启副屏显示!");
                        //延时取消，否则会闪动
                        new Handler().postDelayed(new Runnable() {
                            @Override
                            public void run() {
                                CloseSecondScreen();
                                lastDisplayPresentation = mSecondScreen;
                            }
                        }, 100);


                    }
                }, 100);


            }
        });

    }


    private void SendMsg(String msg,CallbackContext callbackContext) {

        if(displays.length<2 || lastDisplayPresentation==null){
            callbackContext.error("未检测到副屏。");
            return;
        }

        final String _msg=msg;

        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                lastDisplayPresentation.ReceiveMsg(_msg);
            }
        });

    }
}
