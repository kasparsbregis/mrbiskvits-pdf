"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function Home() {
  const [formData, setFormData] = useState({
    recipientName: "",
    registrationNumber: "",
    selectedOptions: [] as { name: string; price: number; quantity: number }[],
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const options = [
    { name: "AVEŅU TIRAMISU", price: 20.0 },
    { name: "JUBILEJAS KŪKA", price: 30.0 },
    { name: "MANGO KŪKA", price: 23.0 },
    { name: "MEDUS KŪKA", price: 17.0 },
    { name: "ŠOKOLĀDES RUMA KŪKA", price: 25.0 },
    { name: "SVAIGĒDĀJU KŪKA", price: 33.0 },
    { name: "TEST KŪKA", price: 33.0 },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (option: { name: string; price: number }) => {
    setFormData((prev) => ({
      ...prev,
      selectedOptions: prev.selectedOptions.some(
        (item) => item.name === option.name
      )
        ? prev.selectedOptions.filter((item) => item.name !== option.name)
        : [...prev.selectedOptions, { ...option, quantity: 1 }],
    }));
  };

  const handleQuantityChange = (optionName: string, quantity: number) => {
    if (quantity < 1) return;
    setFormData((prev) => ({
      ...prev,
      selectedOptions: prev.selectedOptions.map((item) =>
        item.name === optionName ? { ...item, quantity } : item
      ),
    }));
  };

  const handleRemoveService = (optionName: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedOptions: prev.selectedOptions.filter(
        (item) => item.name !== optionName
      ),
    }));
  };

  // Calculate total price
  const totalPrice = formData.selectedOptions.reduce(
    (sum, option) => sum + option.price * option.quantity,
    0
  );
  const vatAmount = totalPrice * 0.21;
  const finalTotal = totalPrice + vatAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-pdf-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "rekins.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        console.error("PDF generation failed:", errorData);
        alert(
          `PDF ģenerēšana neizdevās: ${errorData.details || errorData.error}`
        );
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Radās kļūda PDF ģenerēšanas laikā");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="flex w-full max-w-4xl flex-col gap-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            PDF Rēķina Ģenerators
          </h1>
        </div>

        {/* Form Card */}
        <div
          className="rounded-lg border border-gray-200 bg-white shadow-lg"
          style={{ padding: "40px" }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Recipient Name */}
            <div className="space-y-2">
              <label
                htmlFor="recipientName"
                className="block text-sm font-medium text-gray-700"
              >
                Saņēmēja nosaukums
              </label>
              <Input
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleInputChange}
                placeholder="Saņēmēja nosaukums"
                required
                style={{ padding: "12px 16px", height: "48px" }}
                className="w-full text-center"
              />
            </div>

            {/* Registration Number */}
            <div className="space-y-2">
              <label
                htmlFor="registrationNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Saņēmēja reģistrācijas numurs
              </label>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                placeholder="Reģistrācijas numurs"
                required
                style={{ padding: "12px 16px", height: "48px" }}
                className="w-full text-center"
              />
            </div>

            {/* Services Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Izvēlieties pakalpojumus
              </label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-md border border-gray-200 transition-colors hover:bg-gray-50"
                    style={{ padding: "16px" }}
                  >
                    <Checkbox
                      id={`option-${index}`}
                      checked={formData.selectedOptions.some(
                        (item) => item.name === option.name
                      )}
                      onCheckedChange={() => handleCheckboxChange(option)}
                    />
                    <label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer text-gray-700"
                    >
                      {option.name}
                    </label>
                    <span className="font-medium text-gray-600">
                      €{option.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Services with Quantity Controls */}
            {formData.selectedOptions.length > 0 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Izvēlētie pakalpojumi
                </label>
                <div className="flex flex-col gap-1">
                  {formData.selectedOptions.map((selectedOption, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-200 px-3 py-2"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {selectedOption.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          €{selectedOption.price.toFixed(2)} par vienību
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(
                                selectedOption.name,
                                selectedOption.quantity - 1
                              )
                            }
                            disabled={selectedOption.quantity <= 1}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {selectedOption.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(
                                selectedOption.name,
                                selectedOption.quantity + 1
                              )
                            }
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                        <div className="min-w-[80px] text-right">
                          <span className="font-semibold text-gray-900">
                            €
                            {(
                              selectedOption.price * selectedOption.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleRemoveService(selectedOption.name)
                          }
                          className="h-8 w-8 border-red-300 p-0 text-red-600 hover:cursor-pointer hover:border-red-400 hover:bg-red-500 hover:text-white"
                          style={{ marginLeft: "12px" }}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Price Display */}
            {formData.selectedOptions.length > 0 && (
              <div className="rounded-lg bg-green-300 px-4 py-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                  KOPĒJĀ SUMMA
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pakalpojumi:</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>PVN (21%):</span>
                    <span>€{vatAmount.toFixed(2)}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Kopā:</span>
                    <span>€{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full hover:cursor-pointer"
              size="lg"
              style={{ margin: "10px 0" }}
            >
              {isGenerating ? "Ģenerē PDF..." : "Ģenerēt PDF rēķinu"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
