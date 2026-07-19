/**
 * Shared visual for the site-wide Open Graph / Twitter card image.
 * Kept deliberately font-free (no custom `fonts` array passed to
 * ImageResponse) so it renders with Satori's bundled default font —
 * avoids shipping/loading a Devanagari font just for this one glyph.
 */
export function brandImage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fbf7ef",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 120,
          height: 120,
          borderRadius: "50%",
          backgroundImage: "linear-gradient(135deg, #d97706, #7c2d12)",
          color: "#fbf7ef",
          fontSize: 56,
          fontWeight: 700,
          marginBottom: 36,
        }}
      >
        G
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 72,
          fontWeight: 700,
          color: "#7c2d12",
          marginBottom: 20,
        }}
      >
        Gita Quest
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 32,
          color: "#52566a",
          maxWidth: 820,
          textAlign: "center",
          justifyContent: "center",
        }}
      >
        Understand the Bhagavad Gita in Simple Language
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 40,
          fontSize: 24,
          fontWeight: 600,
          color: "#d97706",
          letterSpacing: 1,
        }}
      >
        18 CHAPTERS · ENGLISH · HINDI · HINGLISH
      </div>
    </div>
  );
}
