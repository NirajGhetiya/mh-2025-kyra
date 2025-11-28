import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, Zap, Lock } from "lucide-react";

const Index = () => {
  const [kycId, setKycId] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (kycId) {
      navigate(`user/kyc/${kycId}`);
    }
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-3">
            <button
              onClick={handleHomeClick}
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
          <div className="flex gap-3">
            <Link to="/login">
              <Button
                variant="outline"
                className="
                font-medium 
                hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600
                hover:text-white
                hover:border-transparent
                transition-all duration-200
              "
              >
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Automated KYC Verification
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Streamline your identity verification process with AI-powered
            automation, tamper detection, and liveness checks.
          </p>
          <p className="text-lg text-gray-600 mb-8">
            To get started, enter your KYC ID below:
          </p>

          <form
            onSubmit={handleSubmit}
            className="bg-white/70 backdrop-blur-sm shadow-md border border-purple-100 rounded-2xl p-6 w-full max-w-lg mx-auto flex flex-col md:flex-row items-center gap-4"
          >
            <input
              type="text"
              placeholder="Enter KYC ID"
              value={kycId}
              onChange={(e) => setKycId(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-3 text-lg flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold px-8 py-3 rounded-lg"
            >
              Start Verification
            </Button>
          </form>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<CheckCircle className="h-7 w-7 text-green-600" />}
            title="AI-Powered Verification"
            description="Advanced AI algorithms detect tampering and verify document authenticity."
            bg="bg-green-100"
          />
          <FeatureCard
            icon={<Zap className="h-7 w-7 text-purple-600" />}
            title="Instant Processing"
            description="Real-time verification with automated workflows and instant notifications."
            bg="bg-purple-100"
          />
          <FeatureCard
            icon={<Lock className="h-7 w-7 text-yellow-600" />}
            title="Secure & Compliant"
            description="Bank-grade security with full compliance to global KYC regulations."
            bg="bg-yellow-100"
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, bg }) => (
  <div className="text-center p-6 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-all duration-200">
    <div
      className={`h-14 w-14 rounded-full ${bg} flex items-center justify-center mx-auto mb-4`}
    >
      {icon}
    </div>
    <h3 className="font-semibold text-lg mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default Index;
