import { BookForm, PricingConfig, defaultConfig, formatProfiles } from "./config";

export type PricingBreakdown = {
  rawInteriorPaperCostPerBook: number;
  interiorPaperCostPerBook: number;
  interiorClickCostPerBook: number;
  coverSheetCostPerBook: number;
  coverPrintCostPerBook: number;
  laminationCostPerBook: number;
  glueCostPerBook: number;
  runCostPerBook: number;
  setupCost: number;
};

export type PricingResult = {
  totalPages: number;
  interiorPagesNominal: number;
  billedInteriorPages: number;
  bnPages: number;
  colorPages: number;
  quantity: number;
  interiorSheetsPerBook: number;
  colorSheetsPerBook: number;
  bnSheetsPerBook: number;
  laminationAreaM2: number;
  laminationLabel: string;
  spineMm: number;
  glueGrams: number;
  fullCostPerBook: number;
  listPricePerBook: number;
  finalUnitExVat: number;
  totalExVat: number;
  totalIncVat: number;
  marginPerUnit: number;
  marginTotal: number;
  marginPct: number;
  discountPct: number;
  targetMarginPctUsed: number;
  breakdown: PricingBreakdown;
};

function roundToStep(value: number, step: number): number {
  if (!step || step <= 0) return value;
  return Math.ceil(value / step) * step;
}

export function getDiscountPct(qty: number, tiers: PricingConfig["discounts"]): number {
  const sorted = [...tiers].sort((a, b) => a.qty - b.qty);
  if (!sorted.length) return 0;
  if (qty <= sorted[0].qty) return sorted[0].pct;

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];
    if (qty === current.qty) return current.pct;
    if (qty > current.qty && qty < next.qty) {
      const ratio = (qty - current.qty) / (next.qty - current.qty);
      return current.pct + (next.pct - current.pct) * ratio;
    }
  }

  return sorted[sorted.length - 1].pct;
}

export function getSmartTargetMarginPct(quantity: number, baseMarginPct: number): number {
  if (quantity <= 10) return baseMarginPct + 18;
  if (quantity <= 25) return baseMarginPct + 12;
  if (quantity <= 50) return baseMarginPct + 8;
  if (quantity <= 100) return baseMarginPct + 4;
  if (quantity <= 250) return baseMarginPct + 1;
  if (quantity <= 500) return Math.max(baseMarginPct - 2, 12);
  if (quantity <= 1000) return Math.max(baseMarginPct - 4, 10);
  return Math.max(baseMarginPct - 6, 8);
}

export function calcPricing(form: BookForm, cfg: PricingConfig = defaultConfig): PricingResult {
  const format = formatProfiles[form.format];
  const paper = cfg.papers[form.paperKey];
  const cover = cfg.covers[form.coverKey];
  const laminationProfile = cfg.lamination.profiles[form.laminationKey];

  const quantity = Number(form.quantity || 0);
  const selectedPages = Number(form.pages || 0);
  const bnPages = form.interiorMode === "bn" ? selectedPages : 0;
  const colorPages = form.interiorMode === "color" ? selectedPages : 0;
  const interiorPagesNominal = bnPages + colorPages;
  const totalPages = interiorPagesNominal + 4;
  const billedInteriorPages = Math.ceil(interiorPagesNominal / 4) * 4;

  const colorSheetsPerBook = Math.ceil(colorPages / format.pagesPerSra3Duplex);
  const bnSheetsPerBook = Math.ceil(Math.max(billedInteriorPages - colorPages, 0) / format.pagesPerSra3Duplex);
  const interiorSheetsPerBook = colorSheetsPerBook + bnSheetsPerBook;

  const rawInteriorPaperCostPerBook =
    interiorSheetsPerBook * paper.costPer13319 * (1 + cfg.general.wasteGeneralPct / 100);
  const interiorPaperCostPerBook = rawInteriorPaperCostPerBook * (1 + paper.marketPremiumPct / 100);
  const interiorClickCostPerBook =
    colorSheetsPerBook * cfg.clicks.a3Color * 2 + bnSheetsPerBook * cfg.clicks.a3Bn * 2;

  const coverSheetCostPerBook = cover.costPerSra3 / format.coverSheetsPerSra3;
  const coverPrintCostPerBook = (cfg.clicks.a3Color * cfg.clicks.coverColorSides) / format.coverSheetsPerSra3;

  const lamMeters = form.bindingType === "withFlaps" ? format.lamMetersFlap : format.lamMetersNoFlap;
  const laminationAreaM2 = lamMeters * 0.33;
  const laminationCostPerBook =
    laminationProfile.costPerM2 > 0
      ? laminationAreaM2 * laminationProfile.costPerM2 * (1 + cfg.lamination.wastePct / 100)
      : 0;

  const spineMm = (interiorPagesNominal / 2) * paper.thicknessMmPerSheet;
  const glueGrams = cfg.glue.baseGrams + spineMm * cfg.glue.gramsPerMmSpine;
  const glueCostPerBook = (glueGrams / 1000) * cfg.glue.hotmeltCostPerKg;

  const machineHourly =
    cfg.operations.machineWearPerHour +
    cfg.operations.maintenancePerHour +
    cfg.operations.machineAmortizationPerHour;

  const setupCost =
    ((cfg.operations.setupMinutesPerOrder + cfg.operations.prepressMinutesPerOrder) / 60) *
    (cfg.operations.laborPerHour + machineHourly);

  const runMinutesPerBook =
    cfg.operations.handlingMinutesPerBook +
    cfg.operations.coverMinutesPerBook +
    cfg.operations.bindMinutesBasePerBook +
    cfg.operations.bindMinutesPerMmSpine * spineMm +
    cfg.operations.printMinutesPerInteriorSheet * interiorSheetsPerBook;

  const runCostPerBook =
    (runMinutesPerBook / 60) * (cfg.operations.laborPerHour + machineHourly) +
    cfg.operations.packagingCostPerBook;

  const directCostPerBook =
    interiorPaperCostPerBook +
    interiorClickCostPerBook +
    coverSheetCostPerBook +
    coverPrintCostPerBook +
    laminationCostPerBook +
    glueCostPerBook +
    runCostPerBook;

  const fullCostPerBook = directCostPerBook + (quantity > 0 ? setupCost / quantity : 0);
  const discountPct = getDiscountPct(quantity, cfg.discounts);
  const discountFactor = 1 - discountPct / 100;

  const targetMarginPctUsed = getSmartTargetMarginPct(quantity, cfg.general.targetMarginPct);
  const targetMargin = targetMarginPctUsed / 100;

  const requiredPriceBeforeDiscount =
    fullCostPerBook / Math.max(1 - targetMargin, 0.0001) / Math.max(discountFactor, 0.0001);

  const listPricePerBook = roundToStep(
    Math.max(requiredPriceBeforeDiscount, cfg.general.minChargePerOrder / Math.max(quantity, 1)),
    cfg.general.roundStep
  );

  const finalUnitExVat = roundToStep(listPricePerBook * discountFactor, cfg.general.roundStep);
  const totalExVat = finalUnitExVat * quantity;
  const totalIncVat = totalExVat * (1 + cfg.general.vatPct / 100);
  const marginPerUnit = finalUnitExVat - fullCostPerBook;
  const marginTotal = marginPerUnit * quantity;
  const marginPct = finalUnitExVat > 0 ? (marginPerUnit / finalUnitExVat) * 100 : 0;

  return {
    totalPages,
    interiorPagesNominal,
    billedInteriorPages,
    bnPages,
    colorPages,
    quantity,
    interiorSheetsPerBook,
    colorSheetsPerBook,
    bnSheetsPerBook,
    laminationAreaM2,
    laminationLabel: laminationProfile.label,
    spineMm,
    glueGrams,
    fullCostPerBook,
    listPricePerBook,
    finalUnitExVat,
    totalExVat,
    totalIncVat,
    marginPerUnit,
    marginTotal,
    marginPct,
    discountPct,
    targetMarginPctUsed,
    breakdown: {
      rawInteriorPaperCostPerBook,
      interiorPaperCostPerBook,
      interiorClickCostPerBook,
      coverSheetCostPerBook,
      coverPrintCostPerBook,
      laminationCostPerBook,
      glueCostPerBook,
      runCostPerBook,
      setupCost,
    },
  };
}

