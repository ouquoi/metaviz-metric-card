import { type CreateCustomVisualization, defineConfig } from "@metabase/custom-viz";
import { MetricCard } from "./MetricCard";
import type { Settings } from "./types";

const createVisualization: CreateCustomVisualization<Settings> = ({
  defineSetting,
}) => {
  return defineConfig<Settings>({
    id: "metric-card",
    getName: () => "Metric Card",
    minSize: { width: 2, height: 2 },
    defaultSize: { width: 4, height: 3 },

    checkRenderable(series) {
      if (!series || series.length !== 1) {
        throw new Error("A single query is required");
      }
      const data = series[0]?.data;
      if (!data || data.cols.length !== 1) {
        throw new Error("The query must return exactly 1 column");
      }
      if (data.rows.length !== 1) {
        throw new Error("The query must return exactly 1 row");
      }
    },

    settings: {
      title: defineSetting({
        id: "title",
        title: "Label",
        widget: "input",
        getDefault() {
          return "";
        },
        // SDK signature: getProps(series: Series, vizSettings) — series is the array directly
        getProps(series) {
          const col = series?.[0]?.data?.cols?.[0];
          return { placeholder: col?.display_name || col?.name || "" };
        },
      }),
      subtitle: defineSetting({
        id: "subtitle",
        title: "Subtitle",
        widget: "input",
        getDefault() {
          return "";
        },
        getProps() {
          return { placeholder: "Text below the number (optional)" };
        },
      }),
      accent_color: defineSetting({
        id: "accent_color",
        title: "Color",
        widget: "color",
        getDefault() {
          return "#509EE3";
        },
      }),
    },

    VisualizationComponent: MetricCard,
  });
};

export default createVisualization;
