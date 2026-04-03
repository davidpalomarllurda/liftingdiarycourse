#!/usr/bin/env python3
"""
Query the workouts table for the past year and plot a monthly bar chart.
Reads DATABASE_URL from .env.local in the current working directory or project root.
Exports the chart as workout_chart.png in the current working directory.
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timedelta


def load_env(path: Path) -> dict:
    env = {}
    if path.exists():
        for line in path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                env[key.strip()] = value.strip()
    return env


def find_database_url() -> str:
    # Try .env.local in cwd and parent directories
    search_dirs = [Path.cwd()] + list(Path.cwd().parents)
    for directory in search_dirs:
        for filename in (".env.local", ".env"):
            env_file = directory / filename
            env = load_env(env_file)
            if "DATABASE_URL" in env:
                return env["DATABASE_URL"]

    # Fall back to environment variable
    url = os.environ.get("DATABASE_URL")
    if url:
        return url

    print("Error: DATABASE_URL not found in .env.local, .env, or environment variables.")
    sys.exit(1)


def main():
    try:
        import psycopg2
    except ImportError:
        print("Installing psycopg2-binary...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary", "-q"])
        import psycopg2

    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        import matplotlib.ticker as mticker
    except ImportError:
        print("Installing matplotlib...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "matplotlib", "-q"])
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        import matplotlib.ticker as mticker

    database_url = find_database_url()

    conn = psycopg2.connect(database_url)
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    DATE_TRUNC('month', "startedAt") AS month,
                    COUNT(*) AS workout_count
                FROM workouts
                WHERE "startedAt" >= NOW() - INTERVAL '1 year'
                GROUP BY month
                ORDER BY month
            """)
            rows = cur.fetchall()
    finally:
        conn.close()

    if not rows:
        print("No workout data found for the past year.")
        sys.exit(0)

    months = [row[0] for row in rows]
    counts = [int(row[1]) for row in rows]
    labels = [m.strftime("%b %Y") for m in months]

    fig, ax = plt.subplots(figsize=(12, 6))
    bars = ax.bar(labels, counts, color="#4F8EF7", edgecolor="#2563EB", linewidth=0.8)

    # Value labels on top of each bar
    for bar, count in zip(bars, counts):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.05,
            str(count),
            ha="center",
            va="bottom",
            fontsize=10,
            fontweight="bold",
            color="#1E3A5F",
        )

    ax.set_xlabel("Month", fontsize=13, labelpad=10)
    ax.set_ylabel("Number of Workouts", fontsize=13, labelpad=10)
    ax.set_title("Workouts per Month (Past Year)", fontsize=16, fontweight="bold", pad=16)
    ax.yaxis.set_major_locator(mticker.MaxNLocator(integer=True))
    ax.set_ylim(0, max(counts) * 1.2 + 1)
    plt.xticks(rotation=30, ha="right", fontsize=10)
    plt.yticks(fontsize=10)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.grid(axis="y", linestyle="--", alpha=0.5)

    fig.tight_layout()

    output_path = Path.cwd() / "workout_chart.png"
    fig.savefig(output_path, dpi=150, bbox_inches="tight")
    print(f"Chart saved to: {output_path}")


if __name__ == "__main__":
    main()
