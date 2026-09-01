"use client";

import { useState, useRef, useCallback } from "react";

interface CameraRecipes {
  fujifilm: { [key: string]: string };
  sony: { [key: string]: string };
  canon: { [key: string]: string };
  nikon: { [key: string]: string };
}

interface Recipe {
  title: string;
  mood: string;
  genre: string;
  camera_settings: {
    estimated_aperture: string;
    estimated_shutter_speed: string;
    estimated_iso: string;
    estimated_focal_length: string;
    white_balance: string;
    metering_mode: string;
  };
  color_analysis: {
    dominant_colors: string[];
    color_palette_name: string;
    shadows: string;
    highlights: string;
    midtones: string;
    overall_tone: string;
  };
  film_simulation: {
    analog_film_equivalent: string;
    reason: string;
  };
  post_processing: { [key: string]: string };
  camera_recipes: CameraRecipes;
  shooting_tips: string[];
  lightroom_preset_summary: string;
}

type TabKey = "lightroom" | "fujifilm" | "sony" | "canon" | "nikon";

const TABS: { key: TabKey; label: string }[] = [
  { key: "lightroom", label: "Lightroom" },
  { key: "fujifilm", label: "Fujifilm" },
  { key: "sony", label: "Sony" },
  { key: "canon", label: "Canon" },
  { key: "nikon", label: "Nikon" },
];

const LABELS: { [key: string]: string } = {
  exposure: "Exposure", contrast: "Contrast", highlights: "Highlights",
  shadows: "Shadows", whites: "Whites", blacks: "Blacks",
  texture: "Texture", clarity: "Clarity", vibrance: "Vibrance", saturation: "Saturation",
  film_simulation: "Film Simulation", grain_effect: "Grain Effect",
  color_chrome_effect: "Color Chrome", color_chrome_blue: "Color Chrome Blue",
  white_balance: "White Balance", wb_shift_r: "WB Shift R", wb_shift_b: "WB Shift B",
  highlight_tone: "Highlight Tone", shadow_tone: "Shadow Tone",
  color: "Color", sharpness: "Sharpness", noise_reduction: "Noise Reduction",
  dynamic_range: "Dynamic Range", creative_style: "Creative Style",
  picture_profile: "Picture Profile", d_range_optimizer: "D-Range Optimizer",
  picture_style: "Picture Style", color_tone: "Color Tone",
  highlight_priority: "Highlight Priority", auto_lighting_optimizer: "Auto Lighting",
  picture_control: "Picture Control", sharpening: "Sharpening",
  brightness: "Brightness", hue: "Hue", active_d_lighting: "Active D-Lighting",
};

