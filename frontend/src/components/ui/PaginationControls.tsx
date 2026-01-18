import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationControlsProps {
    page: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    onPageChange: (p: number) => void;
}

export function PaginationControls({
    page,
    totalPages,
    totalElements,
    pageSize,
    onPageChange,
}: PaginationControlsProps) {
    return (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-700">
                Đang hiển thị <span className="font-medium">{page * pageSize + 1}</span> đến{" "}
                <span className="font-medium">
                    {Math.min((page + 1) * pageSize, totalElements)}
                </span>{" "}
                trong tổng số <span className="font-medium">{totalElements}</span> kết quả
            </span>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0}
                    className="py-1 px-3 text-sm h-9"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Trước
                </Button>
                <Button
                    variant="outline"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="py-1 px-3 text-sm h-9"
                >
                    Sau
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
