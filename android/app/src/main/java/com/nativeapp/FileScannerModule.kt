package com.nativeapp

import android.os.Environment
import android.util.Log
import com.facebook.react.bridge.*
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.concurrent.Executors

class FileScannerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val executorService = Executors.newFixedThreadPool(5) // Multi-threading

    override fun getName(): String {
        return "FileScannerModule"
    }

    @ReactMethod
    fun scanFiles(promise: Promise) {
        executorService.execute {
            try {
                val rootDir = Environment.getExternalStorageDirectory()
                val ignoredDirs = listOf(
                    "com.", "cn.", ".cache", "cache", ".temp", ".thumbnails", 
                    "MIUI", "LOST.DIR", "Recycle.Bin", "data", "Notifications", 
                    "Ringtones", "obb", "DCIM/.thumbnails"
                )

                val fileCategories = mapOf(
                    "text" to listOf(".txt"),
                    "pptx" to listOf(".ppt", ".pptx"),
                    "documents" to listOf(".docx", ".doc"),
                    "audio" to listOf(".mp3", ".wav"),
                    "image" to listOf(".jpg", ".png", ".jpeg"),
                    "pdfs" to listOf(".pdf"),
                    "video" to listOf(".mp4", ".mkv")
                )

                val filesList = scanDirectory(rootDir, ignoredDirs, fileCategories)
                promise.resolve(filesList.toString())
            } catch (e: Exception) {
                promise.reject("SCAN_ERROR", "Error scanning files: ${e.message}")
            }
        }
    }

    private fun scanDirectory(dir: File, ignoredDirs: List<String>, fileCategories: Map<String, List<String>>): JSONArray {
    val filesArray = JSONArray()
    if (!dir.exists() || !dir.isDirectory) return filesArray

    val files = dir.listFiles() ?: return filesArray

    for (file in files) {
        try {
            if (file.isDirectory) {
                if (ignoredDirs.any { file.name.startsWith(it) }) continue // Skip ignored directories
                
                // 🔹 FIX: Instead of adding a nested array, append each item individually
                val subDirFiles = scanDirectory(file, ignoredDirs, fileCategories)
                for (i in 0 until subDirFiles.length()) {
                    filesArray.put(subDirFiles.getJSONObject(i))
                }
            } else {
                val fileExt = file.name.substringAfterLast('.', "").lowercase()
                val category = fileCategories.entries.find { it.value.contains(".$fileExt") }?.key

                if (category != null) {
                    val fileObject = JSONObject().apply {
                        put("name", file.name)
                        put("path", file.absolutePath)
                        put("sizeKB", file.length() / 1024)
                        put("category", category)
                    }
                    filesArray.put(fileObject)
                }
            }
        } catch (e: Exception) {
            Log.e("FileScannerModule", "Error processing file: ${file.absolutePath}", e)
        }
    }
    return filesArray
}
}