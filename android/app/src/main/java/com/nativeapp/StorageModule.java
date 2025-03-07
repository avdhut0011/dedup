package com.nativeapp.modules;

import android.os.Environment;
import android.os.StatFs;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.MediaStore;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import org.json.JSONObject;
import java.io.File;

public class StorageModule extends ReactContextBaseJavaModule {

    public StorageModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "StorageModule";
    }

    @ReactMethod
    public void getStorageStats(Promise promise) {
        try {
            JSONObject storageData = new JSONObject();

            // Get internal storage stats
            File internalStorage = Environment.getDataDirectory();
            StatFs stat = new StatFs(internalStorage.getPath());
            long totalBytes = (long) stat.getBlockSizeLong() * stat.getBlockCountLong();
            long availableBytes = (long) stat.getBlockSizeLong() * stat.getAvailableBlocksLong();
            long usedBytes = totalBytes - availableBytes;

            storageData.put("totalStorage", totalBytes);
            storageData.put("usedStorage", usedBytes);
            storageData.put("freeStorage", availableBytes);

            // Get categorized file sizes
            storageData.put("images", getMediaSize(MediaStore.Images.Media.EXTERNAL_CONTENT_URI));
            storageData.put("videos", getMediaSize(MediaStore.Video.Media.EXTERNAL_CONTENT_URI));
            storageData.put("audios", getMediaSize(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI));
            storageData.put("documents", getDocumentsSize());
            storageData.put("apks", getApkSize());

            promise.resolve(storageData.toString());
        } catch (Exception e) {
            promise.reject("ERROR", e);
        }
    }

    private long getMediaSize(Uri uri) {
        Cursor cursor = getReactApplicationContext().getContentResolver().query(
                uri, new String[]{MediaStore.MediaColumns.SIZE}, null, null, null);
        long totalSize = 0;
        if (cursor != null) {
            while (cursor.moveToNext()) {
                totalSize += cursor.getLong(0);
            }
            cursor.close();
        }
        return totalSize;
    }

    private long getDocumentsSize() {
        Uri uri = MediaStore.Files.getContentUri("external");
        String selection = MediaStore.Files.FileColumns.MIME_TYPE + " IN ('application/pdf', 'application/msword', 'application/vnd.ms-excel')";
        return getMediaSize(uri, selection);
    }

    private long getApkSize() {
        Uri uri = MediaStore.Files.getContentUri("external");
        String selection = MediaStore.Files.FileColumns.MIME_TYPE + " = 'application/vnd.android.package-archive'";
        return getMediaSize(uri, selection);
    }

    private long getMediaSize(Uri uri, String selection) {
        Cursor cursor = getReactApplicationContext().getContentResolver().query(
                uri, new String[]{MediaStore.MediaColumns.SIZE}, selection, null, null);
        long totalSize = 0;
        if (cursor != null) {
            while (cursor.moveToNext()) {
                totalSize += cursor.getLong(0);
            }
            cursor.close();
        }
        return totalSize;
    }
}
