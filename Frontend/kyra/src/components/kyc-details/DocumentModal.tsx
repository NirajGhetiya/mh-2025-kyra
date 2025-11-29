import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Check, AlertTriangle, AlertCircle, X, Eye, ZoomIn, ExternalLink } from "lucide-react";
import { KycMatchResponse } from "@/types/kyc";
import { useState } from "react";

interface DocumentModalProps {
  selectedDoc: "permanent" | "corporate" | null;
  onClose: () => void;
  documentData: {
    docType: string;
    extractedData: KycMatchResponse;
    documentImage: string;
  } | null;
}

interface ValidationCardProps {
  title: string;
  confidence:
    | "High"
    | "Almost_High"
    | "Medium"
    | "Low"
    | "Full_Mismatch"
    | "Face_Not_Visible";
  confidenceScore?: number;
  index: number;
}

interface ImagePreviewModalProps {
  imageUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ExtractionItemProps {
  label: string;
  value: string;
  confidence?: string;
  confidenceScore?: number;
  index: number;
}

const ImagePreviewModal = ({ imageUrl, title, isOpen, onClose }: ImagePreviewModalProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ZoomIn className="w-5 h-5" />
            {title} - Full Preview
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center bg-black/5 rounded-lg p-4">
          <img 
            src={imageUrl} 
            alt={title}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback') as HTMLElement;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <div className="hidden image-fallback text-center p-8">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load image</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ValidationCard = ({ title, confidence, confidenceScore, index }: ValidationCardProps) => {
  const getCardConfig = () => {
    const configs = {
      High: {
        color: "emerald",
        icon: <Check className="w-4 h-4" />,
        gradient: "from-emerald-50 to-green-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        bg: "bg-emerald-500",
        bgLight: "bg-emerald-100",
        status: "Passed"
      },
      Almost_High: {
        color: "green",
        icon: <Check className="w-4 h-4" />,
        gradient: "from-green-50 to-emerald-50",
        border: "border-green-200",
        text: "text-green-700",
        bg: "bg-green-500",
        bgLight: "bg-green-100",
        status: "Passed"
      },
      Medium: {
        color: "amber",
        icon: <AlertTriangle className="w-4 h-4" />,
        gradient: "from-amber-50 to-yellow-50",
        border: "border-amber-200",
        text: "text-amber-700",
        bg: "bg-amber-500",
        bgLight: "bg-amber-100",
        status: "Review"
      },
      Low: {
        color: "orange",
        icon: <AlertCircle className="w-4 h-4" />,
        gradient: "from-orange-50 to-red-50",
        border: "border-orange-200",
        text: "text-orange-700",
        bg: "bg-orange-500",
        bgLight: "bg-orange-100",
        status: "Failed"
      },
      Full_Mismatch: {
        color: "red",
        icon: <X className="w-4 h-4" />,
        gradient: "from-red-50 to-rose-50",
        border: "border-red-200",
        text: "text-red-700",
        bg: "bg-red-500",
        bgLight: "bg-red-100",
        status: "Failed"
      },
      Face_Not_Visible: {
        color: "blue",
        icon: <Eye className="w-4 h-4" />,
        gradient: "from-blue-50 to-indigo-50",
        border: "border-blue-200",
        text: "text-blue-700",
        bg: "bg-blue-500",
        bgLight: "bg-blue-100",
        status: "Review"
      },
      Match: {
        color: "emerald",
        icon: <Check className="w-4 h-4" />,
        gradient: "from-emerald-50 to-green-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        bg: "bg-emerald-500",
        bgLight: "bg-emerald-100",
        status: "Passed"
      },
      No_Match: {
        color: "red",
        icon: <X className="w-4 h-4" />,
        gradient: "from-red-50 to-rose-50",
        border: "border-red-200",
        text: "text-red-700",
        bg: "bg-red-500",
        bgLight: "bg-red-100",
        status: "Failed"
      },
      default: {
        color: "gray",
        icon: "?",
        gradient: "from-gray-50 to-slate-50",
        border: "border-gray-200",
        text: "text-gray-700",
        bg: "bg-gray-500",
        bgLight: "bg-gray-100",
        status: "Unknown"
      },
    };

    return configs[confidence] || configs.default;
  };

  const config = getCardConfig();
  const displayName = confidence.replace(/_/g, " ");

  const getConfidenceData = () => {
    if (confidenceScore !== undefined && !isNaN(confidenceScore)) {
      return {
        width: `${confidenceScore}%`,
        score: confidenceScore
      };
    }

    switch (confidence) {
      case "High":
        return { width: "100%", score: 100 };
      case "Almost_High":
        return { width: "85%", score: 85 };
      case "Medium":
        return { width: "65%", score: 65 };
      case "Low":
        return { width: "35%", score: 35 };
      case "Full_Mismatch":
        return { width: "0%", score: 0 };
      case "Face_Not_Visible":
        return { width: "50%", score: 50 };
      default:
        return { width: "0%", score: 0 };
    }
  };

  const confidenceData = getConfidenceData();

  const getDotStatus = (dot: number) => {
    switch (confidence) {
      case "High":
        return dot <= 3;
      case "Almost_High":
        return dot <= 3;
      case "Medium":
        return dot <= 2;
      case "Low":
        return dot <= 1;
      case "Full_Mismatch":
        return false;
      case "Face_Not_Visible":
        return dot <= 2;
      default:
        return false;
    }
  };

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md
        bg-gradient-to-br ${config.gradient} ${config.border}
        animate-fade-in-up
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 ${config.bg} rounded-full flex items-center justify-center shadow-sm flex-shrink-0`}>
            <span className="text-white font-bold">
              {config.icon}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-sm truncate">{title}</h4>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.text} ${config.bgLight} flex-shrink-0 ml-2`}>
                {config.status}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium ${config.text}`}>
                {displayName}
              </span>
              <span className={`text-xs font-bold ${config.text}`}>
                {confidenceData.score}%
              </span>
            </div>

            <div className="w-full mt-2">
              <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${config.bg} transition-all duration-1000 ease-out`}
                  style={{ width: confidenceData.width }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-500">Confidence level</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                getDotStatus(dot) ? config.bg : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ExtractionItem = ({ label, value, confidence, confidenceScore, index }: ExtractionItemProps) => {
  const getConfidenceColor = () => {
    if (!confidence) return "text-gray-600";
    
    switch (confidence) {
      case "High":
      case "Almost_High":
        return "text-emerald-600";
      case "Medium":
      case "Face_Not_Visible":
        return "text-amber-600";
      case "Low":
      case "Full_Mismatch":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getConfidenceIcon = () => {
    if (!confidence) return null;
    
    switch (confidence) {
      case "High":
      case "Almost_High":
        return <Check className="w-3 h-3" />;
      case "Medium":
      case "Face_Not_Visible":
        return <AlertTriangle className="w-3 h-3" />;
      case "Low":
      case "Full_Mismatch":
        return <X className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="flex items-start justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50/50 to-white hover:from-blue-50/30 hover:to-white transition-all duration-200 border border-gray-100 hover:border-blue-200 group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <p className="text-sm text-gray-900 font-semibold break-words leading-relaxed">
          {value || "—"}
        </p>
      </div>
      <div className="w-2 h-2 rounded-full bg-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2 mt-2 flex-shrink-0"></div>
    </div>
  );
};

export const DocumentModal = ({
  selectedDoc,
  onClose,
  documentData,
}: DocumentModalProps) => {
  const [previewImage, setPreviewImage] = useState<{url: string; title: string} | null>(null);

  if (!selectedDoc || !documentData) return null;

  const detectFileType = (base64: string): string => {
    const typeMap: { [prefix: string]: string } = {
      "/9j/": "image/jpeg",
      iVBOR: "image/png",
      R0lGOD: "image/gif",
      JVBER: "application/pdf",
      SUkq: "image/tiff",
    };

    for (const prefix in typeMap) {
      if (base64.startsWith(prefix)) return typeMap[prefix];
    }
    return "application/octet-stream";
  };

  const getBase64Data = (data: string) => {
    if (data.includes(",")) {
      return data.split(",")[1];
    }
    return data;
  };

  const getCroppedPhotoUrl = () => {
    if (!documentData.extractedData?.croppedPhotoImage) return null;
    
    const base64Raw = documentData.extractedData.croppedPhotoImage;
    const base64 = getBase64Data(base64Raw);
    const fileType = detectFileType(base64);
    
    return `data:${fileType};base64,${base64}`;
  };

  const getValidationItems = () => {
    const items: Array<{
      key: string;
      title: string;
      confidence: ValidationCardProps['confidence'];
      confidenceScore?: number;
    }> = [];

    const fields = [
      {
        key: "photo",
        confidence: "photoMatchConfidence",
        score: "photoMatchConfidence",
        title: "Photo Match",
      },
      {
        key: "ovd",
        confidence: "ovdNumberConfidence",
        score: "ovdNumberExtractionConfidenceScore",
        title: "OVD Number Match",
      },
      {
        key: "name",
        confidence: "nameConfidence",
        score: "nameExtractionConfidenceScore",
        title: "Name Match",
      },
      {
        key: "dob",
        confidence: "dobConfidence",
        score: "dobExtractionConfidenceScore",
        title: "DOB Match",
      },
      {
        key: "gender",
        confidence: "genderConfidence",
        score: "genderExtractionConfidenceScore",
        title: "Gender Match",
      },
      {
        key: "spouse",
        confidence: "spouseNameConfidence",
        score: "spouseNameExtractionConfidenceScore",
        title: "Spouse Name Match",
      },
      {
        key: "father",
        confidence: "fatherNameConfidence",
        score: "fatherNameExtractionConfidenceScore",
        title: "Father Name Match",
      },
      {
        key: "address",
        confidence: "addressConfidence",
        score: "addressExtractionConfidenceScore",
        title: "Address Match",
      },
      {
        key: "pin",
        confidence: "pinConfidence",
        score: "pinExtractionConfidenceScore",
        title: "Pin Match",
      },
    ];

    fields.forEach((field) => {
      const confidence = documentData.extractedData?.[field.confidence as keyof KycMatchResponse];
      const confidenceScore = documentData.extractedData?.[field.score as keyof KycMatchResponse] as number | undefined;
      
      if (
        confidence &&
        confidence !== "Not_Applicable" &&
        confidence !== "NotRead"
      ) {
        items.push({
          key: field.key,
          title: field.title,
          confidence: confidence as ValidationCardProps['confidence'],
          confidenceScore: confidenceScore && !isNaN(confidenceScore) ? confidenceScore : undefined,
        });
      }
    });

    return items;
  };

  const calculateOverallConfidence = () => {
    const items = getValidationItems();
    if (items.length === 0) return 0;

    const total = items.reduce((sum, item) => {
      let score = 0;
      
      if (item.confidenceScore !== undefined && !isNaN(item.confidenceScore)) {
        score = item.confidenceScore;
      } else {
        switch (item.confidence) {
          case "High": score = 100; break;
          case "Almost_High": score = 85; break;
          case "Medium": score = 65; break;
          case "Low": score = 35; break;
          case "Full_Mismatch": score = 0; break;
          case "Face_Not_Visible": score = 50; break;
          default: score = 0;
        }
      }
      return sum + score;
    }, 0);

    return Math.round(total / items.length);
  };

  const getCountByConfidence = () => {
    const items = getValidationItems();
    let passed = 0;
    let review = 0;
    let failed = 0;

    items.forEach(item => {
      switch (item.confidence) {
        case "High":
        case "Almost_High":
          passed++;
          break;
        case "Medium":
        case "Face_Not_Visible":
          review++;
          break;
        case "Low":
        case "Full_Mismatch":
          failed++;
          break;
      }
    });

    return { passed, review, failed };
  };

  const validationItems = getValidationItems();
  const counts = getCountByConfidence();
  const croppedPhotoUrl = getCroppedPhotoUrl();

  const extractionFields = [
    {
      label: "OVD Type",
      value: documentData.extractedData?.classifiedOvdType,
    },
    {
      label: "OVD Number",
      value: documentData.extractedData?.ovdNumberExtracted,
      confidence: documentData.extractedData?.ovdNumberConfidence,
      confidenceScore: documentData.extractedData?.ovdNumberExtractionConfidenceScore,
    },
    {
      label: "Full Name",
      value: documentData.extractedData?.nameExtracted,
      confidence: documentData.extractedData?.nameConfidence,
      confidenceScore: documentData.extractedData?.nameExtractionConfidenceScore,
    },
    {
      label: "Date of Birth",
      value: documentData.extractedData?.dobExtracted,
      confidence: documentData.extractedData?.dobConfidence,
      confidenceScore: documentData.extractedData?.dobExtractionConfidenceScore,
    },
    {
      label: "Gender",
      value: documentData.extractedData?.genderExtracted,
      confidence: documentData.extractedData?.genderConfidence,
      confidenceScore: documentData.extractedData?.genderExtractionConfidenceScore,
    },
    {
      label: "Spouse Name",
      value: documentData.extractedData?.spouseNameExtracted,
      confidence: documentData.extractedData?.spouseNameConfidence,
      confidenceScore: documentData.extractedData?.spouseNameExtractionConfidenceScore,
    },
    {
      label: "Father Name",
      value: documentData.extractedData?.fatherNameExtracted,
      confidence: documentData.extractedData?.fatherNameConfidence,
      confidenceScore: documentData.extractedData?.fatherNameExtractionConfidenceScore,
    },
    {
      label: "Address",
      value: documentData.extractedData?.addressExtracted,
      confidence: documentData.extractedData?.addressConfidence,
      confidenceScore: documentData.extractedData?.addressExtractionConfidenceScore,
    },
    {
      label: "Pincode",
      value: documentData.extractedData?.pinExtracted,
      confidence: documentData.extractedData?.pinConfidence,
      confidenceScore: documentData.extractedData?.pinExtractionConfidenceScore,
    },
    {
      label: "State",
      value: documentData.extractedData?.stateExtracted,
    },
    {
      label: "City",
      value: documentData.extractedData?.cityExtracted,
    },
    {
      label: "Email",
      value: documentData.extractedData?.emailExtracted,
    },
    {
      label: "Mobile Number",
      value: documentData.extractedData?.mobileNumberExtracted,
    },
    {
      label: "Expiry Date",
      value: documentData.extractedData?.expiryDateExtracted,
    },
    {
      label: "Expired",
      value: documentData.extractedData?.isExpired,
    },
    {
      label: "Image Quality",
      value: documentData.extractedData?.imageQuality,
    },
  ].filter(field => field.value); // Only show fields with values

  return (
    <>
      <Dialog open={selectedDoc !== null} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {selectedDoc === "permanent"
                ? "Permanent Address"
                : "Current Address"}{" "}
              Document Verification
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Document Type Badge */}
            <div className="flex justify-start">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {documentData.docType}
              </Badge>
            </div>

            {/* Images Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* OVD Document Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Document Image</h3>
                </div>
                {documentData.documentImage ? (
                  <div 
                    className="w-full h-64 bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-border cursor-pointer hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                    onClick={() => setPreviewImage({
                      url: documentData.documentImage,
                      title: "Document Image"
                    })}
                  >
                    <img 
                      src={documentData.documentImage} 
                      alt={`${documentData.docType} Document`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center border-2 border-muted-foreground/20">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No document image available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cropped Photo */}
              {croppedPhotoUrl && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Extracted Photo</h3>
                  </div>
                  <div 
                    className="w-full h-64 bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-border cursor-pointer hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                    onClick={() => setPreviewImage({
                      url: croppedPhotoUrl,
                      title: "Extracted Photo"
                    })}
                  >
                    <img
                      src={croppedPhotoUrl}
                      alt="Extracted Photo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Information - Modern Layout */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Extracted Information
                  </h3>
                  <p className="text-sm text-gray-500">
                    AI-extracted data with confidence scores
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700">
                    {extractionFields.length} fields extracted
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {extractionFields.map((field, index) => (
                  <ExtractionItem
                    key={field.label}
                    label={field.label}
                    value={field.value || "—"}
                    confidence={field.confidence}
                    confidenceScore={field.confidenceScore}
                    index={index}
                  />
                ))}
              </div>
            </div>

            {validationItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Validation Checks
                    </h3>
                    <p className="text-sm text-gray-500">
                      Document verification results
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-700">
                      {calculateOverallConfidence()}% Overall Confidence
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {validationItems.map((item, index) => (
                    <ValidationCard
                      key={item.key}
                      title={item.title}
                      confidence={item.confidence}
                      confidenceScore={item.confidenceScore}
                      index={index}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Passed: <strong className="text-gray-900">{counts.passed}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Review: <strong className="text-gray-900">{counts.review}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Failed: <strong className="text-gray-900">{counts.failed}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-gray-600">
                      Total Checks: <strong className="text-gray-900">{validationItems.length}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ImagePreviewModal
        imageUrl={previewImage?.url || ""}
        title={previewImage?.title || ""}
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
};