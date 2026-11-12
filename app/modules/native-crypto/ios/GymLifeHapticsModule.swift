import ExpoModulesCore
import UIKit

public class GymLifeHapticsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("GymLifeHaptics")

    AsyncFunction("triggerClickHaptic") { () -> Void in
      let generator = UIImpactFeedbackGenerator(style: .heavy)
      generator.prepare()
      generator.impactOccurred()
    }

    AsyncFunction("triggerSlowRiseHaptic") { () -> Void in
    }

    AsyncFunction("cancelHaptic") { () -> Void in
      // iOS haptic feedback cannot be cancelled once triggered
    }
  }
}
