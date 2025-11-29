import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { StatsOverview } from "../components/dashboard/StatsOverview";
import { StatusCards } from "../components/dashboard/StatusCards";
import { ChartsSection } from "../components/dashboard/ChartsSection";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { KYCList } from "../components/dashboard/KYCList";
import { StatusDistribution } from "@/components/dashboard/StatusDistribution";
import { toast } from 'sonner';
import axiosInstance from '@/api/axiosInstance';
import { X, User, Mail, Phone } from "lucide-react";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "" });
  const [recentActivity, setRecentActivity] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await axiosInstance.get("/admin/kyc/dashboard");
      setRecentActivity(response.data.data?.top_kycs || []);
      setDashboardData(response.data.data || {
        total_kyc_count: 0,
        todays_kyc_count: 0,
        approval_rate: 0.0,
        total_rejected: 0,
        avg_processing: 0.0,
        total_approved: 0,
        total_under_review: 0,
        total_pending: 0,
        week_growth: 12
      });
    } catch (error) {
      toast.error("Failed to load KYC data");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.mobile) {
      toast.error('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (formData.mobile.length < 10) {
      toast.error('Please enter a valid mobile number.');
      return;
    }

    try {
      const response = await axiosInstance.post('/admin/kyc/initiate', {
        name: formData.name,
        email: formData.email,
        mobile_number: formData.mobile,
      });

      const data = response.data;

      if (data?.data?.kyc_id) {
        toast.success(`${data.message} (KYC ID: ${data.data.kyc_id})`);
        setIsModalOpen(false);
        setFormData({ name: "", email: "", mobile: "" });
        loadDashboardData();
      } else {
        toast.error(`${data.message || "Failed to initiate KYC"}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to initiate KYC");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({ name: "", email: "", mobile: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="w-full p-4 md:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="mb-4">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              KYC Dashboard
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Manage and monitor KYC verifications
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg 
                        hover:from-blue-700 hover:to-purple-700 
                        transition-all duration-200 shadow-lg hover:shadow-xl 
                        transform hover:scale-105 flex items-center gap-2"
              onClick={() => setIsModalOpen(true)}
            >
              <User className="w-4 h-4" />
              New KYC Initiation
            </button>
          </div>
        </div>

        {dashboardData && (
          <>
            <StatsOverview stats={dashboardData} />
            <StatusCards stats={dashboardData} />
          </>
        )}

        <div className="pt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ChartsSection />
          </div>
          <div className="space-y-6">
            {dashboardData && <StatusDistribution stats={dashboardData} />}
            <RecentActivity data={recentActivity} />
          </div>
        </div>

        <KYCList />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-200 scale-100 animate-in fade-in-90 zoom-in-95"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">New KYC Initiation</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Enter customer details to start KYC verification
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="Enter mobile number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={formData.mobile}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={!formData.name || !formData.email || !formData.mobile}
              >
                Initiate KYC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;