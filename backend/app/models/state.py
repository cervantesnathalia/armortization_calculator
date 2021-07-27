from app import db


class State(db.Model):
    state_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String)
    property_taxes = db.Column(db.DECIMAL(asdecimal=False))
    county = db.relationship('County', backref='counties', lazy=True)
