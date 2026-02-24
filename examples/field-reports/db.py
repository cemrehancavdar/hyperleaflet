import sqlite3
from pathlib import Path

DATABASE = Path(__file__).parent / "data.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    notes TEXT DEFAULT '',
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);
"""

SEED_DATA = [
    (
        "Ankara Castle",
        "landmark",
        "Historic citadel in the old quarter",
        39.9416,
        32.8643,
    ),
    ("Galata Tower", "landmark", "Medieval stone tower in Istanbul", 41.0256, 28.9741),
    (
        "Izmir Clock Tower",
        "landmark",
        "Iconic clock tower in Konak Square",
        38.4189,
        27.1287,
    ),
    ("Cappadocia Balloons", "tourism", "Hot air balloon launch site", 38.6431, 34.8289),
    ("Pamukkale Terraces", "nature", "Calcium travertine terraces", 37.9204, 29.1187),
    ("Ephesus Ruins", "landmark", "Ancient Greek city ruins", 37.9393, 27.3417),
]


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    with get_db() as conn:
        conn.execute(SCHEMA)
        count = conn.execute("SELECT COUNT(*) FROM reports").fetchone()[0]
        if count == 0:
            conn.executemany(
                "INSERT INTO reports (name, category, notes, lat, lng) VALUES (?, ?, ?, ?, ?)",
                SEED_DATA,
            )


def get_all_reports(category: str | None = None) -> list[sqlite3.Row]:
    with get_db() as conn:
        if category and category != "all":
            return conn.execute(
                "SELECT * FROM reports WHERE category = ? ORDER BY created_at DESC",
                (category,),
            ).fetchall()
        return conn.execute("SELECT * FROM reports ORDER BY created_at DESC").fetchall()


def get_report(report_id: int) -> sqlite3.Row | None:
    with get_db() as conn:
        return conn.execute(
            "SELECT * FROM reports WHERE id = ?", (report_id,)
        ).fetchone()


def create_report(
    name: str, category: str, notes: str, lat: float, lng: float
) -> sqlite3.Row:
    with get_db() as conn:
        cursor = conn.execute(
            "INSERT INTO reports (name, category, notes, lat, lng) VALUES (?, ?, ?, ?, ?)",
            (name, category, notes, lat, lng),
        )
        return conn.execute(
            "SELECT * FROM reports WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()


def update_report(
    report_id: int,
    name: str,
    category: str,
    notes: str,
    lat: float,
    lng: float,
) -> sqlite3.Row | None:
    with get_db() as conn:
        conn.execute(
            "UPDATE reports SET name=?, category=?, notes=?, lat=?, lng=? WHERE id=?",
            (name, category, notes, lat, lng, report_id),
        )
        return conn.execute(
            "SELECT * FROM reports WHERE id = ?", (report_id,)
        ).fetchone()


def delete_report(report_id: int) -> bool:
    with get_db() as conn:
        cursor = conn.execute("DELETE FROM reports WHERE id = ?", (report_id,))
        return cursor.rowcount > 0


def get_categories() -> list[str]:
    with get_db() as conn:
        rows = conn.execute(
            "SELECT DISTINCT category FROM reports ORDER BY category"
        ).fetchall()
        return [row["category"] for row in rows]