export function getMarketingFromPrice(cfg: PricingConfig = defaultConfig): number {
  const result = calcPricing(
    {
      format: cfg.marketing.fromFormat,
      bindingType: "withFlaps",
      coverKey: "silk300",
      laminationKey: "softTouch35d241",
      paperKey: cfg.marketing.fromPaperKey,
      pages: cfg.marketing.fromPages,
      interiorMode: cfg.marketing.fromInteriorMode,
      quantity: cfg.marketing.fromQuantity,
    },
    cfg
  );

  return result.finalUnitExVat * (1 + cfg.general.vatPct / 100);
}

export function runPricingChecks(): void {
  const base = calcPricing(
    {
      format: "A5",
      bindingType: "withFlaps",
      coverKey: "silk300",
      laminationKey: "softTouch35d241",
      paperKey: "munkenCream90",
      pages: 76,
      interiorMode: "bn",
      quantity: 50,
    },
    defaultConfig
  );

  console.assert(base.totalPages === 80, "76 interiores + 4 cubiertas debe dar 80.");
  console.assert(base.finalUnitExVat > 0, "Precio final positivo.");
  console.assert(base.totalIncVat > base.totalExVat, "Con IVA > sin IVA.");

  const lowQty = calcPricing({
    format: "A5",
    bindingType: "withFlaps",
    coverKey: "silk300",
    laminationKey: "softTouch35d241",
    paperKey: "munkenCream90",
    pages: 76,
    interiorMode: "bn",
    quantity: 5,
  });

  const highQty = calcPricing({
    format: "A5",
    bindingType: "withFlaps",
    coverKey: "silk300",
    laminationKey: "softTouch35d241",
    paperKey: "munkenCream90",
    pages: 76,
    interiorMode: "bn",
    quantity: 500,
  });

  console.assert(lowQty.fullCostPerBook > highQty.fullCostPerBook, "Más tirada debe bajar coste unitario.");
  console.assert(lowQty.targetMarginPctUsed > highQty.targetMarginPctUsed, "Margen inteligente debe bajar con tirada mayor.");

  const bw = calcPricing({
    format: "A5",
    bindingType: "withFlaps",
    coverKey: "silk300",
    laminationKey: "softTouch35d241",
    paperKey: "printSpeed80",
    pages: 76,
    interiorMode: "bn",
    quantity: 100,
  });

  const color = calcPricing({
    format: "A5",
    bindingType: "withFlaps",
    coverKey: "silk300",
    laminationKey: "softTouch35d241",
    paperKey: "printSpeed80",
    pages: 76,
    interiorMode: "color",
    quantity: 100,
  });

  console.assert(color.breakdown.interiorClickCostPerBook > bw.breakdown.interiorClickCostPerBook, "Color debe subir clicks interiores.");

  const marketingPrice = getMarketingFromPrice(defaultConfig);
  console.assert(marketingPrice > 0, "El precio desde debe ser positivo.");
}
