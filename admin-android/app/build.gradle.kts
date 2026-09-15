plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }

android {
    namespace = "com.securityvision.admin"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.securityvision.admin"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
        buildConfigField("String", "ADMIN_URL", "\"${project.findProperty("ADMIN_URL") ?: "https://YOUR-PRODUCTION-DOMAIN.example/sv-control-7f3a9d/"}\"")
    }
    buildFeatures { buildConfig = true }
}
