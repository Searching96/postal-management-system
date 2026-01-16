import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [position, setPosition] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!buttonRef.current) return;

    // Create observer only once
    observerRef.current = new IntersectionObserver(
        (entries) => {
        // If the button is not intersecting (not visible in viewport)
        if (!entries[0].isIntersecting && isOpen) {
            setIsOpen(false);
        }
        },
        {
        threshold: 0.1,           // Consider "visible" if at least 10% is in view
        rootMargin: "0px",        // You can adjust: "-50px" to close earlier
        }
    );

    observerRef.current.observe(buttonRef.current);

    return () => {
        if (observerRef.current) {
        observerRef.current.disconnect();
        }
    };
    }, [isOpen]);

  // Calculate position relative to viewport (best for most modal cases)
  const updatePosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + 8,     // 8px gap below the button
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;

    updatePosition();

    // Update position on scroll & resize
    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    // Also listen to modal scroll (most important!)
    // Try to find the nearest scrollable ancestor (you may need to adjust selector)
    let current: HTMLElement | null = buttonRef.current;
    while (current && current !== document.body) {
      if (current.scrollHeight > current.clientHeight) {
        current.addEventListener("scroll", updatePosition);
        break;
      }
      current = current.parentElement;
    }

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      if (current) {
        current.removeEventListener("scroll", updatePosition);
      }
    };
  }, [isOpen]);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.group && opt.group.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groups = Array.from(new Set(filteredOptions.filter((o) => o.group).map((o) => o.group)));
  const ungrouped = filteredOptions.filter((o) => !o.group);

  const dropdownContent = isOpen && !disabled && (
    <div
      ref={dropdownRef}
      className="
        fixed bg-white border border-gray-100 
        rounded-2xl shadow-2xl overflow-hidden 
        animate-in fade-in zoom-in-95 duration-150
        max-h-[70vh] min-w-[180px]
      "
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        zIndex: 9999,           // Very high to appear above other modal content
      }}
    >
      {searchable && options.length > 8 && (
        <div className="p-2 border-b border-gray-50 flex items-center gap-2 bg-gray-50/80 backdrop-blur-sm">
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
          <li className="px-4 py-6 text-sm text-gray-400 text-center italic">
            Không tìm thấy kết quả
          </li>
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

            {groups.map((groupName) => (
              <div key={groupName}>
                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50/70">
                  {groupName}
                </div>
                {filteredOptions
                  .filter((o) => o.group === groupName)
                  .map((opt) => (
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
  );

  return (
    <div className={`space-y-1 relative ${isOpen ? "z-[60]" : "z-10"}`} ref={containerRef}>
      <label className="block text-sm font-bold text-gray-700 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative w-full text-left transition-all text-sm
            ${Icon ? "pl-10" : "pl-4"} 
            pr-10 py-2.5 border rounded-xl outline-none bg-white
            ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "hover:border-gray-300"}
            ${isOpen ? "ring-2 ring-primary-500/30 border-primary-500 shadow-sm" : "border-gray-200"}
            ${error ? "border-red-400 bg-red-50/50" : ""}
          `}
        >
          {Icon && (
            <Icon
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                isOpen ? "text-primary-600" : "text-gray-400"
              }`}
            />
          )}

          <span
            className={`block truncate ${
              !selectedOption && !value ? "text-gray-400" : "text-gray-900 font-medium"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-primary-600" : ""
              }`}
            />
          </span>
        </button>

        {typeof window !== "undefined" && createPortal(dropdownContent, document.body)}
      </div>

      {error && <p className="text-xs font-medium text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}

function OptionItem({
  option,
  isSelected,
  onClick,
}: {
  option: SelectOption;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <li
      onClick={onClick}
      className={`
        flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors
        ${isSelected ? "bg-primary-50 text-primary-700 font-semibold" : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"}
      `}
    >
      <span>{option.label}</span>
      {isSelected && <Check className="w-4 h-4 text-primary-600" />}
    </li>
  );
}