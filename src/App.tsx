import { useEffect, useMemo, useState } from "react";
import {
  BookForm,
  PricingConfig,
  defaultConfig,
  defaultForm,
  formatProfiles,
} from "./lib/config";
import {
  calcPricing,
  getMarketingFromPrice,
  runPricingChecks,
} from "./lib/pricing";

const CONFIG_STORAGE_KEY = "printex-libros-config-v1";
const ADMIN_PASSWORD = "Sena@2121";

function money(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value || 0));
}

function loadConfig(): PricingConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return defaultConfig;
    return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {
    return defaultConfig;
  }
}

function saveConfig(config: PricingConfig) {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export default function App() {
  const [config, setConfig] = useState(loadConfig());
  const [form, setForm] = useState<BookForm>(defaultForm);

  useEffect(() => {
    runPricingChecks();
  }, []);

  const quote = useMemo(() => calcPricing(form, config), [form, config]);
  const fromPrice = useMemo(() => getMarketingFromPrice(config), [config]);

  // 🔐 ADMIN
  if (window.location.pathname === "/admin") {
    const [pass, setPass] = useState("");
    const [ok, setOk] = useState(false);

    if (!ok) {
      return (
        <div style={{ padding: 40 }}>
          <h2>Admin</h2>
          <input
            type="password"
            placeholder="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <button onClick={() => setOk(pass === ADMIN_PASSWORD)}>
            Entrar
          </button>
        </div>
      );
    }

    return (
      <div style={{ padding: 40 }}>
        <h1>Backoffice</h1>

        <p>Margen base (%)</p>
        <input
          type="number"
          value={config.general.targetMarginPct}
          onChange={(e) =>
            setConfig({
              ...config,
              general: {
                ...config.general,
                targetMarginPct: Number(e.target.value),
              },
            })
          }
        />

        <p>Cantidad "desde"</p>
        <input
          type="number"
          value={config.marketing.fromQuantity}
          onChange={(e) =>
            setConfig({
              ...config,
              marketing: {
                ...config.marketing,
                fromQuantity: Number(e.target.value),
              },
            })
          }
        />

        <button onClick={() => saveConfig(config)}>Guardar</button>
      </div>
    );
  }

  // 🌐 CLIENTE
  return (
    <div style={{ padding: 40, maxWidth: 900, margin: "auto" }}>
      <h1>Libros desde {money(fromPrice)}</h1>

      <h3>Configurador</h3>

      <div>
        <label>Tamaño</label>
        <select
          value={form.format}
          onChange={(e) =>
            setForm({ ...form, format: e.target.value as any })
          }
        >
          {Object.entries(formatProfiles).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Páginas</label>
        <input
          type="number"
          value={form.pages}
          onChange={(e) =>
            setForm({ ...form, pages: Number(e.target.value) })
          }
        />
      </div>

      <div>
        <label>Cantidad</label>
        <input
          type="number"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: Number(e.target.value) })
          }
        />
      </div>

      <hr />

      <h2>Precio unitario: {money(quote.totalIncVat / form.quantity)}</h2>
      <h2>Total: {money(quote.totalIncVat)}</h2>

      <p>Descuento aplicado: {quote.discountPct.toFixed(1)}%</p>
    </div>
  );
}