function NeonStrip({ position }: { position: "top" | "bottom" }) {
  const text = "✦ PHOTORECIPE ✦ FILM ANALYSIS ✦ AI POWERED ✦ REVERSE ENGINEER ✦ ";
  const repeated = text.repeat(6);
  return (
    <div style={{
      position: "fixed" as const,
      [position]: 0,
      left: 0,
      right: 0,
      height: "36px",
      background: "#0a0a1a",
      borderTop: position === "bottom" ? "1px solid #1a2a4a" : "none",
      borderBottom: position === "top" ? "1px solid #1a2a4a" : "none",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      zIndex: 100,
    }}>
      {/* Neon glow efekti için arka ışık */}
      <div style={{
        position: "absolute" as const,
        inset: 0,
        background: "linear-gradient(90deg, transparent, rgba(0,120,255,0.06), transparent)",
        pointerEvents: "none",
      }} />
      <div style={{
        whiteSpace: "nowrap" as const,
        animation: position === "top" ? "marqueeLeft 25s linear infinite" : "marqueeRight 25s linear infinite",
        fontSize: "11px",
        fontFamily: "monospace",
        letterSpacing: "0.2em",
        color: "#4499FF",
        textShadow: "0 0 8px #4499FF, 0 0 20px #2266CC, 0 0 40px #0044AA",
        paddingLeft: "100%",
        display: "inline-block",
      }}>
        {repeated}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid #F0F0F0" }}>
      <span style={{ fontSize: "10px", color: "#999", fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.1em", flexShrink: 0, marginRight: "16px" }}>{label}</span>
      <span style={{ fontSize: "13px", color: "#1a1a1a", textAlign: "right" as const }}>{value}</span>
    </div>
  );
}

function RecipeTabs({ recipe }: { recipe: Recipe }) {
  const [activeTab, setActiveTab] = useState<TabKey>("lightroom");

  const tabData: { [key in TabKey]: { [key: string]: string } } = {
    lightroom: recipe.post_processing,
    fujifilm: recipe.camera_recipes.fujifilm,
    sony: recipe.camera_recipes.sony,
    canon: recipe.camera_recipes.canon,
    nikon: recipe.camera_recipes.nikon,
  };

  const hints: { [key in TabKey]: string } = {
    lightroom: "Adobe Lightroom / Camera Raw",
    fujifilm: "Q Menu → Image Quality Settings",
    sony: "Camera Settings 1 → Picture Profile",
    canon: "Shooting Menu → Picture Style",
    nikon: "Photo Shooting Menu → Picture Control",
  };

  return (
    <div>
      <div style={{ display: "flex", borderBottom: "2px solid #1a1a1a" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "14px 24px",
              fontSize: "10px",
              fontFamily: "monospace",
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              cursor: "pointer",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid #1a1a1a" : "2px solid transparent",
              background: "transparent",
              color: activeTab === tab.key ? "#1a1a1a" : "#BBBBBB",
              marginBottom: "-2px",
              transition: "all 0.15s",
              fontWeight: activeTab === tab.key ? "600" : "400",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: "24px 0" }}>
        <div style={{ fontSize: "10px", color: "#BBBBBB", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: "16px" }}>
          {hints[activeTab]}
        </div>
        {Object.entries(tabData[activeTab]).map(([key, value]) => (
          <InfoRow key={key} label={LABELS[key] || key.replace(/_/g, " ")} value={value} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = async (base64: string, mime: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: mime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setRecipe(data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setError("Lütfen bir görsel dosyası yükle."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImage(result);
      setRecipe(null);
      setError(null);
      analyzeImage(result.split(",")[1], file.type);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: "#1a1a1a", paddingTop: "36px", paddingBottom: "36px" }}>

      <NeonStrip position="top" />
      <NeonStrip position="bottom" />

      {/* Header */}
      <header style={{ padding: "24px 64px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E8E8E8" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "-0.02em", fontFamily: "Georgia, serif" }}>PhotoRecipe</div>
          <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "#BBBBBB", fontFamily: "monospace", textTransform: "uppercase" as const }}>Film Analysis System</div>
        </div>
        <div style={{ fontSize: "9px", fontFamily: "monospace", color: "#BBBBBB", letterSpacing: "0.15em" }}>AI POWERED</div>
      </header>

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "0 64px" }}>

        {/* Upload — her zaman üstte */}
        <div
          onClick={() => !loading && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            marginTop: "48px",
            marginBottom: "48px",
            border: isDragging ? "2px dashed #4499FF" : image ? "1px solid #E8E8E8" : "2px dashed #D0D0D0",
            borderRadius: "4px",
            padding: image ? "0" : "72px 40px",
            cursor: loading ? "wait" : "pointer",
            background: isDragging ? "rgba(68,153,255,0.04)" : image ? "#fff" : "#FAFAFA",
            position: "relative" as const,
            textAlign: "center" as const,
            transition: "all 0.2s",
          }}
        >
          <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} style={{ display: "none" }} />

          {image ? (
            <div style={{ position: "relative" as const }}>
              <img src={image} alt="Uploaded" style={{ width: "100%", maxHeight: "520px", objectFit: "contain" as const, display: "block" }} />
              {loading && (
                <div style={{ position: "absolute" as const, inset: 0, background: "rgba(255,255,255,0.94)", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: "20px" }}>
                  <div style={{ fontSize: "13px", fontFamily: "monospace", color: "#1a1a1a", letterSpacing: "0.3em" }}>ANALYSING</div>
                  <div style={{ width: "160px", height: "1px", background: "#E8E8E8", position: "relative" as const, overflow: "hidden" }}>
                    <div style={{ position: "absolute" as const, left: 0, top: 0, height: "100%", width: "40%", background: "#1a1a1a", animation: "slide 1.2s ease-in-out infinite" }} />
                  </div>
                  <div style={{ fontSize: "9px", fontFamily: "monospace", color: "#BBBBBB", letterSpacing: "0.2em" }}>LIGHTROOM · FUJIFILM · SONY · CANON · NIKON</div>
                </div>
              )}
              {!loading && (
                <div style={{ position: "absolute" as const, bottom: "16px", right: "16px", background: "#1a1a1a", color: "#fff", padding: "8px 16px", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.15em", cursor: "pointer" }}>
                  NEW IMAGE
                </div>
              )}
            </div>
          ) : (
            <>
              <div style={{ fontSize: "15px", fontFamily: "monospace", letterSpacing: "0.25em", color: "#888", marginBottom: "10px", fontWeight: "600" }}>
                DROP IMAGE HERE
              </div>
              <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#C0C0C0", letterSpacing: "0.2em" }}>
                veya tıklayarak seç · JPG · PNG · WEBP
              </div>
            </>
          )}
        </div>

        {/* Hero — sadece fotoğraf yokken */}
        {!image && (
          <div style={{ paddingBottom: "64px", borderBottom: "1px solid #E8E8E8" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#BBBBBB", fontFamily: "monospace", textTransform: "uppercase" as const, marginBottom: "24px" }}>
              Issue No. 001 · Reverse Engineer Any Photo
            </div>
            <h1 style={{ fontSize: "clamp(48px, 7vw, 80px)", fontWeight: "700", lineHeight: "1.0", letterSpacing: "-0.03em", fontFamily: "Georgia, serif", marginBottom: "24px" }}>
              Upload.<br />
              <span style={{ color: "#BBBBBB", fontStyle: "italic" }}>Analyse.</span><br />
              Recreate.
            </h1>
            <p style={{ fontSize: "14px", color: "#888", lineHeight: "1.8", maxWidth: "360px" }}>
              Fotoğrafın sırlarını çöz. Lightroom, Fujifilm, Sony, Canon ve Nikon için tam reçete.
            </p>
          </div>
        )}

        {error && (
          <div style={{ border: "1px solid #1a1a1a", padding: "14px", marginBottom: "24px", fontSize: "11px", color: "#1a1a1a", fontFamily: "monospace", letterSpacing: "0.1em" }}>
            ✕ {error}
          </div>
        )}

        {/* Recipe */}
        {recipe && !loading && (
          <div>
            <div style={{ paddingBottom: "48px", borderBottom: "1px solid #E8E8E8", marginBottom: "48px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#BBBBBB", fontFamily: "monospace", textTransform: "uppercase" as const, marginBottom: "16px" }}>
                Film Recipe · {recipe.genre}
              </div>
              <h2 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: "700", letterSpacing: "-0.03em", fontFamily: "Georgia, serif", lineHeight: "1.05", marginBottom: "16px" }}>
                {recipe.title}
              </h2>
              <p style={{ fontSize: "15px", color: "#888", lineHeight: "1.7", maxWidth: "480px", marginBottom: "20px" }}>{recipe.mood}</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.15em", border: "1px solid #E8E8E8", padding: "4px 12px", color: "#888" }}>{recipe.film_simulation.analog_film_equivalent}</span>
                <span style={{ fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.15em", border: "1px solid #E8E8E8", padding: "4px 12px", color: "#888" }}>{recipe.color_analysis.color_palette_name}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", marginBottom: "48px", paddingBottom: "48px", borderBottom: "1px solid #E8E8E8" }}>
              <div>
                <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "#BBBBBB", fontFamily: "monospace", textTransform: "uppercase" as const, marginBottom: "24px" }}>Kamera Ayarları</div>
                <InfoRow label="Diyafram" value={recipe.camera_settings.estimated_aperture} />
                <InfoRow label="Enstantane" value={recipe.camera_settings.estimated_shutter_speed} />
                <InfoRow label="ISO" value={recipe.camera_settings.estimated_iso} />
                <InfoRow label="Odak" value={recipe.camera_settings.estimated_focal_length} />
                <InfoRow label="Beyaz Denge" value={recipe.camera_settings.white_balance} />
                <InfoRow label="Ölçüm" value={recipe.camera_settings.metering_mode} />
              </div>
              <div>
                <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "#BBBBBB", fontFamily: "monospace", textTransform: "uppercase" as const, marginBottom: "24px" }}>Renk Analizi</div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
                  {recipe.color_analysis.dominant_colors.map((c, i) => (
                    <div key={i} title={c} style={{ width: "40px", height: "40px", background: c }} />
                  ))}
                </div>
                <InfoRow label="Gölgeler" value={recipe.color_analysis.shadows} />
                <InfoRow label="Işıklar" value={recipe.color_analysis.highlights} />
                <InfoRow label="Orta Tonlar" value={recipe.color_analysis.midtones} />
                <InfoRow label="Genel Ton" value={recipe.color_analysis.overall_tone} />
              </div>
            </div>

            <div style={{ marginBottom: "48px", paddingBottom: "48px", borderBottom: "1px solid #E8E8E8" }}>
              <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "#BBBBBB", fontFamily: "monospace", marginBottom: "16px" }}>Film Simülasyonu</div>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "32px", alignItems: "start" }}>
                <div style={{ fontSize: "26px", fontWeight: "700", fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
                  {recipe.film_simulation.analog_film_equivalent}
                </div>
                <p style={{ fontSize: "13px", color: "#888", lineHeight: "1.7", paddingTop: "6px" }}>{recipe.film_simulation.reason}</p>
              </div>
            </div>

            <div style={{ marginBottom: "48px", paddingBottom: "48px", borderBottom: "1px solid #E8E8E8" }}>
              <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "#BBBBBB", fontFamily: "monospace", marginBottom: "24px" }}>Düzenleme Reçeteleri</div>
              <RecipeTabs recipe={recipe} />
            </div>

            <div style={{ marginBottom: "48px", paddingBottom: "48px", borderBottom: "1px solid #E8E8E8" }}>
              <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "#BBBBBB", fontFamily: "monospace", marginBottom: "24px" }}>Çekim İpuçları</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px" }}>
                {recipe.shooting_tips.map((tip, i) => (
                  <div key={i}>
                    <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#BBBBBB", marginBottom: "8px" }}>0{i + 1}</div>
                    <p style={{ fontSize: "13px", color: "#555", lineHeight: "1.7" }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "48px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "#BBBBBB", fontFamily: "monospace", marginBottom: "16px" }}>Özet</div>
              <p style={{ fontSize: "15px", color: "#555", lineHeight: "1.9", maxWidth: "600px" }}>{recipe.lightroom_preset_summary}</p>
            </div>

            <div style={{ textAlign: "center" as const, paddingBottom: "60px" }}>
              <button
                onClick={() => { setRecipe(null); setImage(null); setError(null); }}
                style={{ background: "#1a1a1a", border: "none", color: "#fff", padding: "16px 40px", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.25em", textTransform: "uppercase" as const, cursor: "pointer" }}
                onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = "#333"; }}
                onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = "#1a1a1a"; }}
              >
                Yeni Fotoğraf Analiz Et
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes marqueeLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes slide {
          0% { left: -40%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}