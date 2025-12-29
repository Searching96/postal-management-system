import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Commune {
  code: string;
  name: string;
  provinceCode: string;
}

interface CommuneSelectProps {
  provinceCode?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CommuneSelect({
  provinceCode,
  value,
  onValueChange,
  placeholder = "Chọn Phường/Xã",
  disabled = false,
}: CommuneSelectProps) {
  const [communes, setCommunes] = React.useState<Commune[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!provinceCode) {
      setCommunes([]);
      return;
    }

    const fetchCommunes = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://production.cas.so/address-kit/2025-07-01/provinces/${provinceCode}/communes`,
        );
        const data = await response.json();
        if (data && Array.isArray(data.communes)) {
          setCommunes(data.communes);
        }
      } catch (error) {
        console.error("Failed to fetch communes:", error);
        setCommunes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunes();
  }, [provinceCode]);

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || loading || !provinceCode}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Đang tải..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {communes.map((commune) => (
          <SelectItem key={commune.code} value={commune.name}>
            {commune.name}
          </SelectItem>
        ))}
        {communes.length === 0 && !loading && (
          <div className="p-2 text-sm text-center text-muted-foreground">
            {provinceCode
              ? "Không có dữ liệu"
              : "Vui lòng chọn tỉnh thành trước"}
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
