import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Check, Star, Zap, Shield, Headphones, Brain, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS, SIZES, GRADIENTS } from "@/constants/theme";
import { Card } from "@/features/learning/components";
import { GradientButton } from "./components/GradientButton";

export const SubscriptionScreen = () => {
  const features = [
    { text: "Unlimited lessons & practices", icon: <Zap size={20} color={COLORS.quaternary} /> },
    { text: "Personalized AI coaching", icon: <Star size={20} color={COLORS.primary} /> },
    { text: "Advanced behaviour insights", icon: <Brain size={20} color={COLORS.tertiary} /> },
    { text: "Full listening library", icon: <Headphones size={20} color={COLORS.secondary} /> },
    { text: "Ad-free experience", icon: <Shield size={20} color={COLORS.success} /> },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={GRADIENTS.premium} style={styles.premiumHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Star size={60} color={COLORS.white} fill={COLORS.white} />
          <Text style={styles.premiumTitle}>Unlock Linguist Pro</Text>
          <Text style={styles.premiumSubtitle}>Master English with AI-powered tools</Text>
        </LinearGradient>

        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>What's included</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>{feature.icon}</View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.pricingContainer}>
          <TouchableOpacity style={styles.planCard}>
            <View>
              <Text style={styles.planTitle}>Monthly Plan</Text>
              <Text style={styles.planPrice}>$9.99/month</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.planCard, styles.selectedPlan]}>
            <View>
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <Text style={styles.planTitle}>Annual Plan</Text>
              <Text style={styles.planPrice}>$79.99/year</Text>
            </View>
            <View style={styles.checkCircle}>
              <Check size={16} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        </View>

        <GradientButton
          title="Subscribe Now"
          colors={GRADIENTS.premium as any}
          style={styles.subscribeBtn}
          onPress={() => console.log("Subscribe")}
        />

        <Text style={styles.footerText}>Cancel anytime. Terms & Privacy apply.</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 0,
  },
  premiumHeader: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 40,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  premiumTitle: {
    fontSize: 28,
    color: COLORS.white,
    marginTop: 15,
    ...FONTS.bold,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    ...FONTS.medium,
  },
  featuresContainer: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: 20,
    color: COLORS.black,
    marginBottom: 20,
    ...FONTS.bold,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.darkGray,
    ...FONTS.medium,
  },
  pricingContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  planCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  selectedPlan: {
    borderColor: COLORS.quaternary,
    backgroundColor: COLORS.quaternary + "05",
  },
  planTitle: {
    fontSize: 18,
    color: COLORS.black,
    ...FONTS.bold,
  },
  planPrice: {
    fontSize: 14,
    color: COLORS.gray,
    ...FONTS.semiBold,
  },
  bestValueBadge: {
    backgroundColor: COLORS.quaternary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  bestValueText: {
    color: COLORS.white,
    fontSize: 10,
    ...FONTS.bold,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.quaternary,
    justifyContent: "center",
    alignItems: "center",
  },
  subscribeBtn: {
    marginHorizontal: SIZES.padding,
    marginTop: 10,
  },
  footerText: {
    textAlign: "center",
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 15,
    ...FONTS.regular,
  },
});

// export default SubscriptionScreen;
