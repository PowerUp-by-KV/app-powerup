import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ProgressSummary, HeatmapData, TrendData, Badge } from "@/services/types";
import {
  useGetProgressSummaryQuery,
  useGetHeatmapDataQuery,
  useGetTrendsDataQuery,
  useGetBadgesQuery,
} from "@/services/ProgressApi";

interface ProgressContextType {
  summary: ProgressSummary | null;
  heatmap: HeatmapData | null;
  trends: TrendData | null;
  badges: Badge[];
  isLoading: boolean;
  error: any;
  refetchAll: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider = ({
  children,
  userId = "user-123",
}: {
  children: ReactNode;
  userId?: string;
}) => {
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetProgressSummaryQuery(userId);

  useEffect(() => {
    if (summaryError) {
      console.warn("Progress API error:", summaryError);
    }
  }, [summaryError]);

  const {
    data: heatmapData,
    isLoading: isHeatmapLoading,
    refetch: refetchHeatmap,
  } = useGetHeatmapDataQuery(userId);

  const {
    data: trendsData,
    isLoading: isTrendsLoading,
    refetch: refetchTrends,
  } = useGetTrendsDataQuery({ userId });

  const {
    data: badgesData,
    isLoading: isBadgesLoading,
    refetch: refetchBadges,
  } = useGetBadgesQuery(userId);

  const refetchAll = () => {
    refetchSummary();
    refetchHeatmap();
    refetchTrends();
    refetchBadges();
  };

  const value = {
    summary: summaryData?.data || null,
    heatmap: heatmapData?.data || null,
    trends: trendsData?.data || null,
    badges: badgesData?.data || [],
    isLoading: isSummaryLoading || isHeatmapLoading || isTrendsLoading || isBadgesLoading,
    error: summaryError,
    refetchAll,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
};
