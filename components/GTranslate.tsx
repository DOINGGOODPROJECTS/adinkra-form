"use client"
import { useEffect } from "react"

export default function GTranslate() {
  useEffect(() => {
    // Inject settings
    (window as any).gtranslateSettings = {
      default_language: "fr",
      native_language_names: true,
      detect_browser_language: true,
      languages: ["fr", "es", "pt", "en"],
      wrapper_selector: ".gtranslate_wrapper",
      switcher_horizontal_position: "right",
      switcher_vertical_position: "top",
      float_switcher_open_direction: "bottom",
      flag_style: "3d",
      alt_flags: { en: "usa" }
    }

    // Inject script if not already present
    const existingScript = document.querySelector("script[src*='gtranslate']")
    if (!existingScript) {
      const script = document.createElement("script")
      script.src = "https://cdn.gtranslate.net/widgets/latest/float.js"
      script.defer = true
      document.body.appendChild(script)
    }
  }, [])

  return <div className="gtranslate_wrapper" />
}
