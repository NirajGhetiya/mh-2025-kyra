export type KYCStatus = "pending" | "approved" | "rejected" | "under_review";

export interface KYCRecord {
  kyc_id: number;
  kyc_email: string;
  userName: string;
  kyc_mobile: string;
  status: KYCStatus;
  submitted_at: string;
  changed_at: string;
  ai_notes: AINotes;
  details: KYCFormData;
}

export interface AINotes {
  kycMatchReview?: string;
  livenessReview?: string;
  tamperReview?: string;
  riskScore?: number;
}

export interface Address {
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export type DocumentTypeValue =
  | ""
  | "AadhaarCard"
  | "DrivingLicense"
  | "PanCard"
  | "Passport"
  | "VoterCard";

export interface DocumentType {
  ovdType: DocumentTypeValue;
  ovdImage: string;
}

export interface KYCFormData {
  name: string;
  fatherName: string;
  emailId: string;
  mobileNo: string;
  dob: string;
  gender: string;
  photoImage: string;
  livenessImage: string;
  livenessScore: number;
  livenessStatus: string;
  corporateAddress: Address;
  permanentAddress: Address;
  permanentDocType: DocumentType;
  corporateDocType: DocumentType;
  isSameAddress?: boolean;
  perPOA?: KycMatchResponse;
  corPOA?: KycMatchResponse;
}

export interface KycMatchResponse {
  perPOAOvdType?: string;
  corPOAOvdType?: string;
  classifiedOvdType?: string;

  ovdNumberExtracted?: string;
  ovdNumberConfidence?: string;
  ovdNumberExtractionConfidenceScore?: number;

  nameExtracted?: string;
  nameConfidence?: string;
  nameExtractionConfidenceScore?: number;

  dobExtracted?: string;
  dobConfidence?: string;
  dobExtractionConfidenceScore?: number;

  genderExtracted?: string;
  genderConfidence?: string;
  genderExtractionConfidenceScore?: number;

  spouseNameExtracted?: string;
  spouseNameConfidence?: string;
  spouseNameExtractionConfidenceScore?: number;

  fatherNameExtracted?: string;
  fatherNameConfidence?: string;
  fatherNameExtractionConfidenceScore?: number;

  addressExtracted?: string;
  addressConfidence?: string;
  addressExtractionConfidenceScore?: number;

  countryExtracted?: string;
  countryConfidence?: string;
  passportCountryExtractionConfidenceScore?: number;

  pinExtracted?: string;
  pinConfidence?: string;
  pinExtractionConfidenceScore?: number;

  stateExtracted?: string;
  stateConfidence?: string;

  cityExtracted?: string;
  cityConfidence?: string;

  derivedStateExtracted?: string;
  derivedStateConfidence?: string;

  derivedCityExtracted?: string;
  derivedCityConfidence?: string;

  emailExtracted?: string;
  emailConfidence?: string;

  mobileNumberExtracted?: string;
  mobileNumberConfidence?: string;

  expiryDateExtracted?: string;
  isExpired?: boolean;
  expired?: boolean;

  croppedOvdImage?: string;
  croppedPhotoImage?: string;

  photoMatchConfidence?: string;
  imageQuality?: string;

  ovdType?: string;
}

export interface StepProps {
  formData: KYCFormData;
  setFormData: (data: KYCFormData) => void;
  isError: boolean;
}
