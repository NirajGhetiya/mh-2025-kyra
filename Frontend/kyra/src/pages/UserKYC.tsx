import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StepIndicator } from "@/components/user-kyc/StepIndicator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { KYCFormData } from "@/types/kyc";

import WelcomeStep from "@/components/user-kyc/WelcomeStep";
import BasicInfoStep from "@/components/user-kyc/BasicInfoStep";
import AddressStep from "@/components/user-kyc/AddressStep";
import DocumentsStep from "@/components/user-kyc/DocumentsStep";
import LivenessStep from "@/components/user-kyc/LivenessStep";
import ReviewStep from "@/components/user-kyc/ReviewStep";
import CompletionStep from "@/components/user-kyc/CompletionStep";
import { useParams } from "react-router-dom";
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'sonner';

const steps = [
  { number: 1, title: "Basic Info" },
  { number: 2, title: "Addresses" },
  { number: 3, title: "Documents" },
  { number: 4, title: "Liveness" },
  { number: 5, title: "Review" },
];

const UserKYC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDocumentConsentGiven, setIsDocumentConsentGiven] = useState(false);
  const [isValidKyc, setIsValidKyc] = useState<boolean | null>(null); 
  const { id } = useParams<{ id: string }>();
  const [isError, setIsError] = useState<boolean>(false);

  const [formData, setFormData] = useState<KYCFormData>({
    name : "",
    fatherName : "",
    emailId : "",
    mobileNo : "",
    dob : "",
    gender : "",
    photoImage : "",
    livenessImage: "",
    livenessScore : 0,
    livenessStatus : "",

    corporateAddress: {
      streetAddress: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    permanentAddress: {
      streetAddress: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    permanentDocType: {
      ovdType: "",
      ovdImage: "",
    },
    corporateDocType: { 
      ovdType: "",
      ovdImage: "",
    },
    isSameAddress: false,
  });

  useEffect(() => {
    const validateKYCId = async () => {
      try {
        const response = await axiosInstance.get(`/user/kyc/${id}`);

        if (response.data.data.data != null) {
          const kyc = response.data.data.data;
          setFormData({
            name: kyc.name || "",
            fatherName: kyc.fatherName || "",
            emailId: kyc.emailId || "",
            mobileNo: kyc.mobileNo || "",
            dob: kyc.dob || "",
            gender: kyc.gender || "",
            photoImage: kyc.photoImage || "",
            livenessImage: kyc.livenessImage || "",
            livenessScore: kyc.livenessScore || 0,
            livenessStatus: kyc.livenessStatus || "",
        
            corporateAddress: {
              streetAddress: kyc.corporateAddress?.streetAddress || "",
              city: kyc.corporateAddress?.city || "",
              state: kyc.corporateAddress?.state || "",
              country: kyc.corporateAddress?.country || "",
              zipCode: kyc.corporateAddress?.zipCode || "",
            },
        
            permanentAddress: {
              streetAddress: kyc.permanentAddress?.streetAddress || "",
              city: kyc.permanentAddress?.city || "",
              state: kyc.permanentAddress?.state || "",
              country: kyc.permanentAddress?.country || "",
              zipCode: kyc.permanentAddress?.zipCode || "",
            },
        
            permanentDocType: {
              ovdType: kyc.permanentAddressDocuments?.ovdType || "",
              ovdImage: kyc.permanentAddressDocuments?.ovdImage || "",
            },
        
            corporateDocType: {
              ovdType: kyc.corporateAddressDocuments?.ovdType || "",
              ovdImage: kyc.corporateAddressDocuments?.ovdImage || "",
            },
          });

          if(response.data.data?.kyc_status != "pending") {
            setCurrentStep(6);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success("KYC Application Submitted Successfully");
            return;
          }
        
          setIsValidKyc(true);
          toast.success(`KYC ID : ${id} validated successfully.`);
        } else {
          setIsValidKyc(false);
          toast.error(`KYC ID : ${id} is not validated.`);
        }
      } catch (error) {
        setIsValidKyc(false);
        toast.error(`Unable to validate KYC ID : ${id} Please try again later.`);
      } 
    };
    validateKYCId();
  }, []);

  const handleStartKYC = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const normalizeDOB = (date: string) => {
    if (!date) return "";
  
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
  
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [day, month, year] = date.split("/");
      return `${year}-${month}-${day}`;
    }
    return "";
  };

  const submitBasicInfo = async () => {
    try {
      const response = await axiosInstance.post(`/user/kyc/${id}/personal`, {
        name: formData.name,
        gender: formData.gender,
        dob: normalizeDOB(formData.dob),
        emailId: formData.emailId,
        mobileNo: formData.mobileNo,
        fatherName: formData.fatherName,
        photoImage: formData.photoImage,
      });
  
      toast.success("Basic info saved successfully!");
    } catch (error) {
      toast.error("Failed to save Basic Info. Try again.");
      return false;
    }
  
    return true;
  };

  const submitAddressInfo = async () => {
    try {
  
      await axiosInstance.post(`/user/kyc/${id}/address`, {
        permanentAddress: {
          streetAddress: formData.permanentAddress.streetAddress,
          city: formData.permanentAddress.city,
          state: formData.permanentAddress.state,
          zipCode: formData.permanentAddress.zipCode,
          country: formData.permanentAddress.country,
        },
        corporateAddress: {
          streetAddress: formData.corporateAddress.streetAddress,
          city: formData.corporateAddress.city,
          state: formData.corporateAddress.state,
          zipCode: formData.corporateAddress.zipCode,
          country: formData.corporateAddress.country,
        },
      });
  
      toast.success("Address saved successfully!");
      return true;
  
    } catch (error) {
      toast.error("Failed to save address.");
      return false;
  
    } 
  };
  

  const submitDocuments = async () => {
    try {

      await axiosInstance.post(`/user/kyc/${id}/documents`, {
        permanentAddressDocuments: {
          ovdType: formData.permanentDocType.ovdType,
          ovdImage: formData.permanentDocType.ovdImage,
        },
        corporateAddressDocuments: {
          ovdType: formData.corporateDocType.ovdType,
          ovdImage: formData.corporateDocType.ovdImage,
        },
      });
  
      toast.success("Documents saved successfully!");
      return true;
  
    } catch (error) {
      toast.error("Failed to save documents.");
      return false;
  
    }
  };
  

  const submitLiveness = async () => {
    try {
  
      await axiosInstance.post(`/user/kyc/${id}/liveness`, {
        livenessStatus: formData.livenessStatus,
        livenessScore: formData.livenessScore,
        livenessImage: formData.livenessImage,
      });
  
      toast.success("Liveness saved successfully!");
      return true;
  
    } catch (error) {
      toast.error("Failed to save liveness.");
      return false;
  
    } 
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (
        formData.name.trim() === "" ||
        formData.fatherName.trim() === "" ||
        formData.emailId.trim() === "" ||
        formData.mobileNo.trim() === "" ||
        formData.gender.trim() === "" ||
        formData.dob.trim() === "" ||
        formData.photoImage.trim() === ""
      ) {
        setIsError(true);
        return;
      } else {
        setIsError(false);
      }
  
      const success = await submitBasicInfo();
      if (!success) return;
  
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStep === 2) {
      if (
        formData.permanentAddress.streetAddress.trim() === "" ||
        formData.permanentAddress.city.trim() === "" ||
        formData.permanentAddress.country.trim() === "" ||
        formData.permanentAddress.state.trim() === "" ||
        formData.permanentAddress.zipCode.trim() === "" ||
        formData.corporateAddress.streetAddress.trim() === "" ||
        formData.corporateAddress.city.trim() === "" ||
        formData.corporateAddress.country.trim() === "" ||
        formData.corporateAddress.state.trim() === "" ||
        formData.corporateAddress.zipCode.trim() === ""
      ) {
        setIsError(true);
        return;
      } else {
        setIsError(false);
      }
  
      const success = await submitAddressInfo();
      if (!success) return;
  
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStep === 3) {
      if (
        formData.corporateDocType.ovdType.trim() === "" ||
        formData.corporateDocType.ovdImage.trim() === "" ||
        formData.permanentDocType.ovdType.trim() === "" ||
        formData.permanentDocType.ovdImage.trim() === ""
      ) {
        setIsError(true);
        return;
      } else {
        setIsError(false);
      }
  
      const success = await submitDocuments();
      if (!success) return;
  
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStep === 4) {
      if (
        formData.livenessImage === "" ||
        formData.livenessScore === 0 ||
        formData.livenessStatus.trim() === ""
      ) {
        setIsError(true);
        return;
      } else {
        setIsError(false);
      }
  
      const success = await submitLiveness();
      if (!success) return;
  
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!isDocumentConsentGiven) {
      toast.error("Please consent to share your documents before submitting.");
      return;
    }
    
    setShowConfirmDialog(false);
    setCurrentStep(6);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success("KYC Application Submitted Successfully");
    setIsDocumentConsentGiven(false);

    try {
      await axiosInstance.get(`/user/kyc/${id}/submit`);
  
      toast.success("KYC Application Submitted Successfully");
      setShowConfirmDialog(false);
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsDocumentConsentGiven(false);
    } catch (error) {
      toast.error("Failed to submit KYC application.");
    } 
  };

  const handleOpenConfirmDialog = () => {
    setIsDocumentConsentGiven(false);;
    setShowConfirmDialog(true);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onStart={handleStartKYC} />;
      case 1:
        return <BasicInfoStep formData={formData} setFormData={setFormData} isError={isError} />;
      case 2:
        return <AddressStep formData={formData} setFormData={setFormData} isError={isError} />;
      case 3:
        return <DocumentsStep formData={formData} setFormData={setFormData} isError={isError} />;
      case 4:
        return <LivenessStep formData={formData} setFormData={setFormData} isError={isError} />;
      case 5:
        return <ReviewStep formData={formData} setFormData={setFormData} isError={isError} />;
      case 6:
        return <CompletionStep formData={formData} />;
      default:
        return null;
    }
  };

  if (isValidKyc === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <Shield className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Invalid or Unauthorized KYC ID</h2>
        <p className="text-muted-foreground mb-6">
          The provided KYC ID is not valid. Please contact support or request a new one.
        </p>
        <Button onClick={() => (window.location.href = "/")}>Go Back</Button>
      </div>
    );
  }

  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 w-full">
          <div className="h-16 flex items-center justify-between w-full">
            <div className="flex items-center gap-8 pl-4 sm:pl-6 lg:pl-8">
              <button
                className="flex items-center gap-3 group"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                  Kyra
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3 pr-4 sm:pr-6 lg:pr-8">
              <span className="hidden sm:inline"></span>
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8">
          <WelcomeStep onStart={handleStartKYC} />
        </div>
      </div>
    );
  }

  if (currentStep === 6) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 w-full">
          <div className="h-16 flex items-center justify-between w-full">
            <div className="flex items-center gap-8 pl-4 sm:pl-6 lg:pl-8">
              <button
                className="flex items-center gap-3 group"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                  Kyra
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3 pr-4 sm:pr-6 lg:pr-8">
              <span className="hidden sm:inline"></span>
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8">
          <CompletionStep formData={formData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 w-full">
        <div className="h-16 flex items-center justify-between w-full">
          <div className="flex items-center gap-8 pl-4 sm:pl-6 lg:pl-8">
            <button
              className="flex items-center gap-3 group"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                Kyra
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 pr-4 sm:pr-6 lg:pr-8">
            <span className="hidden sm:inline"></span>
          </div>
        </div>
      </nav>
      <div className="w-full p-4 md:p-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-2">KYC Verification</h1>
          <p className="text-muted-foreground text-lg">
            Complete your verification in 5 simple steps
          </p>
        </div>

        <StepIndicator steps={steps} currentStep={currentStep} />

        <Card className="mt-8 shadow-2xl border-primary/10">
          <CardContent className="p-6 md:p-8">
            {renderStepContent()}

            {currentStep >= 1 && currentStep <= 5 && (
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  size="lg"
                  className="
                    font-medium 
                    hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600
                    hover:text-white
                    hover:border-transparent
                    transition-all duration-200
                  "
                >
                  Previous
                </Button>
                {currentStep < 5 ? (
                  <Button 
                    onClick={handleNext} 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleOpenConfirmDialog}
                    size="lg"
                    className="min-w-32 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Submit Application
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm KYC Submission</DialogTitle>
            <DialogDescription className="text-base">
              Please review all information carefully before submitting your KYC application.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Checkbox
                id="document-consent"
                checked={isDocumentConsentGiven}
                onCheckedChange={(checked) => setIsDocumentConsentGiven(checked as boolean)}
                className="mt-1"
              />
              <div className="grid gap-2 leading-none">
                <label
                  htmlFor="document-consent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I consent to share my documents and personal information with Kyra for KYC verification
                </label>
                <p className="text-sm text-blue-700">
                  By checking this box, you acknowledge that Kyra will process your documents and personal information 
                  solely for the purpose of identity verification and KYC compliance as per regulatory requirements.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="
                sm:flex-1 font-medium 
                hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600
                hover:text-white
                hover:border-transparent
                transition-all duration-200
              "
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!isDocumentConsentGiven}
              className="sm:flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserKYC;