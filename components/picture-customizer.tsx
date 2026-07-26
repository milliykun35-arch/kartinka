"use client"

import React, { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { MATERIALS, PRESET_SIZES, calculateCustomPrice, type MaterialOption, type SizeOption } from "@/lib/pricing"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Sliders, Palette, Maximize2, Layers } from "lucide-react"

interface PictureCustomizerProps {
  basePrice?: number
  onChange?: (config: {
    material: MaterialOption
    size: SizeOption | { label: string; width: number; height: number; price: number; isCustom: boolean }
    totalPrice: number
  }) => void
}

export function PictureCustomizer({ basePrice, onChange }: PictureCustomizerProps) {
  const { t, lang } = useLanguage()
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("pechat")
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0)
  const [sizeMode, setSizeMode] = useState<"preset" | "custom">("preset")
  const [customWidth, setCustomWidth] = useState<number>(90)
  const [customHeight, setCustomHeight] = useState<number>(60)

  const currentMaterial = MATERIALS.find((m) => m.id === selectedMaterialId) || MATERIALS[0]
  const currentPresets = PRESET_SIZES[selectedMaterialId] || PRESET_SIZES["pechat"]

  useEffect(() => {
    setSelectedPresetIndex(0)
    setSizeMode("preset")
  }, [selectedMaterialId])

  let currentPrice = 0
  let currentSizeObj: any = null

  if (sizeMode === "custom") {
    const calcPrice = calculateCustomPrice(selectedMaterialId, customWidth, customHeight)
    currentPrice = calcPrice
    currentSizeObj = {
      label: `${customHeight}x${customWidth} sm (Custom)`,
      width: customWidth,
      height: customHeight,
      price: calcPrice,
      isCustom: true,
    }
  } else {
    const preset = currentPresets[selectedPresetIndex] || currentPresets[0]
    currentPrice = preset?.price || basePrice || 250000
    currentSizeObj = preset
  }

  useEffect(() => {
    if (onChange && currentSizeObj) {
      onChange({
        material: currentMaterial,
        size: currentSizeObj,
        totalPrice: currentPrice,
      })
    }
  }, [selectedMaterialId, selectedPresetIndex, sizeMode, customWidth, customHeight, currentPrice])

  const formatPrice = (price: number) => new Intl.NumberFormat("uz-UZ").format(price)

  return (
    <div className="space-y-4 rounded-2xl border-2 border-[#7C5C3E]/20 bg-card p-4 sm:p-5 shadow-lg">
      {/* 1. Material Selection (Compact 2x2 Grid) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold flex items-center gap-1.5 text-foreground">
            <Palette className="h-4 w-4 text-[#7C5C3E]" />
            <span>1. {t("Materialni tanlang", "Выберите материал")}</span>
          </Label>
          <span className="text-xs font-semibold text-[#7C5C3E]">
            {lang === "uz" ? currentMaterial.name_uz : currentMaterial.name_ru}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {MATERIALS.map((mat) => {
            const isSelected = selectedMaterialId === mat.id
            return (
              <button
                key={mat.id}
                type="button"
                onClick={() => setSelectedMaterialId(mat.id)}
                className={`relative flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                  isSelected
                    ? "border-[#7C5C3E] bg-[#7C5C3E]/10 font-bold shadow-sm ring-1 ring-[#7C5C3E]"
                    : "border-border hover:border-gray-300"
                }`}
              >
                <span className="text-xs font-bold text-foreground truncate">
                  {lang === "uz" ? mat.name_uz.split(" ")[0] : mat.name_ru.split(" ")[0]}
                </span>
                {mat.badge && (
                  <Badge className="bg-[#7C5C3E] text-white text-[9px] px-1 py-0 scale-90">
                    {mat.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Size Selection (Compact Dropdown + Custom Mode Switcher) */}
      <div className="space-y-2.5 border-t pt-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold flex items-center gap-1.5 text-foreground">
            <Maximize2 className="h-4 w-4 text-[#7C5C3E]" />
            <span>2. {t("O'lchamni tanlang", "Выберите размер")}</span>
          </Label>

          {/* Mode Switcher Pills */}
          <div className="flex rounded-lg bg-muted p-0.5 border">
            <button
              type="button"
              onClick={() => setSizeMode("preset")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                sizeMode === "preset" ? "bg-background text-[#7C5C3E] shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t("Standart", "Стандарт")}
            </button>
            <button
              type="button"
              onClick={() => setSizeMode("custom")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                sizeMode === "custom" ? "bg-background text-[#7C5C3E] shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t("Custom cm", "Свой размер")}
            </button>
          </div>
        </div>

        {/* Preset Select Dropdown */}
        {sizeMode === "preset" ? (
          <div className="space-y-2">
            <select
              value={selectedPresetIndex}
              onChange={(e) => setSelectedPresetIndex(Number(e.target.value))}
              className="flex h-11 w-full rounded-xl border-2 border-[#7C5C3E]/30 bg-background px-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C5C3E]"
            >
              {currentPresets.map((preset, idx) => (
                <option key={idx} value={idx}>
                  {preset.label} — {formatPrice(preset.price)} {t("so'm", "сум")} {preset.isTriptych ? "(3 tali)" : ""}
                </option>
              ))}
            </select>

            {/* Quick Pill Shortcuts for top 3 sizes */}
            <div className="flex flex-wrap gap-1.5">
              {currentPresets.slice(0, 4).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPresetIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    selectedPresetIndex === idx
                      ? "border-[#7C5C3E] bg-[#7C5C3E] text-white shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-[#7C5C3E]"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Custom Size Inputs */
          <div className="p-3 rounded-xl bg-amber-500/10 border border-[#7C5C3E]/30 space-y-2 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px] font-bold text-muted-foreground">{t("Bo'yi (sm)", "Высота (см)")}</Label>
                <Input
                  type="number"
                  min="20"
                  max="300"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Math.max(10, Number(e.target.value)))}
                  className="h-9 mt-0.5 border-[#7C5C3E] bg-background font-bold text-center text-sm"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-muted-foreground">{t("Eni (sm)", "Ширина (см)")}</Label>
                <Input
                  type="number"
                  min="20"
                  max="300"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Math.max(10, Number(e.target.value)))}
                  className="h-9 mt-0.5 border-[#7C5C3E] bg-background font-bold text-center text-sm"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center font-medium">
              {customHeight} x {customWidth} sm = {(customHeight * customWidth).toLocaleString()} sm²
            </p>
          </div>
        )}
      </div>

      {/* Compact Price Summary Bar */}
      <div className="rounded-xl bg-[#7C5C3E]/10 p-3 flex items-center justify-between border border-[#7C5C3E]/30">
        <div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase">{t("Tanlangan kompozitsiya:", "Конфигурация:")}</p>
          <p className="text-xs font-bold text-foreground truncate max-w-[180px] sm:max-w-[240px]">
            {lang === "uz" ? currentMaterial.name_uz : currentMaterial.name_ru} — <span className="text-[#7C5C3E]">{currentSizeObj?.label}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground font-bold uppercase">{t("Jami narx:", "Итого:")}</p>
          <p className="text-base sm:text-xl font-black text-[#7C5C3E]">
            {formatPrice(currentPrice)} <span className="text-[10px] font-bold">{t("so'm", "сум")}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
