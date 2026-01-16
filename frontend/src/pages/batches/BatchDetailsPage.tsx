
import { useParams } from "react-router-dom";
import { PageHeader, Card } from "../../components/ui";

export function BatchDetailsPage() {
    const { id } = useParams();
    return (
        <div className="space-y-6">
            <PageHeader title={`Chi tiết Lô hàng #${id}`} />
            <Card>
                <div className="p-12 text-center text-gray-500">
                    Case Content: Batch Details View (Coming Soon)
                </div>
            </Card>
        </div>
    );
}
