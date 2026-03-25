export type FormatKey = "A6" | "SQ148" | "A5" | "A4";
export type BindingType = "noFlaps" | "withFlaps";
export type InteriorMode = "bn" | "color";
export type PaperKey = "munkenCream90" | "munkenWhite80" | "printSpeed80";
export type CoverKey = "silk250" | "silk300";
export type LaminationKey =
  | "none"
  | "gloss24i230"
  | "matte27i240"
  | "softTouch35d241"
  | "antiScratch30d244"
  | "softTouchAntiScratch30dv41"
  | "sandy50si40";

export type BookForm = {
  format: FormatKey;
  bindingType: BindingType;
  coverKey: CoverKey;
  laminationKey: LaminationKey;
  paperKey: PaperKey;
  pages: number;
  interiorMode: InteriorMode;
  quantity: number;
};

export type DiscountTier = {
  qty: number;
  pct: number;
};

export type PricingConfig = {
  general: {
    vatPct: number;
    targetMarginPct: number;
    minChargePerOrder: number;
    roundStep: number;
    wasteGeneralPct: number;
  };
  clicks: {
    a3Color: number;
    a3Bn: number;
    coverColorSides: number;
  };
  papers: Record<PaperKey, {
    label: string;
    costPer13319: number;
    thicknessMmPerSheet: number;
    marketPremiumPct: number;
  }>;
  covers: Record<CoverKey, {
    label: string;
    costPerSra3: number;
  }>;
  lamination: {
    wastePct: number;
    profiles: Record<LaminationKey, {
      label: string;
      costPerM2: number;
    }>;
  };
  glue: {
    hotmeltCostPerKg: number;
    baseGrams: number;
    gramsPerMmSpine: number;
  };
  operations: {
    laborPerHour: number;
    machineWearPerHour: number;
    maintenancePerHour: number;
    machineAmortizationPerHour: number;
    setupMinutesPerOrder: number;
    prepressMinutesPerOrder: number;
    handlingMinutesPerBook: number;
    printMinutesPerInteriorSheet: number;
    coverMinutesPerBook: number;
    bindMinutesBasePerBook: number;
    bindMinutesPerMmSpine: number;
    packagingCostPerBook: number;
  };
  discounts: DiscountTier[];
  marketing: {
    fromQuantity: number;
    fromPaperKey: PaperKey;
    fromInteriorMode: InteriorMode;
    fromPages: number;
    fromFormat: FormatKey;
  };
};

export const formatProfiles = {
  A6: { label: "A6 · 105 × 148 mm", pagesPerSra3Duplex: 16, coverSheetsPerSra3: 8, lamMetersNoFlap: 0.24, lamMetersFlap: 0.28 },
  SQ148: { label: "Cuadrado · 148 × 148 mm", pagesPerSra3Duplex: 8, coverSheetsPerSra3: 4, lamMetersNoFlap: 0.3, lamMetersFlap: 0.36 },
  A5: { label: "A5 · 148 × 210 mm", pagesPerSra3Duplex: 8, coverSheetsPerSra3: 4, lamMetersNoFlap: 0.34, lamMetersFlap: 0.45 },
  A4: { label: "A4 · 210 × 297 mm", pagesPerSra3Duplex: 4, coverSheetsPerSra3: 2, lamMetersNoFlap: 0.48, lamMetersFlap: 0.6 },
} as const;

export const defaultConfig: PricingConfig = {
  general: {
    vatPct: 21,
    targetMarginPct: 28,
    minChargePerOrder: 18,
    roundStep: 0.05,
    wasteGeneralPct: 3,
  },
  clicks: {
    a3Color: 0.040365,
    a3Bn: 0.007245,
    coverColorSides: 1,
  },
  papers: {
    munkenCream90: { label: "Munken Print Cream 90 g · ahuesado", costPer13319: 0.04681, thicknessMmPerSheet: 0.18, marketPremiumPct: 30 },
    munkenWhite80: { label: "Munken Print White 80 g · blanco", costPer13319: 0.04161, thicknessMmPerSheet: 0.16, marketPremiumPct: 18 },
    printSpeed80: { label: "Print Speed Offset 80 g · blanco", costPer13319: 0.03366525, thicknessMmPerSheet: 0.104, marketPremiumPct: 0 },
  },
  covers: {
    silk250: { label: "Estucado Silk 250 g", costPerSra3: 0.087904 },
    silk300: { label: "Estucado Silk 300 g", costPerSra3: 0.116064 },
  },
  lamination: {
    wastePct: 20,
    profiles: {
      none: { label: "Sin laminado", costPerM2: 0 },
      gloss24i230: { label: "Brillo 24i230", costPerM2: 0.178 },
      matte27i240: { label: "Mate 27i240", costPerM2: 0.198 },
      softTouch35d241: { label: "Soft Touch 35d241", costPerM2: 0.422 },
      antiScratch30d244: { label: "Antirayado 30d244", costPerM2: 0.362 },
      softTouchAntiScratch30dv41: { label: "4x4 Soft Touch + Antirayado 30dv41", costPerM2: 0.422 },
      sandy50si40: { label: "Sandy 50si40", costPerM2: 0.498 },
    },
  },
  glue: {
    hotmeltCostPerKg: 20,
    baseGrams: 1,
    gramsPerMmSpine: 0.22,
  },
  operations: {
    laborPerHour: 18,
    machineWearPerHour: 2.5,
    maintenancePerHour: 3,
    machineAmortizationPerHour: 6,
    setupMinutesPerOrder: 12,
    prepressMinutesPerOrder: 6,
    handlingMinutesPerBook: 0.28,
    printMinutesPerInteriorSheet: 0.03,
    coverMinutesPerBook: 0.08,
    bindMinutesBasePerBook: 0.22,
    bindMinutesPerMmSpine: 0.035,
    packagingCostPerBook: 0.08,
  },
  discounts: [
    { qty: 4, pct: 0 },
    { qty: 5, pct: 1 },
    { qty: 10, pct: 2 },
    { qty: 15, pct: 3 },
    { qty: 20, pct: 4 },
    { qty: 25, pct: 5 },
    { qty: 50, pct: 8 },
    { qty: 100, pct: 12 },
    { qty: 150, pct: 15 },
    { qty: 250, pct: 18 },
    { qty: 500, pct: 22 },
    { qty: 1000, pct: 26 },
    { qty: 1500, pct: 29 },
    { qty: 2000, pct: 32 },
  ],
  marketing: {
    fromQuantity: 100,
    fromPaperKey: "printSpeed80",
    fromInteriorMode: "bn",
    fromPages: 76,
    fromFormat: "A5",
  },
};

export const defaultForm: BookForm = {
  format: "A5",
  bindingType: "withFlaps",
  coverKey: "silk300",
  laminationKey: "softTouch35d241",
  paperKey: "munkenCream90",
  pages: 76,
  interiorMode: "bn",
  quantity: 50,
};
