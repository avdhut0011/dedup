#include <jni.h>
#include <string>
#include "fuzzy.h" // Include ssdeep header

extern "C"
JNIEXPORT jstring JNICALL
Java_com_nativeapp_ssdeep_SSDeep_hashFile(JNIEnv *env, jclass clazz, jstring filePath) {
    const char *path = env->GetStringUTFChars(filePath, nullptr);
    
    char result[FUZZY_MAX_RESULT];
    if (fuzzy_hash_filename(path, result) != 0) {
        env->ReleaseStringUTFChars(filePath, path);
        return env->NewStringUTF("");
    }

    env->ReleaseStringUTFChars(filePath, path);
    return env->NewStringUTF(result);
}

extern "C"
JNIEXPORT jint JNICALL
Java_com_nativeapp_ssdeep_SSDeep_compare(JNIEnv *env, jclass clazz, jstring hash1, jstring hash2) {
    const char *h1 = env->GetStringUTFChars(hash1, nullptr);
    const char *h2 = env->GetStringUTFChars(hash2, nullptr);
    
    int similarity = fuzzy_compare(h1, h2);

    env->ReleaseStringUTFChars(hash1, h1);
    env->ReleaseStringUTFChars(hash2, h2);
    
    return similarity;
}
