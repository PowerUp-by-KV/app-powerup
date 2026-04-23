import { useState } from "react";

interface ProfileFormData {
  name: string;
  mobile: string;
  dob: string;
  college: string;
}

export function useProfile() {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    mobile: "",
    dob: "",
    college: "",
  });

  const updateField = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): { isValid: boolean; error?: string } => {
    if (!formData.name || !formData.mobile || !formData.dob || !formData.college) {
      return { isValid: false, error: "Please fill all fields" };
    }

    if (formData.mobile.trim().length < 10 || formData.mobile.trim().length > 20) {
      return { isValid: false, error: "Mobile number must be 10 to 20 characters" };
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dob.trim())) {
      return { isValid: false, error: "Date of birth must be DD/MM/YYYY" };
    }

    return { isValid: true };
  };

  const resetForm = () => {
    setFormData({
      name: "",
      mobile: "",
      dob: "",
      college: "",
    });
  };

  return {
    formData,
    updateField,
    validateForm,
    resetForm,
  };
}
