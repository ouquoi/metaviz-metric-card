# Metric Card

A clean KPI card for Metabase that displays a single numeric metric with a configurable label, subtitle and accent color. Supports dark mode automatically.

![preview](assets/preview.png)

## Requirements

- Metabase 1.62.0 or later (Pro or Enterprise plan)

---

## Installation

1. Download the latest `.tgz` from [Releases](../../releases/latest)
2. In Metabase, go to **Admin → Settings → Custom visualizations**
3. Click **Add visualization** and upload the `.tgz` file
4. The Metric Card visualization is now available in all questions and dashboards

---

## Usage

### 1. Write your query

The query must return **exactly 1 column and 1 row** — a single numeric value.

```sql
-- Total paid orders
SELECT COUNT(*) FROM orders WHERE status = 'paid'

-- Monthly revenue
SELECT SUM(amount) FROM transactions WHERE month = '2024-01'

-- Average session duration (seconds)
SELECT AVG(duration_seconds) FROM sessions
```

### 2. Select the visualization

In the question editor, click the **visualization picker** (bottom left) and select **Metric Card**.

### 3. Configure the settings

Click the **gear icon** to open visualization settings:

| Setting | Description | Default |
|---------|-------------|---------|
| **Label** | Text displayed above the number. Supports Markdown (see below). | Column name from the query |
| **Subtitle** | Optional text displayed below the number. Supports Markdown. | _(empty)_ |
| **Color** | Accent color applied to the number. Click to open the color picker. | `#509EE3` |

---

## Capabilities

| Feature | Details |
|---------|---------|
| **Number formatting** | Automatically uses Metabase's native formatter — respects locale, currency, and column semantic type |
| **Responsive font size** | The number scales to fill the card at any size |
| **Markdown in labels** | `**bold**`, `*italic*`, `~~strikethrough~~`, `` `code` `` — works in both Label and Subtitle |
| **Dark mode** | Adapts automatically to Metabase's light and dark themes — no configuration needed |
| **Dashboard sizing** | Minimum 2×2 · Default 4×3 dashboard units |

---

## Data requirements

| Column | Type | Notes |
|--------|------|-------|
| 1 | Numeric | The only column returned by the query |

> The query must return exactly 1 row and 1 column. If your query returns multiple rows, add an aggregation (`COUNT`, `SUM`, `AVG`, etc.).

---

## Development

```bash
npm install
npm run dev    # hot-reload against a local Metabase instance
npm run build  # produces metric-card-<version>.tgz
```

To develop against a live Metabase instance, enable dev mode:
```
MB_CUSTOM_VIZ_PLUGIN_DEV_MODE_ENABLED=true
```
Then set the dev server URL in **Admin → Settings → Custom visualizations → Development** to `http://localhost:5174`.

---

## License

MIT
