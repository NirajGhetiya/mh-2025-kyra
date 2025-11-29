import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/user-kyc/FileUpload";
import { StepProps, DocumentTypeValue } from "@/types/kyc";
import axiosInstance from "@/api/axiosInstance";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const documentOptions: DocumentTypeValue[] = [
  "AadhaarCard",
  "DrivingLicense",
  "PanCard",
  "Passport",
  "VoterCard",
];

const DocumentsStep = ({ formData, setFormData, isError }: StepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const required = <span className="text-red-500">*</span>;
  const { id } = useParams<{ id: string }>();

  const isSameAddress = formData.isSameAddress || false;
  const corporateFilteredOptions = documentOptions.filter(
    (opt) => opt !== formData.permanentDocType?.ovdType
  );

  useEffect(() => {
    if (isError) {
      const newErrors: Record<string, string> = {};
      
      if (!formData.permanentDocType?.ovdType) {
        newErrors.permanentDocType = "Document type is required";
      }
      if (!formData.permanentDocType?.ovdImage) {
        newErrors.permanentDocImage = "Document image is required";
      }
      
      if (!isSameAddress) {
        if (!formData.corporateDocType?.ovdType) {
          newErrors.corporateDocType = "Document type is required";
        }
        if (!formData.corporateDocType?.ovdImage) {
          newErrors.corporateDocImage = "Document image is required";
        }
      }
      
      setErrors(newErrors);
    }
  }, [isError, formData, isSameAddress]);

  const validateField = (field: string, value: any) => {
    let error = "";
    switch (field) {
      case "permanentDocType":
        if (!value?.ovdType) error = "Document type is required";
        break;
      case "permanentDocImage":
        if (!value) error = "Document image is required";
        break;
      case "corporateDocType":
        if (!value?.ovdType) error = "Document type is required";
        break;
      case "corporateDocImage":
        if (!value) error = "Document image is required";
        break;
    }
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    return error === "";
  };

  const handleDocumentTypeChange = (ovdType: DocumentTypeValue, isPermanent: boolean) => {
    const field = isPermanent ? "permanentDocType" : "corporateDocType";
    
    if (isSameAddress && isPermanent) {
      const newPermanentValue = {
        ...formData.permanentDocType,
        ovdType,
      };
      
      setFormData({
        ...formData,
        permanentDocType: newPermanentValue,
        corporateDocType: newPermanentValue,
      });
      
      validateField("permanentDocType", newPermanentValue);
      validateField("corporateDocType", newPermanentValue);
    } else {
      const newValue = {
        ...formData[field],
        ovdType,
      };
      setFormData({
        ...formData,
        [field]: newValue,
      });
      validateField(field, newValue);
    }
  };

  const handleFileUpload = async (ovdImage: string, isPermanent: boolean) => {
    const docTypeField = isPermanent ? "permanentDocType" : "corporateDocType";
    const imageField = isPermanent ? "permanentDocImage" : "corporateDocImage";
  
    try {
      const response = await axiosInstance.post(`/ai/tamper-check`, {
        image_base64: ovdImage,
        kyc_id: id
      });
  
      if (!response.data.success) {
        toast.error(response.data.message || "Tamper check failed. Please reupload the document.");
        return;
      }
  
      if (response.data.data.is_tampered) {
        toast.error("The uploaded document appears to be tampered. Please upload a valid document.");
        ovdImage = "";
      }
    } catch (error) {
      console.error("Tamper check API error:", error);
      setErrors(prev => ({ ...prev, [imageField]: 'Unable to verify document. Please try again' }));
      return;
    }
  
    const updatedDocType = { ...formData[docTypeField], ovdImage };
  
    if (isSameAddress && isPermanent) {
      setFormData({
        ...formData,
        permanentDocType: updatedDocType,
        corporateDocType: updatedDocType,
      });
  
      validateField("permanentDocType", updatedDocType);
      validateField("corporateDocType", updatedDocType);
      validateField("permanentDocImage", ovdImage);
      validateField("corporateDocImage", ovdImage);
    } else {
      setFormData({ ...formData, [docTypeField]: updatedDocType });
      validateField(docTypeField, updatedDocType);
      validateField(imageField, ovdImage);
    }
  };
  

  return (
    <div className="space-y-8">
      {isSameAddress ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4 
                  bg-gradient-to-r from-blue-600 to-purple-600 
                  bg-clip-text text-transparent inline-block"
          >Address Proof</h2>
          <p className="text-muted-foreground mb-4">
            Since both addresses are the same, you only need to upload one address proof document.
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="permanentDocumentType">
                Document Type {required}
              </Label>
              <select
                id="permanentDocumentType"
                className="border rounded-md p-2 w-full"
                value={formData.permanentDocType?.ovdType || ""}
                onChange={(event) =>
                  handleDocumentTypeChange(event.target.value as DocumentTypeValue, true)
                }
              >
                <option value="">Select document type</option>
                {documentOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.permanentDocType && (
                <p className="text-red-500 text-sm">{errors.permanentDocType}</p>
              )}
            </div>
            <FileUpload
              label={<><span>Upload Address Proof Document {required}</span></>}
              value={formData.permanentDocType?.ovdImage}
              onChange={(image) => handleFileUpload(image, true)}
            />
            {errors.permanentDocImage && (
              <p className="text-red-500 text-sm">{errors.permanentDocImage}</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-2xl font-semibold mb-4 
                  bg-gradient-to-r from-blue-600 to-purple-600 
                  bg-clip-text text-transparent inline-block"
            >Permanent Address Proof</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="permanentDocumentType">
                  Document Type {required}
                </Label>
                <select
                  id="permanentDocumentType"
                  className="border rounded-md p-2 w-full"
                  value={formData.permanentDocType?.ovdType || ""}
                  onChange={(event) =>
                    handleDocumentTypeChange(event.target.value as DocumentTypeValue, true)
                  }
                >
                  <option value="">Select document type</option>
                  {documentOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.permanentDocType && (
                  <p className="text-red-500 text-sm">{errors.permanentDocType}</p>
                )}
              </div>
              <FileUpload
                label={<><span>Upload Permanent Address Proof Document {required}</span></>}
                value={formData.permanentDocType?.ovdImage}
                onChange={(image) => handleFileUpload(image, true)}
              />
              {errors.permanentDocImage && (
                <p className="text-red-500 text-sm">{errors.permanentDocImage}</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 
                  bg-gradient-to-r from-blue-600 to-purple-600 
                  bg-clip-text text-transparent inline-block"
            >Current Address Proof</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="corporateDocumentType">
                  Document Type {required}
                </Label>
                <select
                  id="corporateDocumentType"
                  className="border rounded-md p-2 w-full"
                  value={formData.corporateDocType?.ovdType || ""}
                  onChange={(event) =>
                    handleDocumentTypeChange(event.target.value as DocumentTypeValue, false)
                  }
                >
                  <option value="">Select document type</option>
                  {corporateFilteredOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.corporateDocType && (
                  <p className="text-red-500 text-sm">{errors.corporateDocType}</p>
                )}
              </div>
              <FileUpload
                label={<><span>Upload Current Address Proof Document {required}</span></>}
                value={formData.corporateDocType?.ovdImage}
                onChange={(image) => handleFileUpload(image, false)}
              />
              {errors.corporateDocImage && (
                <p className="text-red-500 text-sm">{errors.corporateDocImage}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentsStep;