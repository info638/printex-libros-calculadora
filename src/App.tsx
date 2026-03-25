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

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
    color: "#0f172a",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  } as React.CSSProperties,
  container: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: 24,
  } as React.CSSProperties,
  hero: {
    marginBottom: 24,
  } as React.CSSProperties,
  eyebrow: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#475569",
  } as React.CSSProperties,
  heroTitle: {
    margin: "10px 0 12px",
    fontSize: 44,
    lineHeight: 1.05,
    fontWeight: 900,
  } as React.CSSProperties,
  heroText: {
    margin: 0,
    fontSize: 16,
    color: "#475569",
    maxWidth: 760,
  } as React.CSSProperties,
  grid: {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "minmax(0,1fr) 360px",
    alignItems: "start",
  } as React.CSSProperties,
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: 24,
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 50px rgba(15,23,42,0.06)",
  } as React.CSSProperties,
  cardTitle: {
    margin: "0 0 18px",
    fontSize: 20,
    fontWeight: 800,
  } as React.CSSProperties,
  field: {
    marginBottom: 16,
  } as React.CSSProperties,
  label: {
    display: "block",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 700,
    color: "#334155",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontSize: 14,
    outline: "none",
  } as React.CSSProperties,
  rightCol: {
    display: "grid",
    gap: 16,
  } as React.CSSProperties,
  priceBox: {
    borderRadius: 20,
    padding: 18,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
  } as React.CSSProperties,
  darkPriceBox: {
    borderRadius: 20,
    padding: 18,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
  } as React.CSSProperties,
  small: {
    fontSize: 13,
    fontWeight: 700,
    color: "#64748b",
  } as React.CSSProperties,
  smallDark: {
    fontSize: 13,
    fontWeight: 700,
    color: "#cbd5e1",
  } as React.CSSProperties,
  bigPrice: {
    marginTop: 8,
    fontSize: 34,
    lineHeight: 1.05,
    fontWeight: 900,
  } as React.CSSProperties,
  tiny: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748b",
  } as React.CSSProperties,
  tinyDark: {
    marginTop: 6,
    fontSize: 12,
    color: "#cbd5e1",
  } as React.CSSProperties,
  saving: {
    borderRadius: 18,
    background: "#ecfdf3",
    border: "1px solid #bbf7d0",
    padding: 16,
  } as React.CSSProperties,
  savingTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "#166534",
  } as React.CSSProperties,
  savingText: {
    marginTop: 4,
    fontSize: 12,
    color: "#166534",
  } as React.CSSProperties,
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "11px 0",
    borderBottom: "1px solid #e2e8f0",
    fontSize: 14,
  } as React.CSSProperties,
  adminWrap: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: 24,
    display: "grid",
    gap: 24,
  } as React.CSSProperties,
  adminGrid: {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "360px minmax(0,1fr)",
    alignItems: "start",
  } as React.CSSProperties,
  button: {
    padding: "12px 16px",
    borderRadius: 14,
    border: "none",
    background: "#111827",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  } as React.CSSProperties,
  buttonSecondary: {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#0f172a",
    fontWeight: 800,
    cursor: "pointer",
  } as React.CSSProperties,
};

