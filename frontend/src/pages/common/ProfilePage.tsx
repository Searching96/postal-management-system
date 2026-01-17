import { useState, useEffect, useRef } from "react";
import { userService } from "../../services/userService";
import type { MeResponse, CustomerMeResponse, EmployeeMeResponse } from "../../models";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Shield,
    CreditCard,
    Activity,
    Building,
    Camera,
    Loader2
} from "lucide-react";
import { PageHeader, Card, LoadingSpinner, Alert } from "../../components/ui";
import { getRoleLabel, getOfficeTypeLabel } from "../../lib/utils";
import { uploadService } from "../../services/uploadService";
import { toast } from "sonner";

export function ProfilePage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<MeResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");

    const fetchProfile = async () => {
        try {
            const response = await userService.fetchMe();
            if (response.success) {
                setProfile(response.data);
            } else {
                setError(response.message || "Failed to fetch profile");
            }
        } catch (err) {
            setError("An error occurred while fetching your profile");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const res = await uploadService.uploadAvatar(file);
            if (res.success) {
                toast.success("Cập nhật ảnh đại diện thành công");
                // Refresh profile to get new avatar URL if it's there, 
                // or just manually update if the API doesn't return the full profile
                fetchProfile();
            }
        } catch (err) {
            toast.error("Lỗi khi tải ảnh lên");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return <Alert type="error">{error}</Alert>;
    }

    if (!profile) {
        return <Alert type="error">No profile data found</Alert>;
    }

    const isCustomer = profile.role === "CUSTOMER";
    const customerProfile = isCustomer ? (profile as CustomerMeResponse) : null;
    const employeeProfile = !isCustomer ? (profile as EmployeeMeResponse) : null;

    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader
                title="Trang cá nhân"
                description="Quản lý thông tin tài khoản của bạn"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1 p-6 text-center h-fit">
                    <div className="relative mx-auto w-32 h-32 mb-4 group cursor-pointer" onClick={handleAvatarClick}>
                        <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                            {/* In a real app we'd use profile.avatarUrl here */}
                            <User className="w-16 h-16 text-primary-600" />
                        </div>

                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            ) : (
                                <Camera className="w-8 h-8 text-white" />
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white ${profile.active ? 'bg-green-500' : 'bg-red-500'}`} title={profile.active ? 'Đang hoạt động' : 'Bị khóa'}></div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{profile.fullName}</h2>
                    <p className="text-sm text-gray-500 mb-4">@{profile.username}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${isCustomer ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                            {getRoleLabel(profile.role)}
                        </span>
                        {isCustomer && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow-sm">
                                {customerProfile?.subscriptionPlan}
                            </span>
                        )}
                    </div>
                </Card>

                {/* Details Section */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" />
                            Thông tin cơ bản
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                                    <p className="text-gray-900">{profile.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">Số điện thoại</p>
                                    <p className="text-gray-900">{profile.phoneNumber}</p>
                                </div>
                            </div>

                            {isCustomer && (
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">Địa chỉ</p>
                                        <p className="text-gray-900">{customerProfile?.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {!isCustomer && (
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Building className="w-5 h-5 text-gray-400" />
                                Nơi làm việc
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                        <Building className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">Bưu cục</p>
                                        <p className="text-gray-900">{employeeProfile?.office.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                        <Shield className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">Loại bưu cục</p>
                                        <p className="text-gray-900">{getOfficeTypeLabel(employeeProfile?.office.type || "")}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-gray-400" />
                            Tình trạng tài khoản
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-3 mb-1">
                                    <Activity className={`w-4 h-4 ${profile.active ? 'text-green-500' : 'text-red-500'}`} />
                                    <span className="text-xs font-medium text-gray-500 uppercase">Trạng thái</span>
                                </div>
                                <p className={`font-semibold ${profile.active ? 'text-green-600' : 'text-red-600'}`}>
                                    {profile.active ? 'Đang hoạt động' : 'Tạm khóa'}
                                </p>
                            </div>

                            {isCustomer && (
                                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                    <div className="flex items-center gap-3 mb-1">
                                        <CreditCard className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs font-medium text-gray-500 uppercase">Gói tài khoản</span>
                                    </div>
                                    <p className="font-semibold text-blue-600 uppercase">
                                        {customerProfile?.subscriptionPlan}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
