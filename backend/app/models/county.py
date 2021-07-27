from app import db


class County(db.Model):
    county_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String)
    property_taxes = db.Column(db.DECIMAL(asdecimal=False))
    state_id = db.Column(db.Integer, db.ForeignKey(
        "state.state_id"), nullable=True)
