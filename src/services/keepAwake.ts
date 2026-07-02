export function activateKeepAwake() {
  // Disabled because the old react-native-keep-awake package uses jcenter()
  // and breaks modern Gradle builds.
  //
  // The reader setting can stay in the UI. Later, implement this with a small
  // Android native module using FLAG_KEEP_SCREEN_ON if needed.
}

export function deactivateKeepAwake() {
  // No-op.
}
