from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from db import (
    create_report,
    delete_report,
    get_all_reports,
    get_categories,
    get_report,
    init_db,
    update_report,
)

BASE_DIR = Path(__file__).parent

CATEGORIES = ["landmark", "nature", "tourism", "infrastructure", "other"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


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
        context={"report": report, "all_categories": CATEGORIES},
    )


@app.get("/reports/{report_id}/edit", response_class=HTMLResponse)
async def edit_report_form(request: Request, report_id: int):
    report = get_report(report_id)
    if not report:
        return HTMLResponse("", status_code=404)
    return templates.TemplateResponse(
        request=request,
        name="partials/report_edit_row.html",
        context={"report": report, "all_categories": CATEGORIES},
    )


@app.put("/reports/{report_id}", response_class=HTMLResponse)
async def save_report(
    request: Request,
    report_id: int,
    name: str = Form(...),
    category: str = Form(...),
    notes: str = Form(""),
    lat: float = Form(...),
    lng: float = Form(...),
):
    report = update_report(report_id, name, category, notes, lat, lng)
    if not report:
        return HTMLResponse("", status_code=404)
    return templates.TemplateResponse(
        request=request,
        name="partials/report_row.html",
        context={"report": report, "all_categories": CATEGORIES},
    )


@app.delete("/reports/{report_id}", response_class=HTMLResponse)
async def remove_report(report_id: int):
    delete_report(report_id)
    return HTMLResponse("")
