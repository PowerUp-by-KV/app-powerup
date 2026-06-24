import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, Image, Platform, Switch } from "react-native";
import { Text } from "@/components/Themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectBuilderDraft,
  selectBuilderLocalPhotoUri,
  setCurrentStep,
  updateSummary,
  updateExperience,
  updateProjects,
} from "@/store/slices/resume-builder.slice";
import { EnhanceButton } from "./EnhanceButton";
import { Feather } from "@expo/vector-icons";
import { resolveApiAssetUrl } from "@/services/api";

interface ResumeReviewViewProps {
  onContinue: (useAutoEnhance: boolean) => void;
  onBack: () => void;
}

export function ResumeReviewView({ onContinue, onBack }: ResumeReviewViewProps) {
  const dispatch = useAppDispatch();
  const draftResume = useAppSelector(selectBuilderDraft);
  const localPhotoUri = useAppSelector(selectBuilderLocalPhotoUri);
  const [useAutoEnhance, setUseAutoEnhance] = useState(false);

  const photoToDisplay = localPhotoUri || draftResume.photoUrl;

  console.log("[PHOTO_DEBUG] photoUrl is:", draftResume.photoUrl);

  const isModernAts = draftResume.templateName === "modern_ats";

  // Font family helper to simulate a clean serif document look for non-modern ATS
  const docFont =
    Platform.OS === "ios"
      ? isModernAts
        ? "Helvetica"
        : "Georgia"
      : isModernAts
        ? "sans-serif"
        : "serif";

  // Colors based on template
  const theme = {
    primaryText: isModernAts ? "#2A4356" : "#000",
    secondaryText: isModernAts ? "#5AA0C2" : "#333",
    headerBg: isModernAts ? "#2A4356" : "transparent",
    headerText: isModernAts ? "#fff" : "#000",
    sidebarBg: isModernAts ? "#EDF1F4" : "transparent",
    bodyText: "#333",
  };

  // Section Header Component
  const SectionHeader = ({
    title,
    showEnhance = false,
    textToEnhance = "",
    onEnhanced = (t: string) => {},
  }: any) => (
    <View style={styles.sectionHeaderContainer}>
      <View style={[styles.sectionTitleWrapper, { backgroundColor: theme.headerBg }]}>
        <Text style={[styles.sectionTitle, { color: theme.headerText, fontFamily: docFont }]}>
          {title}
        </Text>
        {showEnhance && (
          <View style={styles.enhanceWrapper}>
            <EnhanceButton
              sectionName={title}
              textToEnhance={textToEnhance}
              onEnhanced={onEnhanced}
            />
          </View>
        )}
      </View>
      {!isModernAts && <View style={styles.sectionDivider} />}
    </View>
  );

  const renderContact = () => (
    <View style={styles.leftSection}>
      <SectionHeader title="CONTACT" />
      <View style={styles.contactContainer}>
        {draftResume.contact.phone ? (
          <Text style={[styles.contactText, { fontFamily: docFont }]}>
            <Text style={styles.boldText}>Tel:</Text> {draftResume.contact.phone}
          </Text>
        ) : null}
        {draftResume.contact.email ? (
          <Text style={[styles.contactText, { fontFamily: docFont }]}>
            <Text style={styles.boldText}>Email:</Text> {draftResume.contact.email}
          </Text>
        ) : null}
        {draftResume.contact.location ? (
          <Text style={[styles.contactText, { fontFamily: docFont }]}>
            <Text style={styles.boldText}>Loc:</Text> {draftResume.contact.location}
          </Text>
        ) : null}
        {draftResume.contact.linkedin ? (
          <Text style={[styles.contactText, { fontFamily: docFont }]}>
            <Text style={styles.boldText}>LinkedIn:</Text> {draftResume.contact.linkedin}
          </Text>
        ) : null}
        {draftResume.contact.github ? (
          <Text style={[styles.contactText, { fontFamily: docFont }]}>
            <Text style={styles.boldText}>GitHub:</Text> {draftResume.contact.github}
          </Text>
        ) : null}
      </View>
    </View>
  );

  const renderSkills = () => {
    if (!draftResume.skills || draftResume.skills.length === 0) return null;
    const isSingleColumn =
      draftResume.layout !== "double_column" && draftResume.layout !== "two_column";

    return (
      <View style={styles.rightSection}>
        <SectionHeader title="SKILLS" />
        {isSingleColumn ? (
          <Text style={[styles.bodyText, { fontFamily: docFont, lineHeight: 16 }]}>
            {draftResume.skills.join(", ")}
          </Text>
        ) : (
          <View style={styles.listContainer}>
            {draftResume.skills.map((skill) => (
              <Text key={skill} style={[styles.listItem, { fontFamily: docFont }]}>
                {isModernAts ? skill : `• ${skill}`}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderSummary = () => (
    <View style={styles.rightSection}>
      <SectionHeader
        title="SUMMARY"
        showEnhance={true}
        textToEnhance={draftResume.summary}
        onEnhanced={(t: string) => dispatch(updateSummary(t))}
      />
      <Text style={[styles.bodyText, { fontFamily: docFont }]}>
        {draftResume.summary || "No professional summary added yet."}
      </Text>
    </View>
  );

  const renderEducation = () => {
    if (!draftResume.education || draftResume.education.length === 0) return null;
    return (
      <View style={styles.rightSection}>
        <SectionHeader title="EDUCATION" />
        {draftResume.education.map((edu, idx) => (
          <View key={edu.id || idx} style={styles.itemContainer}>
            <Text style={[styles.itemTitle, { fontFamily: docFont }]}>{edu.degree}</Text>
            <Text style={[styles.itemSubtitle, { fontFamily: docFont }]}>{edu.institution}</Text>
            <Text style={[styles.itemDate, { fontFamily: docFont }]}>
              {edu.startDate} - {edu.endDate || edu.endYear}
            </Text>
            {edu.gpa ? (
              <Text style={[styles.bodyText, { fontFamily: docFont }]}>GPA: {edu.gpa}</Text>
            ) : null}
          </View>
        ))}
      </View>
    );
  };

  const renderExperience = () => {
    if (!draftResume.experience || draftResume.experience.length === 0) return null;
    return (
      <View style={styles.rightSection}>
        <SectionHeader title="EXPERIENCE" />
        {draftResume.experience.map((exp, idx) => (
          <View key={exp.id || idx} style={styles.itemContainer}>
            <View style={styles.itemHeaderRow}>
              <View style={styles.itemTitleContainer}>
                <Text style={[styles.itemTitle, { fontFamily: docFont, color: theme.primaryText }]}>
                  {isModernAts ? (
                    <Text style={{ color: theme.primaryText }}>
                      {exp.role} |{" "}
                      <Text style={{ color: theme.secondaryText, fontWeight: "normal" }}>
                        {exp.company}
                      </Text>
                    </Text>
                  ) : (
                    <Text style={{ color: theme.primaryText }}>
                      {exp.company}{" "}
                      <Text style={{ color: theme.primaryText, fontWeight: "normal" }}>
                        – {exp.role}
                      </Text>
                    </Text>
                  )}
                </Text>
              </View>
              <View style={styles.enhanceWrapperRow}>
                <EnhanceButton
                  sectionName={`Experience - ${exp.company}`}
                  textToEnhance={exp.description}
                  onEnhanced={(enhancedText) => {
                    const updated = draftResume.experience.map((item) =>
                      item.id === exp.id ? { ...item, description: enhancedText } : item,
                    );
                    dispatch(updateExperience(updated));
                  }}
                />
              </View>
            </View>
            <Text
              style={[
                isModernAts ? styles.itemDate : styles.itemDateItalic,
                { fontFamily: docFont },
              ]}
            >
              {exp.startDate} - {exp.endDate || "Present"}
            </Text>
            {exp.description ? (
              <Text style={[styles.bodyText, { fontFamily: docFont }]}>{exp.description}</Text>
            ) : null}
          </View>
        ))}
      </View>
    );
  };

  const renderProjects = () => {
    if (!draftResume.projects || draftResume.projects.length === 0) return null;
    return (
      <View style={styles.rightSection}>
        <SectionHeader title="PROJECTS" />
        {draftResume.projects.map((proj, idx) => (
          <View key={proj.id || idx} style={styles.itemContainer}>
            <View style={styles.itemHeaderRow}>
              <View style={styles.itemTitleContainer}>
                <Text style={[styles.itemTitle, { fontFamily: docFont }]}>{proj.name}</Text>
              </View>
              <View style={styles.enhanceWrapperRow}>
                <EnhanceButton
                  sectionName={`Project - ${proj.name}`}
                  textToEnhance={proj.description}
                  onEnhanced={(enhancedText) => {
                    const updated = draftResume.projects.map((item) =>
                      item.id === proj.id ? { ...item, description: enhancedText } : item,
                    );
                    dispatch(updateProjects(updated));
                  }}
                />
              </View>
            </View>
            {proj.date ? (
              <Text
                style={[
                  isModernAts ? styles.itemDate : styles.itemDateItalic,
                  { fontFamily: docFont },
                ]}
              >
                {proj.date}
              </Text>
            ) : null}
            {proj.description ? (
              <Text style={[styles.bodyText, { fontFamily: docFont }]}>{proj.description}</Text>
            ) : null}
          </View>
        ))}
      </View>
    );
  };

  const renderCertifications = () => {
    if (!draftResume.certifications || draftResume.certifications.length === 0) return null;
    return (
      <View style={styles.rightSection}>
        <SectionHeader title="CERTIFICATIONS" />
        <View style={styles.listContainer}>
          {draftResume.certifications.map((cert) => (
            <Text key={cert} style={[styles.listItem, { fontFamily: docFont }]}>
              • {cert}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderLanguages = () => {
    if (!draftResume.languages || draftResume.languages.length === 0) return null;
    return (
      <View style={styles.rightSection}>
        <SectionHeader title="LANGUAGES" />
        <Text style={[styles.bodyText, { fontFamily: docFont }]}>
          {draftResume.languages.join(" • ")}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        {/* Header Navigation */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Preview</Text>
          <View style={styles.headerRight}>
            <Pressable onPress={() => dispatch(setCurrentStep(4))} style={styles.editButtonRow}>
              <Feather name="edit-2" size={14} color="#3b82f6" style={{ marginRight: 6 }} />
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.formContainer}>
          {/* Auto Enhance Premium Toggle */}
          <View style={[styles.toggleContainer, useAutoEnhance && styles.toggleContainerActive]}>
            <View style={styles.toggleIconContainer}>
              <Feather name="zap" size={20} color={useAutoEnhance ? "#3b82f6" : "#9ca3af"} />
            </View>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={[styles.toggleTitle, useAutoEnhance && { color: "#1d4ed8" }]}>
                Auto Enhance with AI
              </Text>
              <Text style={styles.toggleSubtitle}>
                Automatically polish and grammar-check your text before exporting.
              </Text>
            </View>
            <Switch
              value={useAutoEnhance}
              onValueChange={setUseAutoEnhance}
              trackColor={{ false: "#d1d5db", true: "#bfdbfe" }}
              thumbColor={useAutoEnhance ? "#3b82f6" : "#f3f4f6"}
            />
          </View>

          {/* Document Preview Box */}
          <View style={styles.documentBox}>
            {draftResume.layout === "double_column" || draftResume.layout === "two_column" ? (
              <View style={styles.doubleColumnLayout}>
                {/* LEFT COLUMN (Sidebar) */}
                <View style={[styles.leftColumn, { backgroundColor: theme.sidebarBg }]}>
                  <View style={styles.leftColumnContent}>
                    {photoToDisplay ? (
                      <View style={styles.docPhotoWrapper}>
                        <Image
                          source={{ uri: photoToDisplay }}
                          style={styles.docPhoto}
                          resizeMode="cover"
                        />
                      </View>
                    ) : (
                      <View style={styles.docPhotoPlaceholder}>
                        <Text style={styles.docPhotoInitial}>
                          {draftResume.contact.fullName?.charAt(0) || "U"}
                        </Text>
                      </View>
                    )}
                    {renderContact()}
                    {renderSkills()}
                  </View>
                </View>

                {/* RIGHT COLUMN (Main Content) */}
                <View style={styles.rightColumn}>
                  <View style={styles.docHeaderContainer}>
                    <Text
                      style={[styles.docName, { fontFamily: docFont, color: theme.primaryText }]}
                    >
                      {draftResume.contact.fullName?.toUpperCase() || "YOUR NAME"}
                    </Text>
                    <Text
                      style={[
                        styles.docOccupation,
                        { fontFamily: docFont, color: theme.secondaryText },
                      ]}
                    >
                      {isModernAts
                        ? draftResume.occupation?.toUpperCase()
                        : draftResume.occupation || "Target Occupation"}
                    </Text>
                  </View>

                  {renderSummary()}
                  {renderEducation()}
                  {renderExperience()}
                  {renderProjects()}
                  {renderCertifications()}
                  {renderLanguages()}
                </View>
              </View>
            ) : (
              // SINGLE COLUMN LAYOUT
              <View style={styles.singleColumnLayout}>
                <View
                  style={[styles.docHeaderContainer, { alignItems: "center", marginBottom: 16 }]}
                >
                  {photoToDisplay ? (
                    <View
                      style={[styles.docPhotoWrapper, { alignSelf: "center", marginBottom: 12 }]}
                    >
                      <Image
                        source={{ uri: photoToDisplay }}
                        style={styles.docPhoto}
                        resizeMode="cover"
                      />
                    </View>
                  ) : draftResume.photoUrl ? (
                    <View
                      style={[
                        styles.docPhotoPlaceholder,
                        { alignSelf: "center", marginBottom: 12 },
                      ]}
                    >
                      <Text style={styles.docPhotoInitial}>
                        {draftResume.contact.fullName?.charAt(0) || "U"}
                      </Text>
                    </View>
                  ) : null}
                  <Text
                    style={[
                      styles.docName,
                      { fontFamily: docFont, color: theme.primaryText, textAlign: "center" },
                    ]}
                  >
                    {draftResume.contact.fullName?.toUpperCase() || "YOUR NAME"}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      marginTop: 4,
                    }}
                  >
                    <Text style={[styles.contactTextCentered, { fontFamily: docFont }]}>
                      {draftResume.contact.phone}
                    </Text>
                    <Text style={[styles.contactTextCentered, { fontFamily: docFont }]}>
                      {" "}
                      | {draftResume.contact.email}
                    </Text>
                    <Text style={[styles.contactTextCentered, { fontFamily: docFont }]}>
                      {" "}
                      | {draftResume.contact.location}
                    </Text>
                    <Text style={[styles.contactTextCentered, { fontFamily: docFont }]}>
                      {" "}
                      | {draftResume.contact.linkedin}
                    </Text>
                  </View>
                </View>

                {renderSummary()}
                {renderExperience()}
                {renderEducation()}
                {renderSkills()}
                {renderProjects()}
                {renderCertifications()}
                {renderLanguages()}
              </View>
            )}
          </View>

          {/* Navigation Buttons footer */}
          <View style={styles.footerRow}>
            <Pressable onPress={onBack} style={styles.backButton}>
              <Feather name="arrow-left" size={16} color="#4b5563" style={{ marginRight: 6 }} />
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <Pressable onPress={() => onContinue(useAutoEnhance)} style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Export</Text>
              <Feather name="arrow-right" size={16} color="white" style={{ marginLeft: 6 }} />
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: "#f3f4f6" },
  contentContainer: { paddingBottom: 48 },
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  headerRight: {
    position: "absolute",
    right: 16,
  },
  editButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editButtonText: { fontSize: 13, fontWeight: "700", color: "#3b82f6" },
  formContainer: { padding: 16 },

  // Toggle Styles
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleContainerActive: {
    borderColor: "#bfdbfe",
    backgroundColor: "#f8fafc",
  },
  toggleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },

  // Document Styles
  documentBox: {
    backgroundColor: "white",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderRadius: 0, // Sharp corners like paper
    overflow: "hidden",
  },
  doubleColumnLayout: {
    flexDirection: "row",
    minHeight: 600, // Ensure sidebar stretches
  },
  singleColumnLayout: {
    flexDirection: "column",
    padding: 24,
  },
  leftColumn: {
    flex: 3.5, // Approx 35%
  },
  leftColumnContent: {
    padding: 16,
  },
  rightColumn: {
    flex: 6.5, // Approx 65%
    padding: 16,
  },

  // Left Column Content
  docPhotoWrapper: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 40,
  },
  docPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
  },
  docPhotoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  docPhotoInitial: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4b5563",
  },

  // Right Column Content
  docHeaderContainer: {
    marginBottom: 16,
  },
  docName: {
    fontSize: 24, // Enhanced size
    fontWeight: "900", // Extra bold for prominence
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  docOccupation: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },

  // Section Headers
  sectionHeaderContainer: {
    marginBottom: 8,
  },
  sectionTitleWrapper: {
    alignSelf: "stretch",
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 2,
    marginBottom: 2,
    borderRadius: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 24, // keep tall enough for the button
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#000",
    marginTop: 0,
    marginBottom: 4,
  },
  enhanceWrapper: {
    transform: [{ scale: 0.75 }],
    marginVertical: -8, // Offset the padding/scale
    marginRight: -6,
  },
  enhanceWrapperRow: {
    transform: [{ scale: 0.75 }],
    marginTop: -6,
    marginRight: -6,
  },

  // Shared Components
  leftSection: {
    marginBottom: 16,
  },
  rightSection: {
    marginBottom: 12,
  },
  contactContainer: {
    gap: 4,
  },
  contactText: {
    fontSize: 9,
    color: "#333",
    lineHeight: 12,
    flexWrap: "wrap", // Prevent awkward wrapping out of bounds
  },
  contactTextCentered: {
    fontSize: 10,
    color: "#333",
  },
  boldText: {
    fontWeight: "bold",
    color: "#333",
  },
  bodyText: {
    fontSize: 9,
    color: "#333",
    lineHeight: 13,
    textAlign: "left", // Modern ATS uses left align usually
  },
  listContainer: {
    gap: 2,
  },
  listItem: {
    fontSize: 9,
    color: "#333",
    lineHeight: 13,
  },

  // Item Styles
  itemContainer: {
    marginBottom: 8,
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemTitleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  itemSubtitle: {
    fontSize: 9,
    color: "#000",
  },
  itemDate: {
    fontSize: 9,
    color: "#555",
    marginBottom: 2,
  },
  itemDateItalic: {
    fontSize: 9,
    color: "#555",
    fontStyle: "italic",
    marginBottom: 2,
  },

  // Navigation Footer
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: { fontSize: 15, fontWeight: "700", color: "#4b5563" },
  continueButton: {
    flex: 2, // Give continue button more weight
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: { fontSize: 15, fontWeight: "700", color: "white" },
});
