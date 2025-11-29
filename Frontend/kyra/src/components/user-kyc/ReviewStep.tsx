import { Address, StepProps } from "@/types/kyc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MailIcon, CalendarIcon, UserIcon, MapPin, UserCircle, PhoneIcon, Shield, CheckCircle, XCircle, Gauge } from "lucide-react";

const ReviewStep = ({ formData }: StepProps) => {
  const isSameAddress = formData.isSameAddress;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'pass' || statusLower === 'approved') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-green-700 bg-green-100 font-semibold">
        <CheckCircle className="w-4 h-4 mr-1" /> Pass
      </span>;
    } else if (statusLower === 'fail' || statusLower === 'rejected') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-red-700 bg-red-100 font-semibold">
        <XCircle className="w-4 h-4 mr-1" /> Fail
      </span>;
    } else {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-yellow-700 bg-yellow-100 font-semibold">
        Pending
      </span>;
    }
  };

  const getImageSrc = (base64String: string) => {
    if (!base64String) return "";
    if (base64String.startsWith('data:')) {
      return base64String;
    }
    return `data:image/jpeg;base64,${base64String}`;
  };

  const capitalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());

  const InfoItem = ({ icon: Icon, label, value }: {
    icon: any;
    label: string;
    value: string;
  }) => (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-base font-semibold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );

  const LivenessInfoItem = ({ label, value, status }: {
    label: string;
    value: string;
    status?: 'success' | 'warning' | 'error';
  }) => {
    const statusColors = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600'
    };

    return (
      <div className="flex justify-between items-center py-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className={`text-sm font-semibold ${status ? statusColors[status] : 'text-gray-900'}`}>
          {value}
        </span>
      </div>
    );
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'approved') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (statusLower === 'rejected') {
      return <XCircle className="w-5 h-5 text-red-600" />;
    } else {
      return <Shield className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'approved') return 'text-green-600';
    if (statusLower === 'rejected') return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Review Your Information
        </h2>
        <p className="text-muted-foreground">
          Please review all the information before submitting
        </p>
      </div>

      <div className="min-h-screen bg-background">
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">1</span>
            </div>
            Personal Information
          </h3>
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 flex justify-center">
                  <div className="relative">
                    <div className="w-60 h-60 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                      {formData.photoImage ? (
                        <img
                          src={getImageSrc(formData.photoImage)}
                          alt="User photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                          <User className="w-20 h-20 text-purple-600" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg border-2 border-white">
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <InfoItem
                        icon={UserCircle}
                        label="Name"
                        value={`${formData.name}`}
                      />
                      <InfoItem
                        icon={MailIcon}
                        label="Email"
                        value={formData.emailId}
                      />
                      <InfoItem
                        icon={PhoneIcon}
                        label="Phone"
                        value={formData.mobileNo}
                      />
                    </div>
                    <div className="space-y-1">
                      <InfoItem
                        icon={CalendarIcon}
                        label="Date of Birth"
                        value={formatDate(formData.dob)}
                      />
                      <InfoItem
                        icon={UserIcon}
                        label="Father Name"
                        value={`${formData.fatherName}`}
                      />
                      <InfoItem
                        icon={UserCircle}
                        label="Gender"
                        value={capitalize(formData.gender)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">2</span>
            </div>
            Liveness Verification
          </h3>
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 flex justify-center">
                  <div className="relative">
                    <div className="w-60 h-60 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                      {formData.livenessImage ? (
                        <img
                          src={getImageSrc(formData.livenessImage)}
                          alt="Liveness verification"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                          <Shield className="w-20 h-20 text-purple-600" />
                        </div>
                      )}
                    </div>
                    <div className={`absolute -bottom-2 -right-2 rounded-full p-1.5 shadow-lg border-2 border-white ${
                      formData.livenessStatus?.toLowerCase() === 'approved' ? 'bg-green-500' :
                      formData.livenessStatus?.toLowerCase() === 'rejected' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}>
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        {getStatusIcon(formData.livenessStatus)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <InfoItem
                          icon={Gauge}
                          label="Liveness Score"
                          value={`${Math.round(formData.livenessScore * 100)}%`}
                        />
                        <InfoItem
                          icon={CheckCircle}
                          label="Liveness Status"
                          value={getStatusBadge(formData.livenessStatus)}
                        />
                      </div>
                    </div>  
                  </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-600 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">3</span>
            </div>
            Address Information
          </h3>
          
          {isSameAddress ? (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Permanent & Current Address</h4>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm font-medium">{formData.permanentAddress.streetAddress || "Not provided"}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.permanentAddress.city || ""}, {formData.permanentAddress.state || ""} {formData.permanentAddress.zipCode || ""}
                </p>
                <p className="text-sm text-gray-600">{formData.permanentAddress.country || "Not provided"}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Permanent Address</h4>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm font-medium">{formData.permanentAddress.streetAddress || "Not provided"}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.permanentAddress.city || ""}, {formData.permanentAddress.state || ""} {formData.permanentAddress.zipCode || ""}
                  </p>
                  <p className="text-sm text-gray-600">{formData.permanentAddress.country || "Not provided"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Current Address</h4>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm font-medium">{formData.corporateAddress.streetAddress || "Not provided"}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.corporateAddress.city || ""}, {formData.corporateAddress.state || ""} {formData.corporateAddress.zipCode || ""}
                  </p>
                  <p className="text-sm text-gray-600">{formData.corporateAddress.country || "Not provided"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-600 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">4</span>
            </div>
            Document Verification
          </h3>
          
          {isSameAddress ? (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Address Proof Document</h4>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-purple-200">
                  <label className="text-sm text-gray-600">Document Type</label>
                  <p className="text-sm font-medium capitalize">
                    {(formData.permanentDocType.ovdType || "Not provided").replace(/_/g, " ")}
                  </p>
                </div>
                {formData.permanentDocType.ovdImage ? (
                  <div className="space-y-2">
                    <div className="border border-purple-200 rounded-lg p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                      <img 
                        src={getImageSrc(formData.permanentDocType.ovdImage)} 
                        alt="Address Proof Document" 
                        className="w-full max-w-xs rounded object-cover mx-auto"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                      Document uploaded
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                    <p className="text-sm text-gray-500">Document not provided</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Permanent Address Proof</h4>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-purple-200">
                    <label className="text-sm text-gray-600">Document Type</label>
                    <p className="text-sm font-medium capitalize">
                      {(formData.permanentDocType.ovdType || "Not provided").replace(/_/g, " ")}
                    </p>
                  </div>
                  {formData.permanentDocType.ovdImage ? (
                    <div className="space-y-2">
                      <div className="border border-purple-200 rounded-lg p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                        <img 
                          src={getImageSrc(formData.permanentDocType.ovdImage)} 
                          alt="Permanent Address Proof" 
                          className="w-full max-w-xs rounded object-cover mx-auto"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        Uploaded
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                      <p className="text-sm text-gray-500">Document not provided</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Current Address Proof</h4>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-purple-200">
                    <label className="text-sm text-gray-600">Document Type</label>
                    <p className="text-sm font-medium capitalize">
                      {(formData.corporateDocType.ovdType || "Not provided").replace(/_/g, " ")}
                    </p>
                  </div>
                  {formData.corporateDocType.ovdImage ? (
                    <div className="space-y-2">
                      <div className="border border-purple-200 rounded-lg p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                        <img 
                          src={getImageSrc(formData.corporateDocType.ovdImage)} 
                          alt="Corporate Address Proof" 
                          className="w-full max-w-xs rounded object-cover mx-auto"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        Uploaded
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                      <p className="text-sm text-gray-500">Document not provided</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;