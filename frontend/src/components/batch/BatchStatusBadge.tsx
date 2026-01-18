import { Badge } from "../ui";

export type BatchStatus = "OPEN" | "PROCESSING" | "SEALED" | "IN_TRANSIT" | "ARRIVED" | "DISTRIBUTED" | "CANCELLED";

interface BatchStatusBadgeProps {
    status: BatchStatus;
}

export function BatchStatusBadge({ status }: BatchStatusBadgeProps) {
    const getBadgeVariant = () => {
        switch (status) {
            case "OPEN":
                return "secondary";
            case "PROCESSING":
                return "warning";
            case "SEALED":
                return "info";
            case "IN_TRANSIT":
                return "info";
            case "ARRIVED":
                return "success";
            case "DISTRIBUTED":
                return "success";
            case "CANCELLED":
                return "destructive";
            default:
                return "secondary";
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case "OPEN":
                return "Đang mở";
            case "PROCESSING":
                return "Đang xử lý";
            case "SEALED":
                return "Đã niêm phong";
            case "IN_TRANSIT":
                return "Đang vận chuyển";
            case "ARRIVED":
                return "Đã đến";
            case "DISTRIBUTED":
                return "Đã dỡ hàng";
            case "CANCELLED":
                return "Đã hủy";
            default:
                return status;
        }
    };

    return (
        <Badge variant={getBadgeVariant() as any}>
            {getStatusLabel()}
        </Badge>
    );
}
