package com.nativeapp.modules;

import android.os.FileObserver;
import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import com.facebook.react.bridge.Promise;
import android.os.Environment;

public class DirectoryMonitorModule extends ReactContextBaseJavaModule {
    private static final String TAG = "DirectoryMonitor";
    private final Map<String, FileObserver> fileObservers = new HashMap<>();

    public DirectoryMonitorModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "DirectoryMonitor";
    }

    @ReactMethod
    public void startMonitoring(String directoryPath) {
        stopMonitoring(directoryPath); // Ensure no duplicate monitoring for the same path

        File directory = new File(directoryPath);
        if (!directory.exists() || !directory.isDirectory()) {
            Log.e(TAG, "Invalid directory path: " + directoryPath);
            return;
        }

        monitorDirectoryTree(directoryPath);
    }

    @ReactMethod
    public void stopMonitoring(String directoryPath) {
        FileObserver observer = fileObservers.remove(directoryPath);
        if (observer != null) {
            observer.stopWatching();
            Log.d(TAG, "Stopped monitoring: " + directoryPath);
        }
    }

    @ReactMethod
    public void stopAllMonitoring() {
        for (Map.Entry<String, FileObserver> entry : fileObservers.entrySet()) {
            entry.getValue().stopWatching();
            Log.d(TAG, "Stopped monitoring: " + entry.getKey());
        }
        fileObservers.clear();
        Log.d(TAG, "Stopped all monitoring.");
    }

    private void monitorDirectoryTree(String directoryPath) {
        File root = new File(directoryPath);
        createFileObserver(directoryPath); // Pass the directory path as a string
    
        // Traverse subdirectories
        File[] subDirs = root.listFiles(File::isDirectory);
        if (subDirs != null) {
            for (File subDir : subDirs) {
                monitorDirectoryTree(subDir.getAbsolutePath()); // Recursively monitor subdirectories
            }
        }
    }

    private void createFileObserver(String path) {
        if (fileObservers.containsKey(path)) return; // Avoid duplicate monitoring

        FileObserver observer = new FileObserver(path, FileObserver.ALL_EVENTS) {
            @Override
            public void onEvent(int event, String fileName) {
                if (fileName == null) return;

                String eventType = "";
                switch (event) {
                    case FileObserver.CREATE:
                        eventType = "CREATE";
                        break;
                    case FileObserver.DELETE:
                        eventType = "DELETE";
                        break;
                    case FileObserver.MODIFY:
                        eventType = "MODIFY";
                        break;
                    case FileObserver.MOVED_FROM:
                        eventType = "MOVED_FROM";
                        break;
                    case FileObserver.MOVED_TO:
                        eventType = "MOVED_TO";
                        break;
                }

                if (!eventType.isEmpty()) {
                    String filePath = path + "/" + fileName;
                    sendEvent(eventType, filePath);

                    // If a new directory is created, monitor it recursively
                    if (eventType.equals("CREATE") && new File(filePath).isDirectory()) {
                        monitorDirectoryTree(filePath);
                    }
                }
            }
        };

        observer.startWatching();
        fileObservers.put(path, observer);
        Log.d(TAG, "Started monitoring: " + path);
    }

    private void sendEvent(String eventType, String filePath) {
        if (getReactApplicationContext().hasActiveCatalystInstance()) {
            getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("FileChangeEvent", eventType + ":" + filePath);
        }
    }

    @ReactMethod
    public void getAvailableDirectories(Promise promise) {
        try {
            Map<String, String> directories = new HashMap<>();
            // directories.put("Downloads", Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getAbsolutePath());
            // directories.put("Documents", Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS).getAbsolutePath());
            // directories.put("Pictures", Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES).getAbsolutePath());
            // directories.put("Music", Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MUSIC).getAbsolutePath());
            // directories.put("Movies", Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES).getAbsolutePath());

            File downloads = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            File documents = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
            File pictures = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES);
            File music = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MUSIC);
            File movies = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES);

            if (downloads.exists()) directories.put("Downloads", downloads.getAbsolutePath());
            if (documents.exists()) directories.put("Documents", documents.getAbsolutePath());
            if (pictures.exists()) directories.put("Pictures", pictures.getAbsolutePath());
            if (music.exists()) directories.put("Music", music.getAbsolutePath());
            if (movies.exists()) directories.put("Movies", movies.getAbsolutePath());


            promise.resolve(new org.json.JSONObject(directories).toString());
            // promise.resolve(directories);
        } catch (Exception e) {
            promise.reject("Error", e.getMessage());
        }
    }
}