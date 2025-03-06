package com.nativeapp

import android.os.Environment
import com.facebook.react.bridge.*
import java.io.File
import android.util.Log
import java.sql.SQLException
import com.nativeapp.database.DatabaseHelper
import com.nativeapp.ssdeep.SSDeep

class NativeScannerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "NativeScannerModule"
    }

    @ReactMethod
    fun startInitialScan(promise: Promise) {
        try {
            val scanResults = scanFiles()
            val dbHelper = DatabaseHelper(reactApplicationContext)

            val iterator = scanResults.keySetIterator()
            while (iterator.hasNextKey()) {
                val category = iterator.nextKey()
                val result = scanResults.getMap(category)

                val totalFiles = result?.getInt("totalFiles") ?: 0
                val duplicateFiles = result?.getInt("duplicates") ?: 0

                // Insert into Initial_Scan_Results
                dbHelper.insertInitialScanResult(category, totalFiles, duplicateFiles)
            }

            promise.resolve(scanResults)
        } catch (e: Exception) {
            promise.reject("SCAN_ERROR", "Error scanning files", e)
        }
    }

    private fun scanFiles(): WritableMap {
        val rootDir = Environment.getExternalStorageDirectory().absolutePath + "/Documents"
        val fileCategories = mapOf(
            "text" to listOf(".txt"),
            "pptx" to listOf(".ppt", ".pptx"),
            "documents" to listOf(".docx", ".doc"),
            "audio" to listOf(".mp3", ".wav"),
            "image" to listOf(".jpg", ".png", ".jpeg"),
            "pdfs" to listOf(".pdf"),
            "video" to listOf(".mp4", ".mkv")
        )

        val results = Arguments.createMap()
        for ((category, extensions) in fileCategories) {
            val files = findFilesByExtensions(File(rootDir), extensions)
            val (hashes, duplicates) = processFiles(category, files)

            val categoryData = Arguments.createMap()
            categoryData.putInt("totalFiles", files?.size ?: 0)
            categoryData.putInt("duplicates", duplicates.toArrayList().size)
            categoryData.putArray("duplicateFiles", duplicates)
            categoryData.putArray("files", hashes)

            results.putMap(category, categoryData)
        }
        return results
    }

    private fun findFilesByExtensions(dir: File, extensions: List<String>): List<String> {
        val foundFiles = mutableListOf<String>()
        val files = dir.listFiles() ?: return foundFiles

        for (file in files) {
            if (file.isDirectory) {
                foundFiles.addAll(findFilesByExtensions(file, extensions))
            } else if (extensions.any { file.name.endsWith(it) }) {
                foundFiles.add(file.absolutePath)
            }
        }
        return foundFiles
    }

    private fun processFiles(fileType: String, files: List<String>): Pair<WritableArray, WritableArray> {
        val hashes = Arguments.createArray()
        val duplicates = Arguments.createArray()
        val dbHelper = DatabaseHelper(reactApplicationContext)

        for (filePath in files) {
            try {
                val hash = SSDeep.hashFile(filePath) // Native hashing
                val existingHashes = dbHelper.fetchHashesByType(fileType)
                val similarFiles = SSDeep.compareWithArray(hash, existingHashes.toTypedArray(), 10)
                val file = File(filePath)
                val fileName = file.name
                val fileSize = file.length()

                if (similarFiles.isNotEmpty()) {
                    val duplicateFileId = dbHelper.insertFileRecord(filePath, fileName, fileType, fileSize, hash, isDuplicate = true)
                    for (match in similarFiles) {
                        dbHelper.insertDuplicateRecord(match.fileId.toInt().toLong(), duplicateFileId.toInt().toLong(), match.similarity)
                    }
                    duplicates.pushString(filePath)
                } else {
                    dbHelper.insertFileRecord(filePath, fileName, fileType, fileSize, hash, isDuplicate = false)
                }
                hashes.pushString(filePath)
            } catch (e: SQLException) {
                Log.e("ScannerModule", "Database error: ${e.message}")
            }
        }
        return Pair(hashes, duplicates)
    }
}
