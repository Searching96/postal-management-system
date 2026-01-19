import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { LucideIcon, ChevronDown, Check, Search, X } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
  group?: string;
  disabled?: boolean;
}

interface FormSelectProps {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  options: SelectOption[];
  value: string | number | null | undefined;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  className?: string;
  description?: string;
}

export function FormSelect({
  label,
  icon: Icon,
  error,
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  required = false,
  searchable = true,
  className = "",
  description,
}: FormSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Position state
  const [position, setPosition] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const selectedOption = options.find((opt) => opt.value === value);

  // --- Logic: Click Outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Close if click is outside both container and the portal dropdown
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // --- Logic: Intersection Observer (Auto-close on scroll away) ---
  useEffect(() => {
    if (!buttonRef.current || !isOpen) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          setIsOpen(false);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(buttonRef.current);
    return () => observerRef.current?.disconnect();
  }, [isOpen]);

  // --- Logic: Positioning ---
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 6, // Slight offset
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
      // Recalculate on window events
      window.addEventListener("scroll", updatePosition, true); // true = capture phase for all scrolling elements
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // --- Logic: Filtering ---
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const lowerTerm = searchTerm.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lowerTerm) ||
        (opt.group && opt.group.toLowerCase().includes(lowerTerm))
    );
  }, [options, searchTerm]);

  // Grouping Logic
  const { groups, ungrouped } = useMemo(() => {
    const groupsSet = new Set<string>();
    const ungroupedList: SelectOption[] = [];

    filteredOptions.forEach((opt) => {
      if (opt.group) groupsSet.add(opt.group);
      else ungroupedList.push(opt);
    });

    return {
      groups: Array.from(groupsSet),
      ungrouped: ungroupedList,
    };
  }, [filteredOptions]);

  // Reset search when closed
  useEffect(() => {
    if (!isOpen) setSearchTerm("");
  }, [isOpen]);

  // --- Render: Dropdown Portal Content ---
  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="fixed bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        maxHeight: "300px", // Max height constraint
        zIndex: 9999,
      }}
    >
      {/* Search Input */}
      {searchable && (
        <div className="p-2 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
          <div className="relative flex items-center">
            <Search className="absolute left-2 w-4 h-4 text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm outline-none focus:border-primary-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Options List */}
      <ul className="overflow-y-auto py-1 custom-scrollbar flex-1">
        {filteredOptions.length === 0 ? (
          <li className="px-4 py-8 text-sm text-gray-400 text-center flex flex-col items-center">
            <Search className="w-8 h-8 mb-2 opacity-20" />
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
                  if (!opt.disabled) {
                    onChange(opt.value);
                    setIsOpen(false);
                  }
                }}
              />
            ))}

            {groups.map((groupName) => (
              <div key={groupName}>
                <div className="px-3 py-1.5 mt-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50">
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
                        if (!opt.disabled) {
                          onChange(opt.value);
                          setIsOpen(false);
                        }
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
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative w-full text-left transition-all duration-200 text-sm
            ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5 
            border rounded-xl outline-none bg-white
            ${disabled
              ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
              : "hover:border-gray-300 hover:bg-gray-50/50"
            }
            ${isOpen
              ? "ring-2 ring-primary-500/20 border-primary-500 shadow-sm"
              : "border-gray-200"
            }
            ${error ? "border-red-300 ring-red-100" : ""}
          `}
        >
          {Icon && (
            <Icon
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${isOpen ? "text-primary-600" : "text-gray-400"
                }`}
            />
          )}

          <span className={`block truncate ${!selectedOption ? "text-gray-400" : "text-gray-900 font-medium"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary-600" : ""
                }`}
            />
          </span>
        </button>

        {/* Portal Rendering */}
        {isOpen && typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
      </div>

      {description && !error && <p className="text-xs text-gray-500 ml-1">{description}</p>}
      {error && <p className="text-xs font-medium text-red-500 mt-1 ml-1 flex items-center gap-1">
        {error}
      </p>}
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
        flex items-center justify-between px-3 py-2.5 text-sm transition-colors mx-1 rounded-lg my-0.5
        ${option.disabled
          ? "opacity-50 cursor-not-allowed bg-gray-50"
          : "cursor-pointer hover:bg-gray-100 active:bg-gray-200"
        }
        ${isSelected && !option.disabled ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-700"}
      `}
    >
      <span className="truncate mr-2">{option.label}</span>
      {isSelected && <Check className="w-4 h-4 text-primary-600 shrink-0" />}
    </li>
  );
}