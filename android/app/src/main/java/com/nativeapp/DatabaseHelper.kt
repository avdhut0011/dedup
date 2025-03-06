package com.nativeapp.database

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class DatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        private const val DATABASE_NAME = "FileStorage.db"
        private const val DATABASE_VERSION = 1

        // Table names
        private const val TABLE_FILES = "Files_Record"
        private const val TABLE_DUPLICATES = "Duplicates_Record"
        private const val TABLE_SCAN_RESULTS = "Initial_Scan_Results"
        private const val TABLE_DELETED_DUPLICATES = "deleted_duplicates"

        // Columns for Files_Record
        private const val COLUMN_ID = "id"
        private const val COLUMN_FILE_NAME = "file_name"
        private const val COLUMN_FILE_TYPE = "file_type"
        private const val COLUMN_FILE_PATH = "file_path"
        private const val COLUMN_FILE_SIZE = "file_size"
        private const val COLUMN_FILE_HASH = "file_hash"
        private const val COLUMN_CREATED_AT = "created_at"

        // Columns for Duplicates_Record
        private const val COLUMN_ORIGINAL_FID = "original_fid"
        private const val COLUMN_DUPLICATE_FID = "duplicate_fid"
        private const val COLUMN_SIMILARITY_SCORE = "similarity_score"
        private const val COLUMN_DETECTED_ON = "detected_on"

        // Columns for Initial_Scan_Results
        private const val COLUMN_SCAN_FILE_TYPE = "file_type"
        private const val COLUMN_TOTAL_FILES = "total_files"
        private const val COLUMN_DUPLICATE_FILES = "duplicate_files"
        private const val COLUMN_SCAN_DATE = "scan_date"

        // Columns for Deleted Duplicates
        private const val COLUMN_DELETED_FILE_NAME = "file_name"
        private const val COLUMN_DELETED_FILE_PATH = "file_path"
        private const val COLUMN_DELETED_FILE_SIZE = "file_size_kb"
        private const val COLUMN_DELETED_FILE_CATEGORY = "file_category"
        private const val COLUMN_DELETED_SIMILARITY = "similarity_percentage"
        private const val COLUMN_DELETION_DATE = "deletion_date"
    }

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS $TABLE_FILES (
                $COLUMN_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                $COLUMN_FILE_NAME TEXT NOT NULL,
                $COLUMN_FILE_TYPE TEXT NOT NULL,
                $COLUMN_FILE_PATH TEXT NOT NULL UNIQUE,
                $COLUMN_FILE_SIZE INTEGER NOT NULL,
                $COLUMN_FILE_HASH TEXT NOT NULL,
                $COLUMN_CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        db.execSQL("""
            CREATE TABLE IF NOT EXISTS $TABLE_DUPLICATES (
                $COLUMN_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                $COLUMN_ORIGINAL_FID INTEGER NOT NULL,
                $COLUMN_DUPLICATE_FID INTEGER NOT NULL,
                $COLUMN_SIMILARITY_SCORE INTEGER NOT NULL,
                $COLUMN_DETECTED_ON TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ($COLUMN_ORIGINAL_FID) REFERENCES $TABLE_FILES ($COLUMN_ID),
                FOREIGN KEY ($COLUMN_DUPLICATE_FID) REFERENCES $TABLE_FILES ($COLUMN_ID)
            )
        """)

        db.execSQL("""
            CREATE TABLE IF NOT EXISTS $TABLE_SCAN_RESULTS (
                $COLUMN_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                $COLUMN_SCAN_FILE_TYPE TEXT UNIQUE,
                $COLUMN_TOTAL_FILES INTEGER,
                $COLUMN_DUPLICATE_FILES INTEGER,
                $COLUMN_SCAN_DATE DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        db.execSQL("""
            CREATE TABLE IF NOT EXISTS $TABLE_DELETED_DUPLICATES (
                $COLUMN_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                $COLUMN_DELETED_FILE_NAME TEXT NOT NULL,
                $COLUMN_DELETED_FILE_PATH TEXT NOT NULL,
                $COLUMN_DELETED_FILE_SIZE INTEGER NOT NULL,
                $COLUMN_DELETED_FILE_CATEGORY TEXT,
                $COLUMN_DELETED_SIMILARITY INTEGER,
                $COLUMN_DELETION_DATE DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_FILES")
        db.execSQL("DROP TABLE IF EXISTS $TABLE_DUPLICATES")
        db.execSQL("DROP TABLE IF EXISTS $TABLE_SCAN_RESULTS")
        db.execSQL("DROP TABLE IF EXISTS $TABLE_DELETED_DUPLICATES")
        onCreate(db)
    }

    // Insert a new file record
    fun insertFileRecord(filePath: String, fileName: String, fileType: String, fileSize: Long, fileHash: String, isDuplicate: Boolean): Long {
        val db = this.writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_FILE_PATH, filePath)
            put(COLUMN_FILE_NAME, fileName)
            put(COLUMN_FILE_TYPE, fileType)
            put(COLUMN_FILE_SIZE, fileSize)
            put(COLUMN_FILE_HASH, fileHash)
        }

        val result = db.insertWithOnConflict(TABLE_FILES, null, values, SQLiteDatabase.CONFLICT_IGNORE)
        db.close()
        return result  // Returns row ID or -1 if duplicate
    }

    // Fetch hash values by file type
    fun fetchHashesByType(fileType: String): List<String> {
        val db = this.readableDatabase
        val hashes = mutableListOf<String>()
        val cursor = db.rawQuery("SELECT $COLUMN_FILE_HASH FROM $TABLE_FILES WHERE $COLUMN_FILE_TYPE = ?", arrayOf(fileType))

        while (cursor.moveToNext()) {
            hashes.add(cursor.getString(0))
        }

        cursor.close()
        db.close()
        return hashes
    }

    // Insert duplicate file record
    fun insertDuplicateRecord(originalFileId: Long, duplicateFileId: Long, similarityScore: Int): Long {
        val db = this.writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_ORIGINAL_FID, originalFileId)
            put(COLUMN_DUPLICATE_FID, duplicateFileId)
            put(COLUMN_SIMILARITY_SCORE, similarityScore)
        }

        val result = db.insert(TABLE_DUPLICATES, null, values)
        db.close()
        return result
    }

    // Insert Initial Scan Results
    fun insertInitialScanResult(fileType: String, totalFiles: Int, duplicateFiles: Int): Long {
        val db = this.writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_SCAN_FILE_TYPE, fileType)
            put(COLUMN_TOTAL_FILES, totalFiles)
            put(COLUMN_DUPLICATE_FILES, duplicateFiles)
        }

        val result = db.insertWithOnConflict(TABLE_SCAN_RESULTS, null, values, SQLiteDatabase.CONFLICT_REPLACE)
        db.close()
        return result
    }

    // Insert Deleted Duplicate Record
    fun insertDeletedDuplicate(fileName: String, filePath: String, fileSize: Long, fileCategory: String?, similarityPercentage: Int): Long {
        val db = this.writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_DELETED_FILE_NAME, fileName)
            put(COLUMN_DELETED_FILE_PATH, filePath)
            put(COLUMN_DELETED_FILE_SIZE, fileSize)
            put(COLUMN_DELETED_FILE_CATEGORY, fileCategory)
            put(COLUMN_DELETED_SIMILARITY, similarityPercentage)
        }

        val result = db.insert(TABLE_DELETED_DUPLICATES, null, values)
        db.close()
        return result
    }
}
