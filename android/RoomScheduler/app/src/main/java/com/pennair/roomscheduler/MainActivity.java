package com.pennair.roomscheduler;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.net.Uri;

public class MainActivity extends AppCompatActivity {


    private static String webview_url   = "https://roomscheduler-pennair.msappproxy.net";    // web address or local file location you want to open in webview

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        WebView myWebView;
        myWebView = (WebView) findViewById(R.id.webView);

        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAppCacheEnabled(true);
        webSettings.setSupportZoom(false);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setSupportMultipleWindows(true);
        webSettings.setLoadWithOverviewMode(true);

        myWebView.loadUrl(webview_url);



        final Handler handler = new Handler();
        final int delay = 900000; // 1000 milliseconds == 1 second    (900000) 15min
        handler.postDelayed(new Runnable() {
            public void run() {

                myWebView.loadUrl("javascript:(function(){" +
                        "location.reload();"+
                        "})()");

                handler.postDelayed(this, delay);
            }
        }, delay);


        myWebView.setWebViewClient(new WebViewClient() {

            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
//                myWebView.loadUrl("file:///android_asset/noConnection.html");

                myWebView.loadUrl(webview_url);
            }

            public boolean shouldOverrideUrlLoading(WebView paramAnonymousWebView, String paramAnonymousString) {
                StringBuilder localStringBuilder = new StringBuilder();
                localStringBuilder.append(paramAnonymousString);
                Log.v("browser", localStringBuilder.toString());

                if ((paramAnonymousString != null) && (!paramAnonymousString.startsWith(webview_url)) && ((paramAnonymousString.startsWith("http://")) || (paramAnonymousString.startsWith("https://")))) {
                    paramAnonymousWebView.getContext().startActivity(new Intent("android.intent.action.VIEW", Uri.parse(paramAnonymousString)));
                    return true;
                } else if (paramAnonymousString.startsWith("mailto:")) {
                    paramAnonymousWebView.getContext().startActivity(new Intent(Intent.ACTION_SENDTO, Uri.parse(paramAnonymousString)));
                    return true;
                } else if (paramAnonymousString.startsWith("tel:")) {
                    paramAnonymousWebView.getContext().startActivity(new Intent(Intent.ACTION_DIAL, Uri.parse(paramAnonymousString)));
                    return true;
                } else if (paramAnonymousString.startsWith("sms:")) {
                    paramAnonymousWebView.getContext().startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(paramAnonymousString)));
                    return true;
                }
                return false;
            }
        });


    }
}