import { resolveApiAssetUrl } from "@/services/api";

/**
 * Extracts and resolves the full HTTP URL for an image from a question or activity payload.
 */
export function extractImageUrl(question?: any, activity?: any): string | null {
  if (!question && !activity) return null;

  const rawUrl =
    question?.content?.image_url ||
    question?.image_url ||
    question?.metadata?.image_url ||
    question?.media_urls?.image_url ||
    question?.media_urls?.url ||
    (Array.isArray(question?.media_urls)
      ? typeof question.media_urls[0] === "string"
        ? question.media_urls[0]
        : question.media_urls[0]?.url ||
          question.media_urls[0]?.src ||
          question.media_urls[0]?.image_url
      : null) ||
    activity?.content?.image_url ||
    activity?.image_url ||
    activity?.metadata?.image_url ||
    activity?.media_urls?.image_url ||
    activity?.media_urls?.url ||
    (Array.isArray(activity?.media_urls)
      ? typeof activity.media_urls[0] === "string"
        ? activity.media_urls[0]
        : activity.media_urls[0]?.url ||
          activity.media_urls[0]?.src ||
          activity.media_urls[0]?.image_url
      : null) ||
    null;

  return resolveApiAssetUrl(rawUrl);
}
