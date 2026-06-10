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
      const params = new URLSearchParams();
      params.append("skinColor", s);
      params.append("hairColor", hc);
      params.append("hair", h.startsWith("s") ? h.replace("s", "short") : h.replace("l", "long"));
      params.append("eyes", `variant${e}`);
      params.append("mouth", `variant${m}`);
      if (g !== "x") {
        params.append("glasses", `variant${g}`);
        params.append("glassesProbability", "100");
      }
      params.append("backgroundColor", "b6e3f4,c0aede,d1d4f9");
      params.append("seed", "user_custom");
      return `https://api.dicebear.com/7.x/adventurer/png?${params.toString()}`;
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

  // 2. DiceBear composite style-seed keys (e.g. 'bottts-seed3')
  if (avatarId.includes("-")) {
    const [style, seed] = avatarId.split("-");
    return `https://api.dicebear.com/7.x/${style}/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }

  // 3. Fallback for custom or legacy adventurer seeds (e.g. 'adventurer1')
  return `https://api.dicebear.com/7.x/adventurer/png?seed=${avatarId}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}
