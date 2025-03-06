package com.nativeapp.ssdeep
object SSDeep {
    init {
        System.loadLibrary("fuzzy") // Ensure libfuzzy.so is loaded
    }
    external fun hashFile(filePath: String): String
    external fun compare(hash1: String, hash2: String): Int
    external fun compareWithArray(hash: String, hashes: Array<String>, threshold: Int): List<SimilarFile>
    data class SimilarFile(val fileId: Int, val similarity: Int)
}