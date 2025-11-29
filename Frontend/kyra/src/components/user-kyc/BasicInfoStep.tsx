import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/user-kyc/FileUpload";
import type { StepProps } from "@/types/kyc";

const FAKE_MOBILE_PATTERNS = [
  /^0{10}$/,
  /^1{10}$/,
  /^1234567890$/,
  /^9999999999$/,
  /^1111111111$/,
  /^2222222222$/,
  /^9876543210$/,
];

const BasicInfoStep = ({ formData, setFormData, isError }: StepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const normalizeDOB = (date: string) => {
    if (!date) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [day, month, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return "";
  };

  useEffect(() => {
    if (isError) {
      Object.keys(formData).forEach((field) => {
        validateField(field as keyof typeof formData, formData[field as keyof typeof formData]);
      });
    }
  }, [isError, formData]);

  const validateField = (field: string, rawValue: any) => {
    let value = typeof rawValue === "string" ? rawValue :  rawValue;
    let error = "";

    switch (field) {
      case "name":
      case "fatherName":
        if (!value) {
          error = "This field is required";
        } else if (value.length > 100) {
          error = "Name is too long (max 100 characters)";
        } else if (!/^[A-Za-z\s\.'\-]+$/.test(value)) {
          error = "Only letters, spaces, apostrophes, and hyphens allowed";
        }
        break;

      case "emailId":
        if (!value) {
          error = "Email is required";
        } else if (value.length > 254) {
          error = "Email is too long";
        } else if (
          !/^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
        ) {
          error = "Invalid email format";
        }
        break;

      case "mobileNo":
        const digitsOnly = value.replace(/\D/g, "");
        if (!value) {
          error = "Mobile number is required";
        } else if (digitsOnly.length !== 10) {
          error = "Mobile number must be exactly 10 digits";
        } else if (!/^\d{10}$/.test(digitsOnly)) {
          error = "Only digits allowed";
        } else if (FAKE_MOBILE_PATTERNS.some((p) => p.test(digitsOnly))) {
          error = "Please enter a valid mobile number";
        } else if (/^(\d)\1{9}$/.test(digitsOnly)) {
          error = "Repeating digits are not allowed";
        }
        if (!error && digitsOnly !== value) {
          setFormData({ ...formData, mobileNo: digitsOnly });
        }
        value = digitsOnly;
        break;

      case "gender":
        if (!value || !["male", "female", "other"].includes(value)) {
          error = "Please select a valid gender";
        }
        break;

      case "dob":
        if (!value) {
          error = "Date of birth is required";
        } else {
          const today = new Date();
          const birthDate = new Date(value);
          const age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          const finalAge = m < 0 || (m === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

          if (isNaN(birthDate.getTime())) {
            error = "Invalid date";
          } else if (birthDate > today) {
            error = "Date of birth cannot be in the future";
          } else if (finalAge < 18) {
            error = "You must be at least 18 years old";
          } else if (finalAge > 120) {
            error = "Date of birth seems unrealistic";
          }
        }
        break;

      case "photoImage":
        if (!value) {
          error = "Photo is required";
        } else if (typeof value === "object" && value instanceof File) {
          const file = value as File;
          const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
          const maxSize = 5 * 1024 * 1024;

          if (!validTypes.includes(file.type)) {
            error = "Only JPG, PNG, or WebP images are allowed";
          } else if (file.size > maxSize) {
            error = "Photo must be under 5MB";
          } else if (/\.(exe|bat|sh|js|php)$/i.test(file.name)) {
            error = "Invalid file type";
          }
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleChange = (field: string, value: any) => {
    if (typeof value === "string") {
      value = value;
    }

    setFormData({ ...formData, [field]: value });
    validateField(field, value);
  };

  const required = <span className="text-red-500">*</span>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">
        Personal Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name {required}</Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter full name"
            maxLength={100}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fatherName">Father's Name {required}</Label>
          <Input
            id="fatherName"
            value={formData.fatherName || ""}
            onChange={(e) => handleChange("fatherName", e.target.value)}
            placeholder="Enter father's name"
            maxLength={100}
          />
          {errors.fatherName && <p className="text-red-500 text-sm">{errors.fatherName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailId">Email {required}</Label>
          <Input
            id="emailId"
            type="email"
            value={formData.emailId || ""}
            onChange={(e) => handleChange("emailId", e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.emailId && <p className="text-red-500 text-sm">{errors.emailId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobileNo">Mobile No. {required}</Label>
          <Input
            id="mobileNo"
            value={formData.mobileNo || ""}
            onChange={(e) => handleChange("mobileNo", e.target.value)}
            placeholder="9876543210"
            maxLength={10}
            inputMode="numeric"
          />
          {errors.mobileNo && <p className="text-red-500 text-sm">{errors.mobileNo}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender {required}</Label>
          <select
            id="gender"
            className="border rounded-md p-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={formData.gender || ""}
            onChange={(e) => handleChange("gender", e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth {required}</Label>
          <Input
            id="dob"
            type="date"
            value={normalizeDOB(formData.dob || "")}
            onChange={(e) => handleChange("dob", e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
          {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}
        </div>
      </div>

      <div className="mt-6">
        <FileUpload
          label={
            <>
              Upload Photo {required}
            </>
          }
          value={formData.photoImage}
          onChange={(file) => handleChange("photoImage", file)}
          accept="image/jpeg,image/jpg,image/png,image/webp"
        />
        {errors.photoImage && <p className="text-red-500 text-sm mt-1">{errors.photoImage}</p>}
      </div>
    </div>
  );
};

export default BasicInfoStep;