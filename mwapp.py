import os
import uuid
from flask import Blueprint, request, jsonify
from azure.cosmosdb.table.tableservice import TableService
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
import spacy

# Create a blueprint instance
mw_blueprint = Blueprint('mw', __name__)

TABLE_SERVICE_CONNECTION_STRING = os.environ.get("TABLE_SERVICE_CONNECTION_STRING")

if (TABLE_SERVICE_CONNECTION_STRING):
    table_service = TableService(connection_string=TABLE_SERVICE_CONNECTION_STRING)

@mw_blueprint.route("/feedback", methods=["POST"])
def feedback():
    json = request.get_json()
    id = uuid.uuid4()
    username = request.headers.get("X-MS-CLIENT-PRINCIPAL-NAME")
    topDocs = jsonify(json["top_docs"]).data.decode("utf-8")

    anonymized_verbatim = anonymize(json["verbatim"])
    anonymized_question = anonymize(json["question"])
    anonymized_answer = anonymize(json["answer"])

    tableEntity = {
        "PartitionKey": "Global",
        "RowKey": str(id),
        "username": username,
        "overall_response_quality": json["overall_response_quality"],
        "overall_document_quality": json["overall_document_quality"],
        "verbatim": anonymized_verbatim,
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
        "question_id": json["question_id"],
        "question": anonymized_question,
        "answer_id": json["answer_id"],
        "answer": anonymized_answer,
        "contentIndex": json["contentIndex"],
        "top_docs": topDocs,
        "in_domain": json["in_domain"],
    }

    if (table_service):
        table_service.insert_entity("Feedback", tableEntity)

    return jsonify({"success": True, "feedback": json})

# PII Scrubbing

# Check if en_core_web_lg pipeline is installed, and install it if necessary
if not spacy.util.is_package("en_core_web_lg"):
    print("Downloading en_core_web_lg...")
    spacy.cli.download("en_core_web_lg")

# Load the pipeline
nlp = spacy.load("en_core_web_lg")

analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

def anonymize(text):
    # Call analyzer to get results
    results = analyzer.analyze(text=text, language='en')

    anonymized_text = anonymizer.anonymize(text=text, analyzer_results=results)

    return anonymized_text.text
