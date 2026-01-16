import { useState, useEffect, useRef } from "react";
import { administrativeService } from "../../services/administrativeService";
import type { ProvinceResponse, WardResponse } from "../../models";
import { FormInput, FormSelect } from "./index";
import { MapPin, Building2, Map as MapIcon } from "lucide-react";

interface AddressSelectorProps {
    label: string;
    onAddressChange: (fullAddress: string) => void;
    onProvinceChange?: (provinceCode: string) => void;
    initialValue?: string;
    required?: boolean;
    provinceCode?: string; // External province code
    hideProvince?: boolean; // Option to hide province selector
}

export function AddressSelector({
    label,
    onAddressChange,
    onProvinceChange,
    initialValue = "",
    required = false,
    provinceCode: externalProvinceCode,
    hideProvince = false
}: AddressSelectorProps) {
    const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
    const [wards, setWards] = useState<WardResponse[]>([]);

    const [selectedProvince, setSelectedProvince] = useState(externalProvinceCode || "");
    const [selectedWard, setSelectedWard] = useState("");
    const [street, setStreet] = useState("");

    const [isLoadingWards, setIsLoadingWards] = useState(false);
    const [queuedWardName, setQueuedWardName] = useState("");

    const isInitialMount = useRef(true);

    // Sync with external province code
    useEffect(() => {
        if (externalProvinceCode !== undefined) {
            setSelectedProvince(externalProvinceCode);
        }
    }, [externalProvinceCode]);

    // Fetch Provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await administrativeService.getAllProvinces();
                if (response.success) {
                    setProvinces(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch provinces", err);
            }
        };
        fetchProvinces();
    }, []);

    // Parse Initial Value
    useEffect(() => {
        if (initialValue && provinces.length > 0 && isInitialMount.current) {
            const parts = initialValue.split(",").map(p => p.trim());
            if (parts.length >= 3) {
                const provincePart = parts[parts.length - 1];
                const wardPart = parts[parts.length - 2];
                const streetPart = parts.slice(0, parts.length - 2).join(", ");

                const province = provinces.find(p => p.name === provincePart);
                if (province) {
                    setSelectedProvince(province.code);
                    setStreet(streetPart);
                    setQueuedWardName(wardPart);
                }
            }
            isInitialMount.current = false;
        }
    }, [initialValue, provinces]);

    // Fetch Wards when province changes
    useEffect(() => {
        if (selectedProvince) {
            const fetchWards = async () => {
                setIsLoadingWards(true);
                try {
                    const response = await administrativeService.getWardsByProvince(selectedProvince);
                    if (response.success) {
                        setWards(response.data);

                        if (queuedWardName) {
                            const ward = response.data.find(w => w.name === queuedWardName);
                            if (ward) setSelectedWard(ward.code);
                            setQueuedWardName("");
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch wards", err);
                    setWards([]);
                } finally {
                    setIsLoadingWards(false);
                }
            };
            fetchWards();
            if (onProvinceChange) onProvinceChange(selectedProvince);
        } else {
            setWards([]);
            setSelectedWard("");
        }
    }, [selectedProvince]);

    // Bubbling up changes
    useEffect(() => {
        const provinceObj = provinces.find(p => p.code === selectedProvince);
        const wardObj = wards.find(w => w.code === selectedWard);

        const parts = [
            street.trim(),
            wardObj?.name,
            provinceObj?.name
        ].filter(Boolean);

        const fullAddress = parts.join(", ");
        onAddressChange(fullAddress);
    }, [selectedProvince, selectedWard, street, provinces, wards]);

    return (
        <div className="space-y-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                <div className="p-1.5 bg-primary-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-sm font-bold text-gray-900">{label}</span>
            </div>

            <div className={`grid grid-cols-1 ${hideProvince ? '' : 'md:grid-cols-2'} gap-4`}>
                {!hideProvince && (
                    <FormSelect
                        label="Tỉnh / Thành phố"
                        icon={Building2}
                        required={required}
                        value={selectedProvince}
                        onChange={(val) => setSelectedProvince(val as string)}
                        options={[
                            { value: "", label: "-- Chọn Tỉnh/Thành --" },
                            ...provinces.map(p => ({ value: p.code, label: p.name }))
                        ]}
                    />
                )}

                <FormSelect
                    label="Phường / Xã"
                    icon={MapIcon}
                    required={required}
                    value={selectedWard}
                    disabled={!selectedProvince || isLoadingWards}
                    onChange={(val) => setSelectedWard(val as string)}
                    options={[
                        {
                            value: "",
                            label: isLoadingWards ? "Đang tải..." : "-- Chọn Phường/Xã --"
                        },
                        ...wards.map(w => ({ value: w.code, label: w.name }))
                    ]}
                />
            </div>

            <FormInput
                label="Số nhà, tên đường"
                placeholder="VD: 123 Nguyễn Huệ"
                required={required}
                value={street}
                onChange={(e) => setStreet(e.target.value)}
            />
        </div>
    );
}
