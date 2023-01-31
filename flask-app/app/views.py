from app import app, db
from app.models import Point
from flask import request, render_template


@app.route("/", methods=["GET"])
def home():
    points = Point.query.paginate(page=0, per_page=2, error_out=False)

    return render_template("table.html", points=points)


@app.route("/point", methods=["GET"])
def get_points():
    page = request.args.get("page")
    if page:
        page = int(page)
        points = Point.query.paginate(page=page, per_page=2, error_out=False)
        print(points.total)
        print(points.items)
        page = int(page) + 1
        return render_template("point_rows.html", points=points.items, page=page)
    return ""


@app.route("/point/", methods=["POST"])
def point():
    x = request.form.get("x")
    y = request.form.get("y")
    print(x)
    print(y)
    point = Point(x=x, y=y)
    db.session.add(point)
    db.session.commit()

    print(point)
    return render_template("point_row.html", point=point)


@app.route("/point/<id>", methods=["DELETE"])
def point_delete(id):
    print(id)
    return ""
