package com.md.journeyTracker;

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen // Import as a companion object

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Handle the splash screen transition.
        installSplashScreen() // Add this line
        super.onCreate(savedInstanceState)
        // Additional setup if needed, e.g., setKeepOnScreenCondition
        // val splashScreen = installSplashScreen()
        // splashScreen.setKeepOnScreenCondition {
        //     // Return true while your app is loading, false when ready
        //     false // Example: false to dismiss immediately
        // }
    }
}