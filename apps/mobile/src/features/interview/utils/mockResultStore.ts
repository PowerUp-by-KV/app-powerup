/**
 * src/features/interview/utils/mockResultStore.ts
 *
 * AsyncStorage-based persistence for mock interview results.
 * Phase 2/3: Stores results before navigation to report screen.
 * Data persists across app sessions.
 * Report screen loads from here, falls back to API if not found.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "@/utils/logger";

type MockResult = {
  id: string;
  type: string;
  date: Date;
  duration: number;
  totalQuestions: number;
  answers: any[];
  aiSummary: string;
  scores: Array<{ question: string; score: number }>;
  nextSteps: string[];
};

/**
 * Store a mock result in AsyncStorage
 */
export async function storeMockResult(result: MockResult): Promise<void> {
  try {
    const key = `mockResult_${result.id}`;
    await AsyncStorage.setItem(key, JSON.stringify(result));
    logger.log(`📦 Result stored to AsyncStorage:`, result.id);
  } catch (error) {
    logger.log("⚠️ Failed to store result:", error);
  }
}

/**
 * Retrieve a mock result from AsyncStorage
 */
export async function getMockResult(reportId: string): Promise<MockResult | null> {
  try {
    const key = `mockResult_${reportId}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      logger.log(`✓ Found result in AsyncStorage:`, reportId);
      return JSON.parse(data) as MockResult;
    }
    return null;
  } catch (error) {
    logger.log("⚠️ Failed to retrieve result:", error);
    return null;
  }
}

/**
 * Clear a mock result from AsyncStorage
 */
export async function clearMockResult(reportId: string): Promise<void> {
  try {
    const key = `mockResult_${reportId}`;
    await AsyncStorage.removeItem(key);
    logger.log(`✓ Result cleared from AsyncStorage:`, reportId);
  } catch (error) {
    logger.log("⚠️ Failed to clear result:", error);
  }
}
