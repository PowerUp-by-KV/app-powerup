import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput as RNTextInput,
  Modal,
  FlatList,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/Themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateContact,
  updateSummary,
  selectBuilderDraft,
  selectBuilderIsSaving,
  selectBuilderLastSavedAt,
  setCurrentStep,
  resetBuilderState,
} from "@/store/slices/resume-builder.slice";
import { TextInput } from "@/features/resume/components/TextInput";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import {
  validatePhoneDigits,
  getCountryCodesList,
  getExpectedDigitCount,
  type CountryCodeItem,
} from "@/utils/phoneValidation";
import { getLocationSuggestions, type LocationSuggestion } from "@/utils/locationAutocomplete";
import { useAutoSave } from "../hooks/useAutoSave";
import { useRouter } from "expo-router";

export function Step1ContactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const draftResume = useAppSelector(selectBuilderDraft);
  const isSaving = useAppSelector(selectBuilderIsSaving);
  const lastSavedAt = useAppSelector(selectBuilderLastSavedAt);

  const contact = draftResume.contact;
  const summary = draftResume.summary;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showCountryCodeModal, setShowCountryCodeModal] = useState(false);
  const [countryCodeSearch, setCountryCodeSearch] = useState("");

  // Extract phone number suffix if it already contains the country code
  const getInitialPhone = (): string => {
    if (!contact.phone) return "";
    const parts = contact.phone.split(" ");
    if (parts.length > 1) {
      return parts[1] || "";
    }
    return contact.phone;
  };

  // Extract country code if present, default to +91
  const getInitialCountryCode = (): string => {
    if (!contact.phone) return "+91";
    const parts = contact.phone.split(" ");
    if (parts.length > 1 && parts[0]?.startsWith("+")) {
      return parts[0] || "+91";
    }
    if (contact.phone.startsWith("+")) {
      const match = getCountryCodesList().find((item) => contact.phone.startsWith(item.code));
      if (match) return match.code;
    }
    return "+91";
  };

  const initialCountryCode = getInitialCountryCode();
  const initialPhone = getInitialPhone();

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(initialCountryCode);
  const [phoneNumber, setPhoneNumber] = useState<string>(initialPhone);
  const [phoneValidation, setPhoneValidation] = useState<{
    message: string;
    isValid: boolean;
  } | null>(() => {
    if (initialPhone.trim().length > 0) {
      return validatePhoneDigits(initialCountryCode, initialPhone);
    }
    return null;
  });

  const lastSyncedPhoneRef = React.useRef(contact.phone || "");

  // Sync state if Redux draft phone updates (e.g. after async loading or reset)
  React.useEffect(() => {
    const reduxPhone = (contact.phone || "").trim();
    if (reduxPhone !== lastSyncedPhoneRef.current) {
      lastSyncedPhoneRef.current = reduxPhone;
      if (reduxPhone) {
        const parts = reduxPhone.split(" ");
        let code = "+91";
        let num = reduxPhone;
        if (parts.length > 1 && parts[0]?.startsWith("+")) {
          code = parts[0] || "+91";
          num = parts.slice(1).join(" ");
        } else if (reduxPhone.startsWith("+")) {
          const match = getCountryCodesList().find((item) => reduxPhone.startsWith(item.code));
          if (match) {
            code = match.code;
            num = reduxPhone.slice(match.code.length).trim();
          }
        }
        setSelectedCountryCode(code);
        setPhoneNumber(num);
        if (num.trim().length > 0) {
          setPhoneValidation(validatePhoneDigits(code, num));
        } else {
          setPhoneValidation(null);
        }
      } else {
        // Redux phone is empty (e.g. after reset) - clear local input state
        setSelectedCountryCode("+91");
        setPhoneNumber("");
        setPhoneValidation(null);
      }
    }
  }, [contact.phone]);

  const handleCancel = () => {
    const performExit = () => {
      dispatch(resetBuilderState());
      router.replace("/resume" as never);
    };

    if (Platform.OS === "web") {
      // Alert.alert is a silent no-op on web — use window.confirm instead
      if (window.confirm("Exit Resume Builder?\n\nYour progress is saved as a draft.")) {
        performExit();
      }
    } else {
      Alert.alert(
        "Exit Resume Builder",
        "Are you sure you want to exit? Your progress is saved as a draft.",
        [
          { text: "Continue Editing", style: "cancel" },
          { text: "Exit", style: "destructive", onPress: performExit },
        ],
      );
    }
  };

  // Hook up debounced auto-save
  useAutoSave();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!contact.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!contact.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!phoneNumber?.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const validation = validatePhoneDigits(selectedCountryCode, phoneNumber);
      if (!validation.isValid) {
        newErrors.phone = validation.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getFilteredCountryCodes = () => {
    const allCodes = getCountryCodesList();
    if (!countryCodeSearch.trim()) return allCodes;

    const query = countryCodeSearch.toLowerCase();
    return allCodes.filter(
      (item) =>
        item.code.toLowerCase().includes(query) || item.country.toLowerCase().includes(query),
    );
  };

  const handleNext = () => {
    // Sync final phone formatting with country code suffix
    if (phoneNumber.trim()) {
      dispatch(updateContact({ phone: `${selectedCountryCode} ${phoneNumber}` }));
    }
    if (validateForm()) {
      dispatch(setCurrentStep(2));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        <View style={styles.container}>
          {/* Step Indicator Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.titleRow}>
                <Text style={styles.stepNumber}>Step 1 of 5</Text>
                {isSaving ? (
                  <Text style={styles.saveBadge}>Saving...</Text>
                ) : lastSavedAt ? (
                  <Text style={styles.savedBadge}>Saved {lastSavedAt}</Text>
                ) : null}
              </View>
              <Text style={styles.headerTitle}>Contact Details</Text>
              <Text style={styles.headerSubtitle}>Let's start with your professional details</Text>
            </View>
          </View>

          {/* Form Containers */}
          <View style={styles.formContainer}>
            {/* Personal Details card */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="person" size={20} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Personal Details</Text>
              </View>

              <TextInput
                label="Full Name"
                required
                placeholder="e.g., John Doe"
                value={contact.fullName}
                onChangeText={(text) => {
                  dispatch(updateContact({ fullName: text }));
                  if (errors.fullName) setErrors({ ...errors, fullName: "" });
                }}
                error={errors.fullName}
              />

              <TextInput
                label="Email"
                required
                keyboardType="email-address"
                placeholder="e.g., john.doe@example.com"
                value={contact.email}
                onChangeText={(text) => {
                  dispatch(updateContact({ email: text }));
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                error={errors.email}
              />

              {/* Phone Input with dropdown list selection */}
              <View style={{ marginBottom: 16 }}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Phone</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <View style={styles.phoneInputRow}>
                  <Pressable
                    style={styles.countryCodeButton}
                    onPress={() => setShowCountryCodeModal(true)}
                  >
                    <Text style={styles.countryCodeText}>{selectedCountryCode}</Text>
                    <MaterialIcons name="arrow-drop-down" size={18} color="#2563EB" />
                  </Pressable>
                  <RNTextInput
                    style={[styles.phoneInput, errors.phone && styles.phoneInputError]}
                    placeholder="e.g., 9876543210"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    maxLength={getExpectedDigitCount(selectedCountryCode) || 15}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^\d]/g, "");
                      setPhoneNumber(cleaned);
                      const combined = `${selectedCountryCode} ${cleaned}`.trim();
                      lastSyncedPhoneRef.current = combined;
                      dispatch(updateContact({ phone: combined }));
                      if (errors.phone) setErrors({ ...errors, phone: "" });

                      if (cleaned.trim().length > 0) {
                        const validation = validatePhoneDigits(selectedCountryCode, cleaned);
                        setPhoneValidation(validation);
                      } else {
                        setPhoneValidation(null);
                      }
                    }}
                  />
                </View>
                {phoneValidation && (
                  <Text
                    style={[
                      styles.phoneHint,
                      phoneValidation.isValid ? styles.hintSuccess : styles.hintError,
                    ]}
                  >
                    {phoneValidation.isValid ? "✓ " : "ℹ "} {phoneValidation.message}
                  </Text>
                )}
                {!!errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              {/* Location Autocomplete input */}
              <View style={{ marginBottom: 16 }}>
                <TextInput
                  label="Location"
                  placeholder="e.g., Mumbai, Maharashtra"
                  value={contact.location}
                  onChangeText={(text) => {
                    dispatch(updateContact({ location: text }));
                    if (text.trim().length > 0) {
                      const suggestions = getLocationSuggestions(text);
                      setLocationSuggestions(suggestions);
                      setShowLocationSuggestions(suggestions.length > 0);
                    } else {
                      setLocationSuggestions([]);
                      setShowLocationSuggestions(false);
                    }
                  }}
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {locationSuggestions.map((suggestion) => (
                      <Pressable
                        key={suggestion.id}
                        style={styles.suggestionItem}
                        onPress={() => {
                          dispatch(updateContact({ location: suggestion.displayText }));
                          setLocationSuggestions([]);
                          setShowLocationSuggestions(false);
                        }}
                      >
                        <View style={styles.suggestionContent}>
                          <MaterialIcons
                            name={suggestion.type === "country" ? "public" : "place"}
                            size={14}
                            color="#2563EB"
                            style={{ marginRight: 6 }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.suggestionText}>{suggestion.name}</Text>
                            <Text style={styles.suggestionSubText}>
                              {suggestion.type.toUpperCase()} • {suggestion.country || ""}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Social Details card */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="link" size={20} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Optional Links</Text>
              </View>

              <TextInput
                label="LinkedIn"
                placeholder="e.g., https://linkedin.com/in/username"
                value={contact.linkedin}
                onChangeText={(text) => dispatch(updateContact({ linkedin: text }))}
              />

              <TextInput
                label="GitHub / Portfolio"
                placeholder="e.g., https://github.com/username"
                value={contact.github}
                onChangeText={(text) => dispatch(updateContact({ github: text }))}
              />
            </View>

            {/* Professional Summary card */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons
                  name="description"
                  size={20}
                  color="#2563EB"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.sectionTitle}>Professional Summary</Text>
              </View>

              <TextInput
                label="Summary"
                multiline
                numberOfLines={4}
                placeholder="Write a brief professional profile summary here..."
                value={summary}
                onChangeText={(text) => dispatch(updateSummary(text))}
              />
            </View>

            {/* Navigation Buttons footer */}
            <View style={styles.footerRow}>
              <Pressable onPress={handleCancel} style={styles.backButton}>
                <Feather name="arrow-left" size={16} color="#4b5563" style={{ marginRight: 6 }} />
                <Text style={styles.backButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleNext} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>Next Screen</Text>
                <Feather name="arrow-right" size={16} color="white" style={{ marginLeft: 6 }} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Country Code Modal */}
        <Modal
          visible={showCountryCodeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCountryCodeModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContent, { paddingBottom: Math.max(16, insets.bottom) }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Country Code</Text>
                <Pressable onPress={() => setShowCountryCodeModal(false)}>
                  <MaterialIcons name="close" size={20} color="#374151" />
                </Pressable>
              </View>
              <View style={styles.modalSearchBox}>
                <MaterialIcons name="search" size={18} color="#9ca3af" />
                <RNTextInput
                  style={styles.modalSearchInput}
                  placeholder="Search country..."
                  value={countryCodeSearch}
                  onChangeText={setCountryCodeSearch}
                />
              </View>
              <FlatList
                data={getFilteredCountryCodes()}
                keyExtractor={(item) => item.code}
                renderItem={({ item }: { item: CountryCodeItem }) => (
                  <Pressable
                    style={styles.countryItem}
                    onPress={() => {
                      setSelectedCountryCode(item.code);
                      setPhoneNumber("");
                      setPhoneValidation(null);
                      setShowCountryCodeModal(false);
                      setCountryCodeSearch("");
                      const combined = `${item.code} `.trim();
                      lastSyncedPhoneRef.current = combined;
                      dispatch(updateContact({ phone: combined }));
                    }}
                  >
                    <Text style={styles.countryCode}>{item.code}</Text>
                    <Text style={styles.countryName}>{item.country}</Text>
                  </Pressable>
                )}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  contentContainer: {
    paddingBottom: 48,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepNumber: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "600",
  },
  saveBadge: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#d97706",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savedBadge: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#059669",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  formContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  requiredStar: {
    color: "#ef4444",
    fontSize: 14,
    marginLeft: 3,
  },
  phoneInputRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
    backgroundColor: "white",
  },
  phoneInputError: {
    backgroundColor: "#fef2f2",
  },
  phoneHint: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  hintSuccess: {
    color: "#16a34a",
  },
  hintError: {
    color: "#dc2626",
  },
  errorText: {
    fontSize: 11,
    color: "#dc2626",
    marginTop: 4,
  },
  suggestionsContainer: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginTop: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  suggestionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  suggestionSubText: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "75%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  modalSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 6,
    color: "#111827",
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  countryCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563eb",
    width: 60,
  },
  countryName: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
});
