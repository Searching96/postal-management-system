import { useState, useRef, useEffect } from "react";
import { LucideIcon, ChevronDown, Check, Search } from "lucide-react";

export interface SelectOption {
    value: string | number;
    label: string;
    group?: string;
}

interface FormSelectProps {
    label: string;
    icon?: LucideIcon;
    error?: string;
    options: SelectOption[];
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    searchable?: boolean;
}

export function FormSelect({
    label,
    icon: Icon,
    error,
    options,
    value,
    onChange,
    placeholder = "-- Chọn --",
    disabled = false,
    required = false,
    searchable = true,
}: FormSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.group && opt.group.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Grouping logic
    const groups = Array.from(new Set(filteredOptions.filter(o => o.group).map(o => o.group)));
    const ungrouped = filteredOptions.filter(o => !o.group);

    return (
        <div className={`space-y-1 relative ${isOpen ? 'z-[60]' : 'z-10'}`} ref={containerRef}>
            <label className="block text-sm font-bold text-gray-700 ml-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
            relative w-full text-left transition-all text-sm
            ${Icon ? "pl-10" : "pl-4"} 
            pr-10 py-2.5 border rounded-xl outline-none bg-white
            ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "hover:border-gray-300"}
            ${isOpen ? "ring-2 ring-primary-500/20 border-primary-500" : "border-gray-200"}
            ${error ? "border-red-300 bg-red-50" : ""}
          `}
                >
                    {Icon && (
                        <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${isOpen ? "text-primary-500" : "text-gray-400"}`} />
                    )}

                    <span className={`block truncate ${!selectedOption && !value ? "text-gray-400" : "text-gray-900"}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>

                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary-500" : ""}`} />
                    </span>
                </button>

                {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {searchable && options.length > 8 && (
                            <div className="p-2 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
                                <Search className="w-4 h-4 text-gray-400 ml-1" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className="w-full bg-transparent text-sm outline-none py-1"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}

                        <ul className="max-h-64 overflow-y-auto py-1 custom-scrollbar">
                            {filteredOptions.length === 0 ? (
                                <li className="px-4 py-3 text-sm text-gray-400 text-center italic">Không tìm thấy kết quả</li>
                            ) : (
                                <>
                                    {ungrouped.map((opt) => (
                                        <OptionItem
                                            key={opt.value}
                                            option={opt}
                                            isSelected={opt.value === value}
                                            onClick={() => {
                                                onChange(opt.value);
                                                setIsOpen(false);
                                            }}
                                        />
                                    ))}

                                    {groups.map(groupName => (
                                        <div key={groupName}>
                                            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                                                {groupName}
                                            </div>
                                            {filteredOptions.filter(o => o.group === groupName).map(opt => (
                                                <OptionItem
                                                    key={opt.value}
                                                    option={opt}
                                                    isSelected={opt.value === value}
                                                    onClick={() => {
                                                        onChange(opt.value);
                                                        setIsOpen(false);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </>
                            )}
                        </ul>
                    </div>
                )}
            </div>
            {error && <p className="text-xs font-medium text-red-500 mt-1 ml-1">{error}</p>}
        </div>
    );
}

function OptionItem({ option, isSelected, onClick }: { option: SelectOption, isSelected: boolean, onClick: () => void }) {
    return (
        <li
            onClick={onClick}
            className={`
        flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors
        ${isSelected ? "bg-primary-50 text-primary-700 font-bold" : "text-gray-700 hover:bg-gray-50"}
      `}
        >
            <span>{option.label}</span>
            {isSelected && <Check className="w-4 h-4" />}
        </li>
    );
}
