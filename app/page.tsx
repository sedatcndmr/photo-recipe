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

const s = {
  // Layout
  page: { minHeight: "100vh", background: "#F5F0E8" } as React.CSSProperties,
  header: {
    padding: "24px 48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #E0D8CC",
  } as React.CSSProperties,
  logo: {
    fontSize: "13px",
    letterSpacing: "0.3em",
    textTransform: "uppercase" as const,
    color: "#1a1a1a",
    fontFamily: "monospace",
  },
  logoSub: {
    fontSize: "9px",
    letterSpacing: "0.2em",
    color: "#B5AA9A",
    fontFamily: "monospace",
    textTransform: "uppercase" as const,
    marginTop: "2px",
  },
  main: { maxWidth: "860px", margin: "0 auto", padding: "64px 24px" } as React.CSSProperties,

  // Hero
  hero: { textAlign: "center" as const, marginBottom: "56px" },
  heroEyebrow: {
    fontSize: "10px",
    letterSpacing: "0.3em",
    textTransform: "uppercase" as const,
    color: "#B5AA9A",
    fontFamily: "monospace",
    marginBottom: "20px",
  },
  heroTitle: {
    fontSize: "clamp(36px, 5vw, 58px)",
    fontWeight: "normal",
    lineHeight: "1.1",
    color: "#1a1a1a",
    marginBottom: "16px",
    letterSpacing: "-0.02em",
  },
  heroAccent: { color: "#C8A96E", fontStyle: "italic" },
  heroSub: { fontSize: "14px", color: "#8A8070", lineHeight: "1.7", maxWidth: "400px", margin: "0 auto" },

  // Upload
  uploadZone: (isDragging: boolean, hasImage: boolean): React.CSSProperties => ({
    border: `1px solid ${isDragging ? "#C8A96E" : hasImage ? "#3a3530" : "#3a3530"}`,
    borderRadius: "2px",
    padding: hasImage ? "0" : "80px 24px",
    cursor: "pointer",
    background: isDragging ? "#2a2520" : hasImage ? "#1a1814" : "#1a1814",
    marginBottom: "48px",
    overflow: "hidden",
    position: "relative",
    textAlign: "center",
    transition: "all 0.2s",
  }),

  uploadText: { fontSize: "13px", color: "#8A8070", marginBottom: "6px" },
uploadHint: { fontSize: "10px", color: "#5A5048", fontFamily: "monospace", letterSpacing: "0.15em" },

  // Loading overlay
  overlay: {
    position: "absolute" as const,
    inset: 0,
    background: "rgba(245,240,232,0.92)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  overlayText: { fontSize: "10px", fontFamily: "monospace", color: "#C8A96E", letterSpacing: "0.25em" },
  overlaySpinner: { fontSize: "24px", animation: "spin 3s linear infinite", color: "#C8A96E" },

  // Recipe title block
  recipeHeader: {
    marginBottom: "48px",
    paddingBottom: "32px",
    borderBottom: "1px solid #E0D8CC",
  } as React.CSSProperties,
  recipeEyebrow: {
    fontSize: "9px",
    letterSpacing: "0.3em",
    textTransform: "uppercase" as const,
    color: "#B5AA9A",
    fontFamily: "monospace",
    marginBottom: "12px",
  },
  recipeTitle: { fontSize: "36px", fontWeight: "normal", color: "#1a1a1a", marginBottom: "8px", letterSpacing: "-0.02em" },
  recipeMood: { fontSize: "14px", color: "#8A8070", lineHeight: "1.6", marginBottom: "16px" },
  recipeTags: { display: "flex", gap: "8px", flexWrap: "wrap" as const },
  tag: {
    fontSize: "9px",
    fontFamily: "monospace",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "#B5AA9A",
    border: "1px solid #E0D8CC",
    padding: "4px 10px",
    borderRadius: "1px",
  },

  // Grid
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1px", background: "#E0D8CC", marginBottom: "1px" } as React.CSSProperties,
  gridCell: { background: "#F5F0E8", padding: "28px" } as React.CSSProperties,
  cellLabel: {
    fontSize: "9px",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    color: "#B5AA9A",
    fontFamily: "monospace",
    marginBottom: "20px",
  },

  // Rows
  row: { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0", borderBottom: "1px solid #D4C8B4" } as React.CSSProperties,
  rowLabel: { fontSize: "11px", color: "#A09585", fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.06em", flexShrink: 0, marginRight: "16px" },
  rowValue: { fontSize: "12px", color: "#3a3530", textAlign: "right" as const, lineHeight: "1.4" },

  // Color swatches
  swatchRow: { display: "flex", gap: "8px", marginBottom: "16px" } as React.CSSProperties,
  swatch: (color: string): React.CSSProperties => ({ width: "32px", height: "32px", background: color, borderRadius: "1px" }),

  // Film simulation
  filmBlock: { background: "#FAF7F2", border: "1px solid #E0D8CC", padding: "20px", marginBottom: "1px" } as React.CSSProperties,
  filmName: { fontSize: "18px", color: "#C8A96E", fontFamily: "monospace", marginBottom: "8px", letterSpacing: "0.05em" },
  filmReason: { fontSize: "12px", color: "#8A8070", lineHeight: "1.7" },

  // Tabs
  tabBar: { display: "flex", gap: "0", marginBottom: "0", borderBottom: "1px solid #E0D8CC" } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    padding: "12px 20px",
    fontSize: "10px",
    fontFamily: "monospace",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    cursor: "pointer",
    border: "none",
    borderBottom: active ? "2px solid #C8A96E" : "2px solid transparent",
    background: "transparent",
    color: active ? "#C8A96E" : "#B5AA9A",
    transition: "all 0.15s",
    marginBottom: "-1px",
  }),
  tabContent: { background: "#EDE5D8", padding: "24px", border: "1px solid #D4C8B4", borderTop: "none" } as React.CSSProperties,
  tabHint: { fontSize: "10px", color: "#C8BFB0", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #EDE8E0" },

  // Tips
  tipsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1px", background: "#E0D8CC" } as React.CSSProperties,
  tipCell: { background: "#F5F0E8", padding: "20px", display: "flex", gap: "12px" } as React.CSSProperties,
  tipNum: { fontSize: "10px", fontFamily: "monospace", color: "#C8A96E", flexShrink: 0, marginTop: "2px" },
  tipText: { fontSize: "12px", color: "#6A6058", lineHeight: "1.7" },

  // Summary
  summary: { padding: "32px 0", borderTop: "1px solid #E0D8CC", marginTop: "1px" } as React.CSSProperties,
  summaryLabel: { fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase" as const, color: "#B5AA9A", fontFamily: "monospace", marginBottom: "12px" },
  summaryText: { fontSize: "13px", color: "#6A6058", lineHeight: "1.9" },

  // CTA
  cta: { textAlign: "center" as const, paddingBottom: "80px", paddingTop: "40px" },
  ctaBtn: {
    background: "transparent",
    border: "1px solid #C8A96E",
    color: "#C8A96E",
    padding: "12px 32px",
    fontSize: "9px",
    fontFamily: "monospace",
    letterSpacing: "0.25em",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Error
  error: { border: "1px solid #E8C4B4", background: "#FDF5F0", padding: "14px", marginBottom: "24px", fontSize: "12px", color: "#A06050", fontFamily: "monospace" } as React.CSSProperties,
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={s.row}>
      <span style={s.rowLabel}>{label}</span>
      <span style={s.rowValue}>{value}</span>
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
    <div style={{ marginBottom: "1px" }}>
      <div style={s.tabBar}>
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={s.tab(activeTab === tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div style={s.tabContent}>
        <div style={s.tabHint}>{hints[activeTab]}</div>
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
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <div style={s.logo}>PhotoRecipe</div>
          <div style={s.logoSub}>Film Analysis System</div>
        </div>
        <div style={{ fontSize: "9px", fontFamily: "monospace", color: "#C8BFB0", letterSpacing: "0.15em" }}>AI POWERED</div>
      </header>

      <main style={s.main}>
        {!image && (
          <div style={s.hero}>
            <div style={s.heroEyebrow}>Reverse Engineer Any Photo</div>
            <h1 style={s.heroTitle}>
              Fotoğrafı yükle.<br />
              <span style={s.heroAccent}>Reçeteni al.</span>
            </h1>
            <p style={s.heroSub}>Lightroom, Fujifilm, Sony, Canon ve Nikon için özel reçeteler.</p>
          </div>
        )}

        <div
          onClick={() => !loading && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={s.uploadZone(isDragging, !!image)}
        >
          <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} style={{ display: "none" }} />

          {image ? (
            <div style={{ position: "relative" }}>
              <img src={image} alt="Uploaded" style={{ width: "100%", maxHeight: "480px", objectFit: "contain", display: "block", background: "#FAF7F2" }} />
              {loading && (
                <div style={s.overlay}>
                  <div style={s.overlaySpinner}>◎</div>
                  <div style={s.overlayText}>Reçete hazırlanıyor</div>
                </div>
              )}
              {!loading && (
                <div style={{ position: "absolute", bottom: "16px", right: "16px", background: "rgba(245,240,232,0.9)", padding: "6px 12px", fontSize: "9px", fontFamily: "monospace", color: "#B5AA9A", letterSpacing: "0.15em", border: "1px solid #E0D8CC" }}>
                  YENİ FOTOĞRAF
                </div>
              )}
            </div>
          ) : (
            <>
              <div style={{ fontSize: "32px", marginBottom: "16px", color: "#4A4038" }}>○</div>
              <div style={s.uploadText}>Fotoğrafı buraya sürükle veya tıkla</div>
              <div style={s.uploadHint}>JPG · PNG · WEBP</div>
            </>
          )}
        </div>

        {error && <div style={s.error}>✕ {error}</div>}

        {recipe && !loading && (
          <div>
            {/* Başlık */}
            <div style={s.recipeHeader}>
              <div style={s.recipeEyebrow}>Film Reçetesi</div>
              <h2 style={s.recipeTitle}>{recipe.title}</h2>
              <p style={s.recipeMood}>{recipe.mood}</p>
              <div style={s.recipeTags}>
                <span style={s.tag}>{recipe.genre}</span>
                <span style={s.tag}>{recipe.film_simulation.analog_film_equivalent}</span>
                <span style={s.tag}>{recipe.color_analysis.color_palette_name}</span>
              </div>
            </div>

            {/* Kamera + Renk Grid */}
            <div style={s.grid}>
              <div style={s.gridCell}>
                <div style={s.cellLabel}>Kamera Ayarları</div>
                <InfoRow label="Diyafram" value={recipe.camera_settings.estimated_aperture} />
                <InfoRow label="Enstantane" value={recipe.camera_settings.estimated_shutter_speed} />
                <InfoRow label="ISO" value={recipe.camera_settings.estimated_iso} />
                <InfoRow label="Odak" value={recipe.camera_settings.estimated_focal_length} />
                <InfoRow label="Beyaz Denge" value={recipe.camera_settings.white_balance} />
                <InfoRow label="Ölçüm" value={recipe.camera_settings.metering_mode} />
              </div>
              <div style={s.gridCell}>
                <div style={s.cellLabel}>Renk Analizi</div>
                <div style={s.swatchRow}>
                  {recipe.color_analysis.dominant_colors.map((c, i) => (
                    <div key={i} style={s.swatch(c)} title={c} />
                  ))}
                </div>
                <InfoRow label="Gölgeler" value={recipe.color_analysis.shadows} />
                <InfoRow label="Işıklar" value={recipe.color_analysis.highlights} />
                <InfoRow label="Orta Tonlar" value={recipe.color_analysis.midtones} />
                <InfoRow label="Genel Ton" value={recipe.color_analysis.overall_tone} />
              </div>
            </div>

            {/* Film Simülasyonu */}
            <div style={s.filmBlock}>
              <div style={s.cellLabel}>Film Simülasyonu</div>
              <div style={s.filmName}>{recipe.film_simulation.analog_film_equivalent}</div>
              <p style={s.filmReason}>{recipe.film_simulation.reason}</p>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: "1px" }}>
              <div style={{ ...s.cellLabel, padding: "28px 0 12px" }}>Düzenleme Reçeteleri</div>
              <RecipeTabs recipe={recipe} />
            </div>

            {/* İpuçları */}
            <div style={{ ...s.cellLabel, padding: "28px 0 12px" }}>Çekim İpuçları</div>
            <div style={s.tipsGrid}>
              {recipe.shooting_tips.map((tip, i) => (
                <div key={i} style={s.tipCell}>
                  <span style={s.tipNum}>0{i + 1}</span>
                  <p style={s.tipText}>{tip}</p>
                </div>
              ))}
            </div>

            {/* Özet */}
            <div style={s.summary}>
              <div style={s.summaryLabel}>Özet</div>
              <p style={s.summaryText}>{recipe.lightroom_preset_summary}</p>
            </div>

            {/* CTA */}
            <div style={s.cta}>
              <button
                onClick={() => { setRecipe(null); setImage(null); setError(null); }}
                style={s.ctaBtn}
                onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = "#C8A96E"; (e.target as HTMLButtonElement).style.color = "#FAF7F2"; }}
                onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = "transparent"; (e.target as HTMLButtonElement).style.color = "#C8A96E"; }}
              >
                Yeni Fotoğraf Analiz Et
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}