import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  Calendar,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const getStatusColor = (status: string) => {
  const statusConfig = {
    approved: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    rejected: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
    },
    under_review: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    pending: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-500",
    },
  };

  return (
    statusConfig[status as keyof typeof statusConfig] || {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      dot: "bg-gray-500",
    }
  );
};

interface KYCRecord {
  kyc_id: string;
  photoImage: string;
  user_name: string;
  email: string;
  status: string;
  submitted_at: string;
}

export const KYCList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [kycData, setKycData] = useState<KYCRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadKYCData = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/admin/kyc/dashboard-data", {
        params: {
          page: currentPage - 1,
          size: recordsPerPage,
          search: debouncedSearchQuery || "",
          status: statusFilter === "all" ? "" : statusFilter,
        },
      });

      setKycData(response.data.data?.records || []);
      setTotalRecords(response.data.data?.total_records || 0);
    } catch (error) {
      toast.error("Failed to load KYC data");
      console.error("KYC data loading error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKYCData();
  }, [currentPage, recordsPerPage, debouncedSearchQuery, statusFilter]);

  const totalPages = useMemo(
    () => Math.ceil(totalRecords / recordsPerPage),
    [totalRecords, recordsPerPage]
  );

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  const showingText = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage + 1;
    const end = Math.min(currentPage * recordsPerPage, totalRecords);
    return `Showing ${start} to ${end} of ${totalRecords} entries`;
  }, [currentPage, recordsPerPage, totalRecords]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRecordsPerPageChange = useCallback((value: string) => {
    setRecordsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handleRowClick = useCallback(
    (kycId: string) => {
      navigate(`/admin/kyc/${kycId}`);
    },
    [navigate]
  );

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const StatusBadge = useCallback(({ status }: { status: string }) => {
    const config = getStatusColor(status);

    return (
      <Badge
        variant="outline"
        className={`${config.bg} ${config.text} ${config.border} inline-flex items-center gap-2 px-3 py-1.5 font-medium capitalize`}
      >
        <div className={`w-2 h-2 rounded-full ${config.dot}`} />
        {status.replace("_", " ")}
      </Badge>
    );
  }, []);

  const tableRows = useMemo(() => {
    if (kycData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-16">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Shield className="w-12 h-12 text-gray-300" />
              <p className="text-lg font-semibold">No KYC records found</p>
              <p className="text-sm">
                {isLoading
                  ? "Loading records..."
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return kycData.map((record) => {
      const isPending = record.status === "pending";

      return (
        <TableRow
          key={record.kyc_id}
          onClick={() => {
            if (!isPending) handleRowClick(record.kyc_id);
          }}
          className={`group transition-all duration-300 border-b border-gray-100
          ${
            isPending
              ? "cursor-default opacity-60"
              : "cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30"
          }
        `}
        >
          <TableCell className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm">
                {record.photoImage ? (
                  <img
                    src={`${record.photoImage}`}
                    alt={record.user_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{record.kyc_id}</p>
              </div>
            </div>
          </TableCell>

          <TableCell className="py-4">
            <p className="font-medium text-gray-900">{record.user_name}</p>
          </TableCell>

          <TableCell className="py-4">
            <p className="text-gray-900">{record.email}</p>
          </TableCell>

          <TableCell className="py-4">
            <StatusBadge status={record.status} />
          </TableCell>

          <TableCell className="py-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">
                {formatDate(record.submitted_at)}
              </span>
            </div>
          </TableCell>
        </TableRow>
      );
    });
  }, [kycData, isLoading, handleRowClick, formatDate, StatusBadge]);

  const paginationButtons = useMemo(
    () =>
      pageNumbers.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          className={`w-10 h-10 font-semibold transition-all duration-300 ${
            currentPage === page
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : "hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-200"
          }`}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Button>
      )),
    [pageNumbers, currentPage, handlePageChange]
  );

  return (
    <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>

              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  KYC Records
                </CardTitle>
                <p className="text-gray-500 mt-1">
                  Manage and review all customer verifications
                </p>
              </div>
            </div>

            <div className="relative w-full lg:w-auto">
              <div className="flex flex-col lg:flex-row justify-end items-start lg:items-center gap-4">
                <div className="relative w-full lg:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, ID, or email..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2.5 w-full lg:w-80 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    value={statusFilter}
                    onValueChange={handleStatusFilterChange}
                  >
                    <SelectTrigger className="w-48 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300">
                      <Filter className="h-4 w-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={recordsPerPage.toString()}
                    onValueChange={handleRecordsPerPageChange}
                  >
                    <SelectTrigger className="w-36 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300">
                      <SelectValue placeholder="Show 10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 per page</SelectItem>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="20">20 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b-2 border-gray-200">
                <TableHead className="py-4 font-semibold text-gray-900">
                  KYC ID
                </TableHead>
                <TableHead className="py-4 font-semibold text-gray-900">
                  User Name
                </TableHead>
                <TableHead className="py-4 font-semibold text-gray-900">
                  Email
                </TableHead>
                <TableHead className="py-4 font-semibold text-gray-900">
                  Status
                </TableHead>
                <TableHead className="py-4 font-semibold text-gray-900">
                  Submitted Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{tableRows}</TableBody>
          </Table>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between p-6 border-t border-gray-200 gap-4">
          <div className="text-sm text-gray-600 font-medium">{showingText}</div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
              className="border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all duration-300 font-semibold disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-1">{paginationButtons}</div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isLoading}
              className="border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all duration-300 font-semibold disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
