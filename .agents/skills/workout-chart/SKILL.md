---
name: workout-chart
description: Generate a bar chart image showing the number of workouts per month over the past year by querying the app's PostgreSQL database. Use this skill whenever the user asks to visualize, chart, or plot workout frequency, activity trends, or monthly workout counts — even if they just say "show me my workouts" or "how often have I been training".
---

# Workout Chart

Queries the `workouts` table for the past 12 months and exports a bar chart (`workout_chart.png`) with months on the x-axis and workout count on the y-axis.

## How to run

Execute the bundled script from the project root (where `.env.local` lives):

```bash
python .agents/skills/workout-chart/scripts/plot_workouts.py
```

The script will:
1. Auto-discover `DATABASE_URL` from `.env.local` (or `.env`, or the environment)
2. Query `workouts` grouped by month for the past year
3. Auto-install `psycopg2-binary` and `matplotlib` if missing
4. Write `workout_chart.png` to the current working directory

## What the script needs

- Python 3.8+
- Network access to the Neon PostgreSQL database
- `DATABASE_URL` reachable in `.env.local`, `.env`, or as an env var

## SQL used

```sql
SELECT
    DATE_TRUNC('month', "startedAt") AS month,
    COUNT(*) AS workout_count
FROM workouts
WHERE "startedAt" >= NOW() - INTERVAL '1 year'
GROUP BY month
ORDER BY month
```

## Output

`workout_chart.png` — a 150 dpi bar chart saved in the working directory. Tell the user the full path after the script completes so they can open it.

## Troubleshooting

- **DATABASE_URL not found** — make sure `.env.local` exists at the project root with `DATABASE_URL=<connection string>`
- **SSL errors** — the connection string should include `?sslmode=require`
- **No data** — the query only includes rows where `started_at >= NOW() - INTERVAL '1 year'`; check the database has recent data
