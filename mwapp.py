import os
import uuid
from flask import Blueprint, request, jsonify
from azure.cosmosdb.table.tableservice import TableService
from azure.cosmosdb.table.models import Entity

# Create a blueprint instance
mw_blueprint = Blueprint('mw', __name__)

TABLE_SERVICE_CONNECTION_STRING = os.environ.get("TABLE_SERVICE_CONNECTION_STRING")

table_service = TableService(connection_string=TABLE_SERVICE_CONNECTION_STRING)

@mw_blueprint.route("/feedback", methods=["POST"])
def feedback():
    json = request.get_json()
    id = uuid.uuid4()
    tableEntity = {
        "PartitionKey": "Global",
        "RowKey": str(id),
        "overall_response_quality": json["overall_response_quality"],
        "overall_document_quality": json["overall_document_quality"],
        "incorrect_answer": json["incorrect_answer"],
        "not_5_star": json["not_5_star"],
        "inaccurate_answer": json["inaccurate_answer"],
        "missing_info": json["missing_info"],
        "too_long": json["too_long"],
        "too_short": json["too_short"],
        "confusing": json["confusing"],
        "offensive": json["offensive"],
        "biased": json["biased"],
        "outdated": json["outdated"],
        "repetitive": json["repetitive"],
        "fantastic": json["fantastic"],
        "case_number": json["case_number"],
    }

    table_service.insert_entity("Feedback", tableEntity)

    return jsonify({"success": True, "feedback": json})
