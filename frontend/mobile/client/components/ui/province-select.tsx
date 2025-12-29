import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Province {
  code: string;
  name: string;
}

interface ProvinceSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

export function ProvinceSelect({
  value,
  onValueChange,
  placeholder = "Chọn Tỉnh/Thành phố",
}: ProvinceSelectProps) {
  const [provinces, setProvinces] = React.useState<Province[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch(
          "https://production.cas.so/address-kit/2025-07-01/provinces",
        );
        const data = await response.json();
        if (data && Array.isArray(data.provinces)) {
          setProvinces(data.provinces);
        }
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={loading}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Đang tải..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {provinces.map((province) => (
          <SelectItem key={province.code} value={province.code}>
            {province.name}
          </SelectItem>
        ))}
        {provinces.length === 0 && !loading && (
          <div className="p-2 text-sm text-center text-muted-foreground">
            Không có dữ liệu
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
