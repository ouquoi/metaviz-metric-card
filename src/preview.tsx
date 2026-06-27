import { useState } from "react";
import { createRoot } from "react-dom/client";
import { MetricCard } from "./MetricCard";

const MOCK_COL = {
  name: "count",
  display_name: "Total Orders",
  base_type: "type/Integer",
  effective_type: "type/Integer",
  semantic_type: "type/Quantity",
  field_ref: ["aggregation", 0],
};

const MOCK_SERIES = [
  {
    data: {
      cols: [MOCK_COL],
      rows: [[42831]],
    },
  },
];

function Preview() {
  const [label, setLabel] = useState("**Total** Orders");
  const [color, setColor] = useState("#509EE3");
  const [dark, setDark] = useState(false);
  const [value, setValue] = useState("42831");

  const series = [
    {
      data: {
        cols: [MOCK_COL],
        rows: [[Number(value) || 0]],
      },
    },
  ];

  const containerStyle: React.CSSProperties = {
    background: dark ? "#1c1c1c" : "#f5f5f5",
    minHeight: "100vh",
    padding: "2rem",
    fontFamily: "sans-serif",
    color: dark ? "#fff" : "#333",
  };

  const controlsStyle: React.CSSProperties = {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "2rem",
    padding: "1rem 1.5rem",
    background: dark ? "#2a2a2a" : "#fff",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  };

  const fieldStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "13px",
  };

  const inputStyle: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    background: dark ? "#333" : "#fff",
    color: dark ? "#fff" : "#333",
    minWidth: "200px",
  };

  const cardWrapperStyle: React.CSSProperties = {
    width: "400px",
    height: "200px",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>
        Metric Card — Preview
      </h2>

      <div style={controlsStyle}>
        <label style={fieldStyle}>
          Label
          <input
            style={inputStyle}
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Supports **bold**, *italic*, ~~strike~~, `code`"
          />
        </label>

        <label style={fieldStyle}>
          Value
          <input
            style={{ ...inputStyle, minWidth: "100px" }}
            value={value}
            onChange={e => setValue(e.target.value)}
            type="number"
          />
        </label>

        <label style={fieldStyle}>
          Color
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            style={{ width: "60px", height: "36px", cursor: "pointer", border: "none", background: "none" }}
          />
        </label>

        <label style={{ ...fieldStyle, flexDirection: "row", alignItems: "center", gap: "8px", marginTop: "18px" }}>
          <input
            type="checkbox"
            checked={dark}
            onChange={e => setDark(e.target.checked)}
          />
          Dark mode
        </label>
      </div>

      <div style={cardWrapperStyle}>
        <MetricCard
          series={series as any}
          settings={{ title: label, accent_color: color }}
          width={400}
          height={200}
          colorScheme={dark ? "dark" : "light"}
          onClick={() => {}}
          onHover={() => {}}
        />
      </div>

      <p style={{ marginTop: "1rem", fontSize: "13px", opacity: 0.6 }}>
        Markdown supporté : <code>**gras**</code> · <code>*italique*</code> · <code>~~barré~~</code> · <code>`code`</code>
      </p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Preview />);
