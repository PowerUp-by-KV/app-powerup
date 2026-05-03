/**
 * Contact & Summary Screen - Step 1 of 4
 * Collect personal contact information and professional summary
 */

import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput as RNTextInput,
  Modal,
  FlatList,
} from "react-native";
import { Text } from "@/components/Themed";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateContact,
  updateSummary,
  selectContact,
  selectSummary,
  nextStep,
} from "@/store/slices/resume.slice";
import { TextInput } from "../components";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import {
  validatePhoneDigits,
  getCountryCodesList,
  getExpectedDigitCount,
} from "@/utils/phoneValidation";
import { getLocationSuggestions } from "@/utils/locationAutocomplete";

export function ContactSummaryScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const contact = useAppSelector(selectContact);
  const summary = useAppSelector(selectSummary);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91"); // Default to India
  const [phoneValidation, setPhoneValidation] = useState<{
    message: string;
    isValid: boolean;
  } | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showCountryCodeModal, setShowCountryCodeModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCodeSearch, setCountryCodeSearch] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!contact?.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!contact?.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!phoneNumber?.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      // Validate phone using country code validation
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
    // Update full phone number with country code before validation
    if (phoneNumber.trim()) {
      dispatch(updateContact({ phone: `${selectedCountryCode} ${phoneNumber}` }));
    }
    if (validateForm()) {
      dispatch(nextStep());
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        {/* Header with Progress */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.stepNumber}>Step 1 of 4</Text>
            <Text style={styles.headerTitle}>Contact & Summary</Text>
            <Text style={styles.headerSubtitle}>{"Let's start with your personal details"}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "25%" }]} />
          </View>
        </View>

        {/* Form Sections */}
        <View style={styles.formContainer}>
          {/* Personal Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={24} color="#2563EB" style={{ marginRight: 10 }} />
              <Text style={styles.sectionTitle}>Personal Details</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Required information for your resume</Text>

            {/* Full Name */}
            <TextInput
              label="Full Name"
              required
              placeholder="John Doe"
              value={contact?.fullName || ""}
              onChangeText={(text) => {
                dispatch(updateContact({ fullName: text }));
                if (errors.fullName) setErrors({ ...errors, fullName: "" });
              }}
              error={errors.fullName}
            />

            {/* Email */}
            <TextInput
              label="Email"
              required
              keyboardType="email-address"
              placeholder="john@example.com"
              value={contact?.email || ""}
              onChangeText={(text) => {
                dispatch(updateContact({ email: text }));
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              error={errors.email}
            />

            {/* Phone with Country Code Selector */}
            <View>
              <View style={{ marginBottom: 8, flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>Phone</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#dc2626", marginLeft: 4 }}>
                  *
                </Text>
              </View>

              <View style={styles.phoneContainer}>
                {/* Country Code Selector */}
                <Pressable
                  style={styles.countryCodeButton}
                  onPress={() => setShowCountryCodeModal(true)}
                >
                  <Text style={styles.countryCodeText}>{selectedCountryCode}</Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color="#2563EB" />
                </Pressable>

                {/* Phone Number Input */}
                <RNTextInput
                  style={[styles.phoneInput, errors.phone && styles.phoneInputError]}
                  placeholder="10-11 digits"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  maxLength={getExpectedDigitCount(selectedCountryCode) || 15}
                  onChangeText={(text) => {
                    // Only allow digits and common phone formatting characters
                    const cleaned = text.replace(/[^\d\s\-()]/g, "");
                    setPhoneNumber(cleaned);
                    if (errors.phone) setErrors({ ...errors, phone: "" });

                    // Validate phone number
                    if (cleaned.trim().length > 0) {
                      const validation = validatePhoneDigits(selectedCountryCode, cleaned);
                      setPhoneValidation(validation);
                    } else {
                      setPhoneValidation(null);
                    }
                  }}
                />
              </View>

              {/* Validation Hint */}
              {phoneValidation && (
                <Text
                  style={[
                    styles.validationHint,
                    phoneValidation.isValid ? styles.validationSuccess : styles.validationError,
                  ]}
                >
                  {phoneValidation.isValid ? "✓ " : "ℹ "} {phoneValidation.message}
                </Text>
              )}

              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Country Code Selector Modal */}
            <Modal
              visible={showCountryCodeModal}
              transparent
              animationType="slide"
              onRequestClose={() => {
                setShowCountryCodeModal(false);
                setCountryCodeSearch("");
              }}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Country Code</Text>
                    <Pressable
                      onPress={() => {
                        setShowCountryCodeModal(false);
                        setCountryCodeSearch("");
                      }}
                    >
                      <MaterialIcons name="close" size={24} color="#111827" />
                    </Pressable>
                  </View>

                  {/* Country Code Search Input */}
                  <View style={styles.searchInputContainer}>
                    <MaterialIcons name="search" size={20} color="#9CA3AF" />
                    <RNTextInput
                      style={styles.searchInput}
                      placeholder="Search by country name or code..."
                      placeholderTextColor="#9CA3AF"
                      value={countryCodeSearch}
                      onChangeText={setCountryCodeSearch}
                    />
                  </View>

                  <FlatList
                    data={getFilteredCountryCodes()}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                      <Pressable
                        style={styles.countryCodeOption}
                        onPress={() => {
                          setSelectedCountryCode(item.code);
                          setPhoneNumber(""); // Reset phone input
                          setPhoneValidation(null);
                          setShowCountryCodeModal(false);
                          setCountryCodeSearch("");
                        }}
                      >
                        <View>
                          <Text style={styles.countryCodeOptionCode}>{item.code}</Text>
                          <Text style={styles.countryCodeOptionCountry}>{item.country}</Text>
                        </View>
                        <Text style={styles.digitCount}>({item.digits} digits)</Text>
                      </Pressable>
                    )}
                  />
                </View>
              </View>
            </Modal>
          </View>

          {/* Optional Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="link" size={24} color="#2563EB" style={{ marginRight: 10 }} />
              <Text style={styles.sectionTitle}>Optional Details</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Make your profile stand out</Text>

            {/* LinkedIn */}
            <TextInput
              label="LinkedIn URL"
              keyboardType="url"
              placeholder="https://linkedin.com/in/johndoe"
              value={contact?.linkedin || ""}
              onChangeText={(text) => dispatch(updateContact({ linkedin: text }))}
            />

            {/* Location */}
            <View style={{ marginBottom: 16 }}>
              <TextInput
                label="Location"
                placeholder="e.g., Mumbai, Maharashtra"
                value={contact?.location || ""}
                onChangeText={(text) => {
                  dispatch(updateContact({ location: text }));
                  // Get location suggestions
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
              {/* Location Suggestions */}
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
                          name={
                            suggestion.type === "country"
                              ? "public"
                              : suggestion.type === "state"
                                ? "location-on"
                                : "place"
                          }
                          size={16}
                          color="#2563EB"
                          style={{ marginRight: 8 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.suggestionText}>{suggestion.name}</Text>
                          <Text style={styles.suggestionType}>
                            {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                            {suggestion.district ? ` • ${suggestion.district}` : ""}
                            {suggestion.state && suggestion.type !== "state"
                              ? ` • ${suggestion.state}`
                              : ""}
                            {suggestion.country ? ` • ${suggestion.country}` : ""}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Professional Summary Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="description"
                size={24}
                color="#2563EB"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.sectionTitle}>Professional Summary</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              A brief overview of your skills and experience
            </Text>

            <TextInput
              label="Summary"
              multiline
              numberOfLines={4}
              placeholder="Write a brief summary of your professional background..."
              value={summary?.text || ""}
              onChangeText={(text) => dispatch(updateSummary(text))}
            />
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleBack}
            >
              <MaterialIcons name="arrow-back" size={20} color="#2563EB" />
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  contentContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 0,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
    marginLeft: 34,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  secondaryButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
  },
  // Phone validation styles
  validationHint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 12,
  },
  validationSuccess: {
    color: "#10b981",
  },
  validationError: {
    color: "#2563EB",
  },
  // Location suggestions styles
  suggestionsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 4,
    overflow: "hidden",
    maxHeight: 300,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  suggestionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  suggestionType: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  // Phone input styles
  phoneContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 85,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  phoneInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  phoneInputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 6,
  },
  // Country code modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  countryCodeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  countryCodeOptionCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 2,
  },
  countryCodeOptionCountry: {
    fontSize: 13,
    color: "#6b7280",
  },
  digitCount: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
  // Country code search styles
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingLeft: 8,
  },
});
