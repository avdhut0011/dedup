#include "NativeSSDeepModule.h"
#include <fstream>
#include <sstream>

namespace facebook::react {

NativeSSDeepModule::NativeSSDeepModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeSSDeepModuleCxxSpec(std::move(jsInvoker)) {}

std::string NativeSSDeepModule::hashString(jsi::Runtime& rt, std::string input) {
  char result[FUZZY_MAX_RESULT];
  fuzzy_hash_buf((const unsigned char*)input.c_str(), input.length(), result);
  return std::string(result);
}

std::string NativeSSDeepModule::hashFile(jsi::Runtime& rt, std::string filePath) {
  char result[FUZZY_MAX_RESULT];
  if (fuzzy_hash_filename(filePath.c_str(), result) != 0) {
    throw std::runtime_error("Failed to compute file hash");
  }
  return std::string(result);
}

int NativeSSDeepModule::compareHashes(jsi::Runtime& rt, std::string hash1, std::string hash2) {
  return fuzzy_compare(hash1.c_str(), hash2.c_str());
}

} // namespace facebook::react