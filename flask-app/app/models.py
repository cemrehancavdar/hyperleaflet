from app import db


class Point(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)
    x = db.Column(db.Float)
    y = db.Column(db.Float)
