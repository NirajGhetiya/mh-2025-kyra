import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HeaderSection } from "@/components/kyc-details/HeaderSection";
import { AINoteSection } from "@/components/kyc-details/AINoteSection";
import { ActionButtons } from "@/components/kyc-details/ActionButtons";
import { PersonalInfoSection } from "@/components/kyc-details/PersonalInfoSection";
import { AddressSection } from "@/components/kyc-details/AddressSection";
import { DocumentsSection } from "@/components/kyc-details/DocumentsSection";
import { LivenessSection } from "@/components/kyc-details/LivenessSection";
import { TimelineSection } from "@/components/kyc-details/TimelineSection";
import { DocumentModal } from "@/components/kyc-details/DocumentModal";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import { KYCRecord } from "@/types/kyc";

const KYCDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [kycDetails, setKycDetails] = useState<KYCRecord>({
    kyc_id: 0, 
    status: "pending", 
    kyc_email: "", 
    userName: "", 
    kyc_mobile: "", 
    submitted_at: "", 
    changed_at: "", 
    ai_notes: {}, 
    details: {
      name: "",
      fatherName: "",
      emailId: "",
      mobileNo: "",
      dob: "",
      gender: "",
      photoImage: "",
      livenessImage: "",
      livenessScore: 0,
      livenessStatus: "",
      corporateAddress: {
        streetAddress: "",
        city: "",
        state: "",
        country: "",
        zipCode: ""
      },
      permanentAddress: {
        streetAddress: "",
        city: "",
        state: "",
        country: "",
        zipCode: ""
      },
      perPOA: undefined,
      corPOA: undefined,
      permanentDocType: undefined,
      corporateDocType: undefined
    }
  });

  const [selectedDoc, setSelectedDoc] = useState<"permanent" | "corporate" | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  
    const validateKYCId = async () => {
      try {
        const response = await axiosInstance.get(`/admin/kyc/${id}`);
        const data = response.data.data;
        if (!data) {
          toast.error("KYC not found.");
          navigate("/admin/dashboard");
          return;
        }

        if (data.status === "pending") {
          toast.error("KYC is still pending by user.");
          navigate("/admin/dashboard");
          return;
        }
        
        const mappedDetails: KYCRecord = {
          ...data,
          details: {
            ...data.details,
            permanentDocType: data.details.permanentAddressDocuments,
            corporateDocType: data.details.corporateAddressDocuments,
          },
        };
        
        setKycDetails(mappedDetails);
        toast.success(`KYC ID : ${id} validated successfully.`);
      } catch (error) {
        toast.error(`KYC ID : ${id} validation failed.`);
        navigate("/admin/dashboard");
      }
    };
  
    validateKYCId();
  }, [id]);

  const handleApprove = async () => {
    try {
      const response = await axiosInstance.post(`/admin/kyc/${id}/approve`);
      console.log(response)
      if (response.data.data?.status === "approved") {
        toast.success(`KYC for ${kycDetails.details.name} has been approved.`);
        navigate("/admin/dashboard");
        return;
      }
      toast.error(`Failed to approve KYC for ${kycDetails.details.name}.`);
    } catch (error) {
      toast.error(`Failed to approve KYC for ${kycDetails.details.name}.`);
      return;
    }
  };

  const handleReject = async () => {
    try {
      const response = await axiosInstance.post(`/admin/kyc/${id}/reject`);
      if (response.data.data?.status === "rejected") {
        toast.success(`KYC for ${kycDetails.details.name} has been rejected.`);
        navigate("/admin/dashboard");
        return;
      }
      toast.error(`Failed to rejecte KYC for ${kycDetails.details.name}.`);
    } catch (error) {
      toast.error(`Failed to rejecte KYC for ${kycDetails.details.name}.`);
      return;
    };
  };

  const handleReKYC = async () => {
    try {
      const response = await axiosInstance.post(`/admin/kyc/${id}/re-kyc`);
      if (response.data.data?.status === "pending") {
        toast.success(`Re-KYC request sent to ${kycDetails.details.name}.`);
        navigate("/admin/dashboard");
        return;
      }
      toast.error(`Failed to sent Re-KYC request to ${kycDetails.details.name}.`);
    } catch (error) {
      toast.error(`Failed to sent Re-KYC request to ${kycDetails.details.name}.`);
      return;
    };
  };

  const getDocumentData = (docType: "permanent" | "corporate") => {
    const doc = kycDetails.details[`${docType}AddressDocuments`];
    const extractionData =
      docType === "permanent"
        ? kycDetails.details.perPOA
        : kycDetails.details.corPOA;

    if (!doc) {
      return {
        docType: "",
        extractedData: {},
        documentImage: ""
      };
    }

    return {
      docType: doc.ovdType,
      extractedData: extractionData,
      documentImage: doc.ovdImage || ""
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="w-full p-4 md:p-8 space-y-6">
        <HeaderSection record={kycDetails} />
        <AINoteSection record={kycDetails} />
        {kycDetails.status === "under_review" && (
          <ActionButtons
            onApprove={handleApprove}
            onReject={handleReject}
            onReKYC={handleReKYC}
            userName={kycDetails.details.name}
          />
        )}
        <PersonalInfoSection record={kycDetails} />
        <LivenessSection record={kycDetails} />
        <AddressSection record={kycDetails} />
        <DocumentsSection record={kycDetails} onDocSelect={setSelectedDoc} />
        <TimelineSection record={kycDetails} />
      </div>

      <DocumentModal
        selectedDoc={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        documentData={selectedDoc ? getDocumentData(selectedDoc) : null}
      />
    </div>
  );
};

export default KYCDetail;