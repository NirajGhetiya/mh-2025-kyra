import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { StepProps } from "@/types/kyc";
import axiosInstance from '@/api/axiosInstance';

interface AddressData {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const AddressStep = ({ formData, setFormData, isError }: StepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (
      !formData.permanentAddress ||
      Object.values(formData.permanentAddress).every((value) => value === "") ||
      !formData.corporateAddress ||
      Object.values(formData.corporateAddress).every((value) => value === "")
    ) {
      return;
    }
    const addressesAreSame =
      JSON.stringify(formData.permanentAddress) ===
      JSON.stringify(formData.corporateAddress);

    if (addressesAreSame && !formData.isSameAddress) {
      setFormData({ ...formData, isSameAddress: true });
    }
  }, []);

  useEffect(() => {
    if (isError) {
      Object.keys(formData.permanentAddress).forEach((field) => {
        const key = `permanent_${field}`;
        const value = formData.permanentAddress[field as keyof typeof formData.permanentAddress];
        validateField(key, value);
      });

      if (!formData.isSameAddress) {
        Object.keys(formData.corporateAddress).forEach((field) => {
          const key = `corporate_${field}`;
          const value = formData.corporateAddress[field as keyof typeof formData.corporateAddress];
          validateField(key, value);
        });
      }
    }
  }, [isError, formData]);

  const fetchAddressFromZipCode = async (zipCode: string): Promise<Partial<AddressData>> => {
    try {
      const response = await axiosInstance.get(`/ai/pin/data?pin_code=${zipCode}`);
      
      const data = response.data?.data;
      if (!data) return {};

      const capitalize = (value: string) =>
        value
          .toLowerCase()
          .replace(/\b\w/g, char => char.toUpperCase());

      return {
        city: capitalize(data.district || ""),
        state: capitalize(data.state || ""),
        country: "India"
      };
    } catch (error) {
      console.error("Failed to fetch address from PIN:", error);
      return {};
    }
  };

  const handleZipCodeChange = async (
    addressType: "permanent" | "corporate",
    zipCode: string
  ) => {
    const key = `${addressType}_zipCode` as const;
    
    setErrors((prev) => ({ ...prev, [key]: "" }));

    if (!/^\d{6}$/.test(zipCode)) {
      setErrors((prev) => ({
        ...prev,
        [key]: "Invalid Pin Code format (6 digits required)",
      }));
      return;
    }

    try {
      const addressData = await fetchAddressFromZipCode(zipCode);
      
      if (Object.keys(addressData).length > 0) {
        const newAddress = {
          ...formData[`${addressType}Address`],
          zipCode,
          city: addressData.city || "",
          state: addressData.state || "",
          country: addressData.country || "",
        };

        if (formData.isSameAddress && addressType === "permanent") {
          setFormData({
            ...formData,
            permanentAddress: newAddress,
            corporateAddress: newAddress,
          });

          Object.keys(newAddress).forEach((field) => {
            const value = newAddress[field as keyof AddressData];
            validateField(`permanent_${field}`, value);
            validateField(`corporate_${field}`, value);
          });
        } else {
          setFormData({
            ...formData,
            [`${addressType}Address`]: newAddress,
          });
          
          Object.keys(newAddress).forEach((field) => {
            const value = newAddress[field as keyof AddressData];
            validateField(`${addressType}_${field}`, value);
          });
        }
      } else {
        const newAddress = {
          ...formData[`${addressType}Address`],
          zipCode,
          city: "",
          state: "",
          country: "",
        };

        if (formData.isSameAddress && addressType === "permanent") {
          setFormData({
            ...formData,
            permanentAddress: newAddress,
            corporateAddress: newAddress,
          });
        } else {
          setFormData({
            ...formData,
            [`${addressType}Address`]: newAddress,
          });
        }
        
        setErrors((prev) => ({
          ...prev,
          [key]: "Pincode not found",
        }));
      }
    } catch (error) {
      console.error(`Error fetching address for ${addressType} Pincode:`, error);
      setErrors((prev) => ({
        ...prev,
        [key]: "Failed to fetch address details",
      }));
    }
  };

  const validateField = (field: string, value: string) => {
    let error = "";
    switch (field) {
      case "permanent_address":
      case "corporate_address":
        if (!value.trim()) error = "Street address is required";
        break;
      case "permanent_city":
      case "corporate_city":
        if (!value.trim()) error = "City is required";
        break;
      case "permanent_state":
      case "corporate_state":
        if (!value.trim()) error = "State is required";
        break;
      case "permanent_zipCode":
      case "corporate_zipCode":
        if (!value.trim()) error = "Pincode is required";
        else if (!/^\d{6}$/.test(value)) error = "Invalid Pincode format (6 digits)";
        break;
      case "permanent_country":
      case "corporate_country":
        if (!value.trim()) error = "Country is required";
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleChange = (
    addressType: "permanent" | "corporate",
    field: keyof AddressData,
    value: string
  ) => {
    if (field === "city" || field === "state" || field === "country") {
      return;
    }

    const key = `${addressType}_${field}` as const;
    const newAddress = { ...formData[`${addressType}Address`], [field]: value };

    if (formData.isSameAddress && addressType === "permanent") {
      setFormData({
        ...formData,
        permanentAddress: newAddress,
        corporateAddress: newAddress,
      });
      validateField(`permanent_${field}`, value);
      validateField(`corporate_${field}`, value);
    } else {
      setFormData({
        ...formData,
        [`${addressType}Address`]: newAddress,
      });
      validateField(key, value);
    }
  };

  const handleSameAddressChange = (checked: boolean) => {
    if (checked) {
      const syncedAddress = { ...formData.permanentAddress };
      setFormData({
        ...formData,
        isSameAddress: true,
        corporateAddress: syncedAddress,
      });

      const newErrors = { ...errors };
      ["address", "city", "state", "zipCode", "country"].forEach((field) => {
        const permKey = `permanent_${field}`;
        const corpKey = `corporate_${field}`;
        newErrors[corpKey] = newErrors[permKey] || "";
      });
      setErrors(newErrors);
    } else {
      setFormData({
        ...formData,
        isSameAddress: false,
        corporateAddress: {
          streetAddress: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
      });

      const newErrors = { ...errors };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith("corporate_")) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  const required = <span className="text-red-500">*</span>;

  return (
    <div className="space-y-8">
      <div>
      <h2 className="text-2xl font-semibold mb-4 
        bg-gradient-to-r from-blue-600 to-purple-600 
        bg-clip-text text-transparent inline-block"
      >
        Permanent Address
      </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>
              Street Address {required}
            </Label>
            <Input
              value={formData.permanentAddress.streetAddress}
              onChange={(e) =>
                handleChange("permanent", "streetAddress", e.target.value)
              }
              placeholder="Hall 1, Bombay Exhibition Centre"
              className="focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors.permanent_address && (
              <p className="text-red-500 text-sm">{errors.permanent_address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Pincode {required}
            </Label>
            <div className="relative">
              <Input
                value={formData.permanentAddress.zipCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  if (value.length === 6) {
                    handleZipCodeChange("permanent", value);
                  } else {
                    handleChange("permanent", "zipCode", value);
                  }
                }}
                placeholder="400063"
                maxLength={6}
                className="focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            {errors.permanent_zipCode && (
              <p className="text-red-500 text-sm">{errors.permanent_zipCode}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              City {required}
            </Label>
            <Input
              value={formData.permanentAddress.city}
              readOnly
              className="bg-gradient-to-r from-blue-50 to-purple-50 cursor-not-allowed border-purple-200"
              placeholder="Auto-filled from Pincode"
            />
            {errors.permanent_city && (
              <p className="text-red-500 text-sm">{errors.permanent_city}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              State {required}
            </Label>
            <Input
              value={formData.permanentAddress.state}
              readOnly
              className="bg-gradient-to-r from-blue-50 to-purple-50 cursor-not-allowed border-purple-200"
              placeholder="Auto-filled from Pincode"
            />
            {errors.permanent_state && (
              <p className="text-red-500 text-sm">{errors.permanent_state}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Country {required}
            </Label>
            <Input
              value={formData.permanentAddress.country}
              readOnly
              className="bg-gradient-to-r from-blue-50 to-purple-50 cursor-not-allowed border-purple-200"
              placeholder="Auto-filled from Pincode"
            />
            {errors.permanent_country && (
              <p className="text-red-500 text-sm">{errors.permanent_country}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="same-address"
          checked={formData.isSameAddress || false}
          onCheckedChange={handleSameAddressChange}
          className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
        />
        <Label htmlFor="same-address" className="cursor-pointer">
          Current address is same as permanent address
        </Label>
      </div>

      {!formData.isSameAddress && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 
                bg-gradient-to-r from-blue-600 to-purple-600 
                bg-clip-text text-transparent inline-block"
        >
            Current Address
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>
                Street Address {required}
              </Label>
              <Input
                value={formData.corporateAddress.streetAddress}
                onChange={(e) =>
                  handleChange("corporate", "streetAddress", e.target.value)
                }
                placeholder="Hall 1, Bombay Exhibition Centre"
                className="focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.corporate_address && (
                <p className="text-red-500 text-sm">{errors.corporate_address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                PinCode {required}
              </Label>
              <div className="relative">
                <Input
                  value={formData.corporateAddress.zipCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    if (value.length === 6) {
                      handleZipCodeChange("corporate", value);
                    } else {
                      handleChange("corporate", "zipCode", value);
                    }
                  }}
                  placeholder="400063"
                  maxLength={6}
                  className="focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              {errors.corporate_zipCode && (
                <p className="text-red-500 text-sm">{errors.corporate_zipCode}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                City {required}
              </Label>
              <Input
                value={formData.corporateAddress.city}
                readOnly
                className="bg-gradient-to-r from-blue-50 to-purple-50 cursor-not-allowed border-purple-200"
                placeholder="Auto-filled from Pincode"
              />
              {errors.corporate_city && (
                <p className="text-red-500 text-sm">{errors.corporate_city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                State {required}
              </Label>
              <Input
                value={formData.corporateAddress.state}
                readOnly
                className="bg-gradient-to-r from-blue-50 to-purple-50 cursor-not-allowed border-purple-200"
                placeholder="Auto-filled from Pincode"
              />
              {errors.corporate_state && (
                <p className="text-red-500 text-sm">{errors.corporate_state}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Country {required}
              </Label>
              <Input
                value={formData.corporateAddress.country}
                readOnly
                className="bg-gradient-to-r from-blue-50 to-purple-50 cursor-not-allowed border-purple-200"
                placeholder="Auto-filled from Pincode"
              />
              {errors.corporate_country && (
                <p className="text-red-500 text-sm">{errors.corporate_country}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressStep;