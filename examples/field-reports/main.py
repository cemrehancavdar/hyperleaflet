from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from db import create_report, delete_report, get_all_reports, get_categories, init_db

BASE_DIR = Path(__file__).parent


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")

CATEGORIES = ["landmark", "nature", "tourism", "infrastructure", "other"]


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    reports = get_all_reports()
    categories = get_categories()
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "reports": reports,
            "categories": categories,
            "all_categories": CATEGORIES,
        },
    )


@app.post("/reports", response_class=HTMLResponse)
async def add_report(
    request: Request,
    name: str = Form(...),
    category: str = Form(...),
    notes: str = Form(""),
    lat: float = Form(...),
    lng: float = Form(...),
):
    report = create_report(name, category, notes, lat, lng)
    return templates.TemplateResponse(
        request=request,
        name="partials/report_row.html",
        context={"report": report},
    )


@app.delete("/reports/{report_id}", response_class=HTMLResponse)
async def remove_report(report_id: int):
    delete_report(report_id)
    # Return empty string — HTMX will remove the target row via hx-swap="delete"
    return HTMLResponse("")


@app.get("/reports", response_class=HTMLResponse)
async def filter_reports(request: Request, category: str = "all"):
    reports = get_all_reports(category if category != "all" else None)
    return templates.TemplateResponse(
        request=request,
        name="partials/report_table.html",
        context={"reports": reports},
    )
