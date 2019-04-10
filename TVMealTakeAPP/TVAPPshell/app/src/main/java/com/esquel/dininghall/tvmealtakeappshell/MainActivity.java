package com.esquel.dininghall.tvmealtakeappshell;

import android.app.Activity;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.os.Handler;
import android.provider.Settings;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.TextUtils;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

public class MainActivity extends AppCompatActivity {

    static final String TVURL ="http://192.168.99.28:5588/TVMealTakeHome";

    static long LastTouchPageTS=0;
    static String UUID;

    WebView webView;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if(this.getResources().getConfiguration().orientation==Configuration.ORIENTATION_PORTRAIT){
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        }
        GetUUID();
        setContentView(R.layout.activity_main);
        this.webView=(WebView)findViewById(R.id.webview1);
        setWebView();

        loadPage();
        handler.postDelayed(runnable, 5000);

    }

    void GetUUID(){
        SharedPreferences sp = getSharedPreferences("SP_UUID",Activity.MODE_PRIVATE);
        UUID =sp.getString("uuid","");
        if(TextUtils.isEmpty(UUID)) {
            UUID = Settings.Secure.getString(MainActivity.this.getContentResolver(), Settings.Secure.ANDROID_ID);

            //if(TextUtils.isEmpty(UUID)){
            //    UUID =Build.SERIAL;
            //}
            if (TextUtils.isEmpty(UUID)) {
                UUID = GetRandomStr(12);
            }

            UUID = UUID.toLowerCase();
            //Toast.makeText(getApplicationContext(), UUID, Toast.LENGTH_LONG).show();
            SharedPreferences.Editor editor=sp.edit();
            editor.putString("uuid",UUID);
            editor.commit();
        }
        Toast.makeText(getApplicationContext(),"设备UUID为: "+UUID,Toast.LENGTH_LONG).show();
    }

    String GetRandomStr(Integer len) {
        String chars = "abcdefhijkmnprstwxyz2345678";
        int maxPos = chars.length();
        String pwd = "";
        for (int i = 0; i < len; i++) {
            pwd += chars.charAt((int)Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }

    void setWebView(){
        //webView.setBackgroundColor(ContextCompat.getColor(this,android.R.color.transparent));
        //webView.setBackgroundResource(R.drawable.ic_launcher_foreground);

        webView.getSettings().setJavaScriptEnabled(true);
        //webView.getSettings().setAppCacheEnabled(false);
        webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.getSettings().setLoadsImagesAutomatically(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setUserAgentString("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36");
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        webView.getSettings().setLoadWithOverviewMode(true);
        webView.getSettings().setUseWideViewPort(true);
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url,Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
            }
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
            }
        });
        webView.addJavascriptInterface(new Object(){
            @JavascriptInterface
            public void setOnPresent() {

            }
            @JavascriptInterface
            public void close(String sessId) {

            }
            @JavascriptInterface
            public void postMessage(String sessId, String msg) {

            }

            @JavascriptInterface
            public void refresh(){
               MainActivity.this.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try{
                            Toast.makeText(getApplicationContext(),"开始刷新页面...",Toast.LENGTH_SHORT).show();
                            loadPage();
                        }catch (Exception e){
                            Toast.makeText(getApplicationContext(),e.getMessage(),Toast.LENGTH_LONG).show();
                        }
                    }
                });





            }
        }, "android");

        //设置本地调用对象及其接口
        //webView.addJavascriptInterface(this, "android");
    }



    public void loadPage(){
        setCurrentTS();
        this.webView.clearCache(true);
        this.webView.loadUrl(TVURL+"?uuid="+UUID+"&t="+System.currentTimeMillis());

    }


    Handler handler = new Handler();
    Runnable runnable = new Runnable() {
        @Override
        public void run() {
            touchPage();
            handler.postDelayed(this, 5000);
        }
    };

    @Override
    protected void onResume() {
        super.onResume();
        handler.removeCallbacks(runnable);
        handler.postDelayed(runnable, 5000);
    }

    @Override
    protected void onPause() {
        super.onPause();
        handler.removeCallbacks(runnable);
    }

    @Override
    protected void onStop() {
        handler.removeCallbacks(runnable);
        super.onStop();
    }

    void setCurrentTS(){
        LastTouchPageTS=System.currentTimeMillis();
    }
    void touchPage(){
        String jsfun = "window['TVHomePage']._TouchPage();";
        this.webView.evaluateJavascript(jsfun, new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String res) {
                //Toast.makeText(getApplicationContext(),"_TouchPage:"+res,Toast.LENGTH_SHORT).show();
                if(res.equals("1")){
                    setCurrentTS();
                }
            }
        });
       long ts= System.currentTimeMillis();
       if(ts-LastTouchPageTS>30000){
           Toast.makeText(getApplicationContext(),"页面已30秒未响应，开始重新加载...",Toast.LENGTH_SHORT).show();
           this.loadPage();
       }
    }

}
