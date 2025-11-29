import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Shield, Clock, Mail, Download, UserCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'sonner';
import Loading from "@/components/Loading";
import { useState } from "react";

interface CompletionStepProps {
  formData: any;
}

const CompletionStep = ({ formData }: CompletionStepProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate("/");
  };

  const handleDownloadSummary = async () => {
    setIsLoading(true);
    try{
      const response = await axiosInstance.get(`/user/kyc/${id}/pdf` , {responseType: "blob", });

      let fileName = `KYC_${id}.pdf`;

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(link.href);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-6 shadow-lg">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          KYC Submitted Successfully!
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Thank you for completing the verification process. Your application is now under review.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    Application Under Review
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Your KYC application has been received and is currently being processed by our verification team.
                  </p>
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Application submitted successfully
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    Processing Timeline
                  </h3>
                  <p className="text-gray-600 mb-3">
                    We're working to complete your verification as quickly as possible.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated completion:</span>
                      <span className="font-semibold text-gray-900">24-48 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current status:</span>
                      <span className="font-semibold text-purple-600">In Review</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    Stay Updated
                  </h3>
                  <p className="text-gray-600 mb-3">
                    We'll keep you informed about your application status via email and dashboard notifications.
                  </p>
                  <div className="text-sm text-gray-600">
                    Notifications will be sent to:{" "}
                    <span className="font-semibold text-gray-900">{formData.emailId || "your registered email"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  onClick={handleGoToDashboard}
                  className="
                    w-full justify-start gap-3 h-12 font-medium 
                    hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600
                    hover:text-white
                    hover:border-transparent
                    transition-all duration-200
                  "
                  variant="outline"
                >
                  <UserCheck className="w-5 h-5" />
                  Back To Dashboard
                </Button>
                <Button 
                  onClick={handleDownloadSummary}
                  className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Download className="w-5 h-5" />
                  Download Summary
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Application Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">KYC ID:</span>
                  <span className="font-mono font-semibold text-gray-900">
                    KYC{id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Applicant:</span>
                  <span className="font-semibold text-gray-900">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Documents:</span>
                  <span className="font-semibold text-green-600">Complete</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default CompletionStep;