/**
 * Centralized utility to resolve and format avatar image URLs for display.
 * Supports:
 * 1. Ready Player Me avatars (starts with 'rpm_')
 * 2. Legacy / fallback adventurer seeds (e.g. 'adventurer1')
 * 3. DiceBear composite style-seed keys (e.g. 'bottts-seed3')
 */
export function getAvatarUri(
  avatarId: string | null | undefined,
  fallbackProfileId?: string,
): string {
  if (!avatarId) {
    // Default fallback utilizing the unique profile ID as seed for adventurer
    const seed = fallbackProfileId || "default";
    return `https://api.dicebear.com/7.x/adventurer/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }

  // 1. Local Customizable Avatar (v2 compressed format)
  if (avatarId.startsWith("c2d?")) {
    const data = avatarId.replace("c2d?", "").split("-");
    if (data.length === 6) {
      const [s, hc, h, e, m, g] = data as [string, string, string, string, string, string];
      const params = new URLSearchParams({
        skinColor: s,
        hairColor: hc,
        hair: h.startsWith("s") ? h.replace("s", "short") : h.replace("l", "long"),
        eyes: "variant" + e,
        mouth: "variant" + m,
        backgroundColor: "b6e3f4,c0aede,d1d4f9",
        seed: "user_custom",
      });
      if (g !== "x") {
        params.append("glasses", "variant" + g);
        params.append("glassesProbability", "100");
      }
      return "https://api.dicebear.com/7.x/adventurer/png?" + params.toString();
    }
  }

  // New ultra-compressed format c2d!
  if (avatarId.startsWith("c2d!")) {
    const data = avatarId.replace("c2d!", "").split("-");
    if (data.length === 6) {
      const [s, hc, h, e, m, g] = data as [string, string, string, string, string, string];

      const SKIN_COLORS = [
        "f8d9ce",
        "f1c27d",
        "e0ac69",
        "c89b7b",
        "8d5524",
        "c68642",
        "e8beac",
        "ffdbac",
      ];
      const HAIR_COLORS = [
        "090806",
        "2c222b",
        "71635a",
        "b7a69e",
        "d6c4c2",
        "cab2a7",
        "9f7a68",
        "b55239",
        "e6cea8",
        "e5c8a8",
        "debc99",
        "a3a89e",
      ];

      const sColor = SKIN_COLORS[parseInt(s, 36)] || "f1c27d";
      const hColor = HAIR_COLORS[parseInt(hc, 36)] || "090806";
      const hairStyle = h.startsWith("s")
        ? `short${h.replace("s", "").padStart(2, "0")}`
        : `long${h.replace("l", "").padStart(2, "0")}`;

      const params = new URLSearchParams({
        skinColor: sColor,
        hairColor: hColor,
        hair: hairStyle,
        eyes: "variant" + e.padStart(2, "0"),
        mouth: "variant" + m.padStart(2, "0"),
        backgroundColor: "b6e3f4,c0aede,d1d4f9",
        seed: "user_custom",
      });
      if (g !== "x") {
        params.append("glasses", "variant" + g.padStart(2, "0"));
        params.append("glassesProbability", "100");
      }
      return "https://api.dicebear.com/7.x/adventurer/png?" + params.toString();
    }
  }

  // Legacy fallback for v1 uncompressed
  if (avatarId.startsWith("rpm_custom?")) {
    const query = avatarId.replace("rpm_custom?", "");
    return `https://api.dicebear.com/7.x/adventurer/png?seed=user_custom&${query}`;
  }

  // 2. Ready Player Me Avatar (fallback)
  if (avatarId.startsWith("rpm_")) {
    const rpmId = avatarId.replace("rpm_", "");
    return `https://models.readyplayer.me/${rpmId}.png?scene=halfbody-portrait-v1-transparent`;
  }

  // 3. Avaturn Avatar (fallback 2D)
  if (avatarId.startsWith("avaturn_")) {
    // Avaturn doesn't have a public 2D PNG endpoint by default without the render API.
    // Return a sleek 3D-like generic placeholder
    return `https://api.dicebear.com/7.x/shapes/png?seed=${fallbackProfileId || "user"}&backgroundColor=3b82f6`;
  }

  // 4. DiceBear composite style-seed keys (e.g. 'bottts-seed3')
  if (avatarId.includes("-")) {
    const [style, seed] = avatarId.split("-");
    return `https://api.dicebear.com/7.x/${style}/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }

  // 5. Fallback for custom or legacy adventurer seeds (e.g. 'adventurer1')
  return `https://api.dicebear.com/7.x/adventurer/png?seed=${avatarId}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

/**
 * Returns the GLB URL for a given avatar ID if it's a Ready Player Me or Avaturn avatar.
 * Otherwise returns null.
 */
export function getAvatarGlbUrl(avatarId: string | null | undefined): string | null {
  if (!avatarId) return null;

  if (avatarId.startsWith("rpm_")) {
    const rpmId = avatarId.replace("rpm_", "");
    return `https://models.readyplayer.me/${rpmId}.glb`;
  }

  if (avatarId.startsWith("avaturn_")) {
    return avatarId.replace("avaturn_", "");
  }

  return null;
}
