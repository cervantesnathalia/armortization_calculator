from flask import Blueprint, request, jsonify, make_response
from app import db
from app.models.state import State
import os
from dotenv import load_dotenv
import requests
from app.models.county import County


states_bp = Blueprint("states", __name__, url_prefix="/states")
hello_world_bp = Blueprint("hello_world", __name__)


load_dotenv()


# Basic route to test if the server is running
@hello_world_bp.route("/hello-world", methods=["GET"])
def hello_world():
    my_beautiful_response_body = "Hello, World!"
    return my_beautiful_response_body


# routes for getting all states and creating a new state
@states_bp.route("", methods=["GET", "POST"])
def handle_states():
    if request.method == "GET":
        states = State.query.all()
        states_response = []
        for state in states:
            states_response.append({
                "state_id": state.state_id,
                "name": state.name,
                "property_taxes": state.property_taxes
            })
        return jsonify(states_response)
    elif request.method == "POST":
        request_body = request.get_json()
        name = request_body.get("name")
        new_state = State(
            name=request_body["name"], property_taxes=request_body["property_taxes"])
        db.session.add(new_state)
        db.session.commit()

    return make_response(f"State {new_state.name} with {new_state.property_taxes} taxes, successfully created", 201)


@ states_bp.route("/<state_id>", methods=["GET", "PUT", "DELETE"])
def handle_state(state_id):
    state = State.query.get_or_404(state_id)
    if request.method == "GET":
        counties = []
        for county in counties:
            single_county = {
                "name": county.name,
                "property_taxes": county.property_taxes
            }
            counties.append(single_county)
        return make_response({
            "id": state.state_id,
            "name": state.name,
            "counties": counties
        })
    elif request.method == "PUT":
        if state == None:
            return make_response("state does not exist", 404)
        form_data = request.get_json

        state.name = form_data["name"]

        db.session.commit()

        return make_response(f"State: {state.name} sucessfully updated.")

    elif request.method == "DELETE":
        if state == None:
            return make_response("State does not exist", 404)
        db.session.delete(state)
        db.session.commit()
        return make_response(f"State: {state.name} sucessfully deleted.")

# route for getting all counties in a state and making a new county


@states_bp.route("/<state_id>/counties", methods=["POST", "GET"])
def handle_counties(state_id):
    state = State.query.get(state_id)

    if state is None:
        return make_response("", 404)

    if request.method == "GET":
        counties = State.query.get(state_id).county
        counties_response = []
        for county in counties:
            counties_response.append({
                "name": county.name,
                "property_taxes": county.property_taxes,
                "state": state.name,
                "count_id": county.county_id
            })
        return make_response(
            {
                "counties": counties_response
            }, 200)
    elif request.method == "POST":
        request_body = request.get_json()
        if 'name' not in request_body:
            return {"details": "Invalid data"}, 400

        new_county = County(name=request_body["name"],
                            state_id=state_id, property_taxes=request_body["property_taxes"])

        db.session.add(new_county)
        db.session.commit()

        return {
            "county": {
                "id": new_county.county_id,
                "name": new_county.name,
                "property": new_county.property_taxes,
            }
        }, 201


# route for deleting a county
@ states_bp.route("/<state_id>/<county_id>", methods=["DELETE"])
def handle_county(state_id, county_id):
    county = County.query.get_or_404(county_id)

    db.session.delete(county)
    db.session.commit()

    return make_response(
        f"County Message: {county.name} County ID: {county.county_id} deleted successfully")


@ states_bp.route("/<state_id>/<county_id>", methods=["GET"])
def handle_single_county_from_specific_state(state_id, county_id):
    county = County.query.get_or_404(county_id)

    if request.method == "GET":
        counties = []
        for county in county.counties:
            single_county = {
                "name": county.name,
                "property_taxes": county.property_taxes
            }
            counties.append(single_county)
        return make_response({
            "id": state_id.county.county_id,
            "name": county.name,
            "counties": counties
        })

    return make_response(
        f"County Message: {county.name} County ID: {county.county_id} deleted successfully")
