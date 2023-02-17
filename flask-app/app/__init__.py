from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from app import create_db
import os

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

db_path = os.path.join("sqlite.db")
app.config["SQLALCHEMY_DATABASE_URI"] = f'sqlite:///{db_path}'
app.config["SQLALCHEMY_ECHO"] = False
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


db = SQLAlchemy()

from app import views
from app import models

db.init_app(app)
with app.app_context():
    db.create_all() 
    