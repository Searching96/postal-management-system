
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../../services/authService";
import { Loader2 } from "lucide-react";

export default function DebugLoginPage() {
    const { phoneNumber } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const login = async () => {
            if (!phoneNumber) return;

            try {
                const res = await authService.login({
                    username: phoneNumber,
                    password: "123456" // Default password
                });

                if (res.success && res.data) {
                    authService.setToken(res.data.token);
                    toast.success(`Debug login successful as ${phoneNumber}`);

                    // Decode token to find role would be better, but for now redirect to root which handles role routing
                    // or just reload to trigger App.tsx redirect logic
                    window.location.href = "/";
                } else {
                    toast.error("Login failed");
                    navigate("/login");
                }
            } catch (error) {
                console.error("Debug login error", error);
                toast.error("Debug login failed");
                navigate("/login");
            }
        };

        login();
    }, [phoneNumber, navigate]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 flex-col gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            <p className="text-gray-500 font-medium">Logging in as {phoneNumber}...</p>
        </div>
    );
}
