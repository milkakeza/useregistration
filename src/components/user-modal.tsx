"use client";

import type React from "react";

import { useState, useEffect } from "react";
// import type { User, CreateUserData } from "../../types/user"

export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "radio" | "date";
  options?: string[]; // For select or radio
  required?: boolean;
  placeholder?: string;
  pattern?: string;
  title?: string;
  min?: number | string;
  max?: number | string;
  value?: string;
  minLength?: number;
  maxLength?: number;
  readonly?: boolean;
  customLabels?: Record<string, string>; // For custom option labels in select
  onInput?: (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onInvalid?: (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  // onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: Record<string, any>) => void;
  title: string;
  fields: FormField[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: Record<string, any>;
  onUserSelection?: (userId: string) => void;
  selectedUserName?: string;
  selectedUserId?: string;
}

export function GenericModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  initialData,
  onUserSelection,
  selectedUserName,
  selectedUserId,
}: GenericModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const defaultData: Record<string, any> = {};
      fields.forEach((f) => {
        defaultData[f.name] = initialData?.[f.name] ?? "";
      });
      setFormData(defaultData);
    }
  }, [fields, initialData, isOpen]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "userNo" && onUserSelection) {
      onUserSelection(value);
    }
  };

  useEffect(() => {
    if (selectedUserName) {
      setFormData((prev) => {
        // Only update if the fullName is different to prevent unnecessary re-renders
        if (prev.fullName !== selectedUserName) {
          return { ...prev, fullName: selectedUserName };
        }
        return prev;
      });
    }
  }, [selectedUserName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resetData: Record<string, any> = {};
    fields.forEach((f) => (resetData[f.name] = ""));
    setFormData(resetData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative transform transition-all duration-300">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
        >
          &times;
        </button>

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-6">
            {title}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => {
              switch (field.type) {
                case "text":
                case "number":
                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder}
                        min={field.min}
                        max={field.max}
                        minLength={field.minLength}
                        maxLength={field.maxLength}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          {handleChange(field.name, e.target.value)}
                        }
                        readOnly={field.readonly}
                        onInput={field.onInput}
                        className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          field.readonly
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-gray-50 focus:bg-white"
                        }`}
                      />
                    </div>
                  );
                case "date":
                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="date"
                        min={field.min}
                        max={field.max}
                        required={field.required}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      />
                    </div>
                  );
                case "textarea":
                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <textarea
                        rows={2}
                        required={field.required}
                        placeholder={field.placeholder}
                        minLength={field.minLength}
                        maxLength={field.maxLength}
                        value={formData[field.name] || ""}
                        onInput={field.onInput}
                        onInvalid={field.onInvalid}
                        
                        // minLength={field.min}
                        // maxLength={field.max}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                      />
                    </div>
                  );
                case "select":
                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      {field.name === "userNo" ? (
                        <select
                          required={field.required}
                          value={selectedUserId || ""}
                          onChange={(e) => {
                            handleChange(field.name, e.target.value);
                            onUserSelection?.(e.target.value);
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        >
                          {/* <select
                        required={field.required}
                        value={selectedUserName || ""}  // <-- controlled by selectedUserId
  onChange={(e) => {
    handleChange(field.name, e.target.value) // update formData if needed
    onUserSelection?.(e.target.value)       // update selectedUserId + Name
  }}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      > */}
                          <option value="" disabled>
                            Select {field.label}
                          </option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {field.customLabels?.[option] || option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        // All other selects controlled by formData
                        <select
                          required={field.required}
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        >
                          <option value="" disabled>
                            Select {field.label}
                          </option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {field.customLabels?.[option] || option}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );

                case "radio":
                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <div className="flex gap-3">
                        {field.options?.map((option) => (
                          <label
                            key={option}
                            className="flex items-center cursor-pointer text-sm"
                          >
                            <input
                              type="radio"
                              name={field.name}
                              value={option}
                              required={field.required}
                              checked={formData[field.name] === option}
                              onChange={(e) =>
                                handleChange(field.name, e.target.value)
                              }
                              className="sr-only"
                            />
                            <div
                              className={`w-4 h-4 border-2 rounded-full mr-2 flex items-center justify-center transition-colors ${
                                formData[field.name] === option
                                  ? "border-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {formData[field.name] === option && (
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                default:
                  return null;
              }
            })}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-amber-500 text-white font-medium py-2.5 px-4 text-sm rounded-lg hover:bg-amber-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-gray-100 text-gray-700 font-medium py-2.5 px-4 text-sm rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export { GenericModal as UserModal };
