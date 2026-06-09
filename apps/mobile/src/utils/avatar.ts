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

  // 1. Local Customizable Avatar
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
