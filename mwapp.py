from flask import Blueprint, request, jsonify

# Create a blueprint instance
mw_blueprint = Blueprint('mw', __name__)

@mw_blueprint.route("/feedback", methods=["POST"])
def feedback():
    return jsonify({"success": True, "feedback": request.get_json()})