function PublicCalculator({
  config,
  form,
  setForm,
}: {
  config: PricingConfig;
  form: BookForm;
  setForm: (value: BookForm) => void;
}) {
  const quote = useMemo(() => calcPricing(form, config), [form, config]);
  const fromPrice = useMemo(() => getMarketingFromPrice(config), [config]);

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.eyebrow}>Libros encolados · Printex</div>
        <h1 style={styles.heroTitle}>Libros desde {money(fromPrice)}/ud</h1>
        <p style={styles.heroText}>
          Configura tu libro online y obtén precio inmediato. El sistema aplica
          automáticamente el descuento por volumen según la cantidad elegida.
        </p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Configura tu libro</h2>

          <div style={styles.field}>
            <label style={styles.label}>1. Tamaño</label>
            <select
              style={styles.input}
              value={form.format}
              onChange={(e) =>
                setForm({ ...form, format: e.target.value as BookForm["format"] })
              }
            >
              {Object.entries(formatProfiles).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>2. Encuadernación</label>
            <select
              style={styles.input}
              value={form.bindingType}
              onChange={(e) =>
                setForm({
                  ...form,
                  bindingType: e.target.value as BookForm["bindingType"],
                })
              }
            >
              <option value="noFlaps">Tapa blanda sin solapas</option>
              <option value="withFlaps">Tapa blanda con solapas</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>3. Portada</label>
            <select
              style={styles.input}
              value={form.coverKey}
              onChange={(e) =>
                setForm({ ...form, coverKey: e.target.value as BookForm["coverKey"] })
              }
            >
              {Object.entries(config.covers).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>4. Laminado</label>
            <select
              style={styles.input}
              value={form.laminationKey}
              onChange={(e) =>
                setForm({
                  ...form,
                  laminationKey: e.target.value as BookForm["laminationKey"],
                })
              }
            >
              {Object.entries(config.lamination.profiles).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>5. Papel interior</label>
            <select
              style={styles.input}
              value={form.paperKey}
              onChange={(e) =>
                setForm({ ...form, paperKey: e.target.value as BookForm["paperKey"] })
              }
            >
              {Object.entries(config.papers).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>6. Número de páginas</label>
            <select
              style={styles.input}
              value={String(form.pages)}
              onChange={(e) => setForm({ ...form, pages: Number(e.target.value) })}
            >
              {interiorPageOptions.map((p) => (
                <option key={p} value={p}>
                  {p} páginas interiores
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>7. Interior</label>
            <select
              style={styles.input}
              value={form.interiorMode}
              onChange={(e) =>
                setForm({
                  ...form,
                  interiorMode: e.target.value as BookForm["interiorMode"],
                })
              }
            >
              <option value="bn">Blanco y negro</option>
              <option value="color">Color</option>
            </select>
          </div>

          <div style={{ ...styles.field, marginBottom: 0 }}>
            <label style={styles.label}>8. Ejemplares</label>
            <select
              style={styles.input}
              value={String(form.quantity)}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            >
              {quantityOptions.map((qty) => (
                <option key={qty} value={qty}>
                  {qty} ejemplares
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.rightCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Tu precio</h2>

            <div style={styles.priceBox}>
              <div style={styles.small}>Precio unitario</div>
              <div style={styles.bigPrice}>
                {money(quote.finalUnitExVat * (1 + config.general.vatPct / 100))}
              </div>
              <div style={styles.tiny}>IVA incluido</div>
            </div>

            <div style={{ height: 12 }} />

            <div style={styles.darkPriceBox}>
              <div style={styles.smallDark}>Total pedido</div>
              <div style={styles.bigPrice}>{money(quote.totalIncVat)}</div>
              <div style={styles.tinyDark}>IVA incluido</div>
            </div>

            <div style={{ height: 12 }} />

            <div style={styles.saving}>
              <div style={styles.savingTitle}>
                Ahorras {quote.discountPct.toFixed(1)}% por volumen
              </div>
              <div style={styles.savingText}>
                Descuento aplicado automáticamente según la cantidad seleccionada.
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Resumen</h2>
            <div style={styles.row}>
              <span>Páginas totales</span>
              <strong>{quote.totalPages}</strong>
            </div>
            <div style={styles.row}>
              <span>Formato</span>
              <strong>{formatProfiles[form.format].label}</strong>
            </div>
            <div style={styles.row}>
              <span>Papel interior</span>
              <strong>{config.papers[form.paperKey].label}</strong>
            </div>
            <div style={{ ...styles.row, borderBottom: "none" }}>
              <span>Laminado</span>
              <strong>{quote.laminationLabel}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({
  config,
  setConfig,
}: {
  config: PricingConfig;
  setConfig: (config: PricingConfig) => void;
}) {
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("");
  const [jsonValue, setJsonValue] = useState(JSON.stringify(config, null, 2));

  useEffect(() => {
    setJsonValue(JSON.stringify(config, null, 2));
  }, [config]);

  if (!authorized) {
    return (
      <div style={{ maxWidth: 520, margin: "80px auto", padding: 24 }}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Acceso al backoffice</h2>
          <label style={styles.label}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <div style={{ height: 12 }} />
          <button
            style={styles.button}
            onClick={() => {
              if (password === ADMIN_PASSWORD) {
                setAuthorized(true);
                setMessage("");
              } else {
                setMessage("Contraseña incorrecta");
              }
            }}
          >
            Entrar
          </button>
          {message ? (
            <p style={{ color: "#b91c1c", marginTop: 12 }}>{message}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.adminWrap}>
      <div>
        <div style={styles.eyebrow}>Admin</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 36 }}>Backoffice Printex</h1>
      </div>

      <div style={styles.adminGrid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Ajustes rápidos</h2>

          <div style={styles.field}>
            <label style={styles.label}>IVA %</label>
            <input
              type="number"
              value={config.general.vatPct}
              onChange={(e) =>
                setConfig({
                  ...config,
                  general: {
                    ...config.general,
                    vatPct: Number(e.target.value),
                  },
                })
              }
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Margen base %</label>
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
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Precio desde · cantidad</label>
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
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Precio desde · páginas</label>
            <input
              type="number"
              value={config.marketing.fromPages}
              onChange={(e) =>
                setConfig({
                  ...config,
                  marketing: {
                    ...config.marketing,
                    fromPages: Number(e.target.value),
                  },
                })
              }
              style={styles.input}
            />
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              style={styles.button}
              onClick={() => {
                saveConfig(config);
                setMessage("Configuración guardada.");
              }}
            >
              Guardar
            </button>

            <button
              style={styles.buttonSecondary}
              onClick={() => {
                setConfig(defaultConfig);
                saveConfig(defaultConfig);
                setMessage("Configuración restablecida.");
              }}
            >
              Restaurar
            </button>
          </div>

          {message ? (
            <p style={{ color: "#166534", marginTop: 12 }}>{message}</p>
          ) : null}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Configuración completa (JSON)</h2>
          <p style={{ marginTop: 0, color: "#475569" }}>
            Aquí puedes modificar todos los valores de producción, descuentos,
            marketing y márgenes.
          </p>

          <textarea
            value={jsonValue}
            onChange={(e) => setJsonValue(e.target.value)}
            style={{
              width: "100%",
              minHeight: 540,
              borderRadius: 16,
              border: "1px solid #cbd5e1",
              padding: 14,
              fontFamily: "monospace",
              fontSize: 13,
            }}
          />

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button
              style={styles.button}
              onClick={() => {
                try {
                  const parsed = JSON.parse(jsonValue) as PricingConfig;
                  setConfig(parsed);
                  saveConfig(parsed);
                  setMessage("JSON aplicado correctamente.");
                } catch {
                  setMessage("El JSON no es válido.");
                }
              }}
            >
              Aplicar JSON
            </button>

            <button
              style={styles.buttonSecondary}
              onClick={() => setJsonValue(JSON.stringify(config, null, 2))}
            >
              Recargar JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [config, setConfig] = useState<PricingConfig>(() => loadConfig());
  const [form, setForm] = useState<BookForm>(defaultForm);

  useEffect(() => {
    runPricingChecks();
  }, []);

  if (window.location.pathname === "/admin") {
    return <AdminPanel config={config} setConfig={setConfig} />;
  }

  return (
    <div style={styles.page}>
      <PublicCalculator config={config} form={form} setForm={setForm} />
    </div>
  );
}
