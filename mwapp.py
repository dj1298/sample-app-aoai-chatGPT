import os
import uuid
from flask import Blueprint, request, jsonify
from azure.cosmosdb.table.tableservice import TableService
from presidio_analyzer import AnalyzerEngine
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig
import requests

# Create a blueprint instance
mw_blueprint = Blueprint('mw', __name__)

acs_index_map = {
    "M365Combined": "INDEX_NAME_M365COMBINED",
    "MWOnPrem": "INDEX_NAME_MWONPREM",
}

def map_acs_index(indexId: str, defaultIndex: str) -> str:
    env_var_name = acs_index_map[indexId]
    index = os.environ.get(env_var_name)
    return index if index else defaultIndex

TABLE_SERVICE_CONNECTION_STRING = os.environ.get("TABLE_SERVICE_CONNECTION_STRING")

BING_API_KEY = os.environ.get("BING_API_KEY")
BING_AUTOSUGGEST_URL = os.environ.get("BING_AUTOSUGGEST_URL")

if (TABLE_SERVICE_CONNECTION_STRING):
    table_service = TableService(connection_string=TABLE_SERVICE_CONNECTION_STRING)

@mw_blueprint.route("/azureindexdate", methods=["GET"])
def azureindexdate():
    AZURE_INDEX_DATE = os.environ.get("AZURE_INDEX_DATE")
    return AZURE_INDEX_DATE

@mw_blueprint.route('/get_autosuggestions', methods=['GET'])
def get_autosuggestions():
    query = request.args.get('query', '')
    market = 'en-us'
    headers = {'Ocp-Apim-Subscription-Key': BING_API_KEY}
    params = {'q': query}
    response = requests.get(BING_AUTOSUGGEST_URL, headers=headers, params=params)
    suggestions = response.json().get('suggestionGroups', [])
    print(query)
    print(response)
    print(suggestions)
    return jsonify(suggestions)

@mw_blueprint.route("/feedback", methods=["POST"])
def feedback():
    json = request.get_json()
    id = uuid.uuid4()
    username = ""
    # Check the allowContact setting, and if true, then track the username
    #allowedToContact = json["allow_contact"]
    #if (allowedToContact):
        #username = request.headers.get("X-MS-CLIENT-PRINCIPAL-NAME")
    #else:
        #username = ""
    topDocs = jsonify(json["top_docs"]).data.decode("utf-8")


    anonymized_verbatim = anonymize(json["verbatim"], is_feedback=True)
    anonymized_documentation_accuracy_relevance = anonymize(json["documentation_accuracy_relevance"], is_feedback=True)
    anonymized_question = anonymize(json["question"])
    anonymized_answer = anonymize(json["answer"])

    tableEntity = {
        "PartitionKey": "Global",
        "RowKey": str(id),
        "username": username,
        "documentation_accuracy_relevance": anonymized_documentation_accuracy_relevance,
        "overall_response_quality": json["overall_response_quality"],
        "overall_document_quality": json["overall_document_quality"],
        "verbatim": anonymized_verbatim,
        "inaccurate_answer": json["inaccurate_answer"],
        "confusing": json["confusing"],
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
        table_service.insert_entity("CSSGPTFeedback", tableEntity)

    return jsonify({"success": True, "feedback": json})

# PII Scrubbing
configuration = {
    "nlp_engine_name": "spacy",
    "models": [{"lang_code": "en", "model_name": "en_core_web_sm"}],
}
provider = NlpEngineProvider(nlp_configuration=configuration)
nlp_engine = provider.create_engine()

analyzer = AnalyzerEngine(nlp_engine=nlp_engine)
anonymizer = AnonymizerEngine()

# Simple function to keep certain PII
def keep(text: str):
    return text

fb_operators = { "URL": OperatorConfig("custom", { "lambda": keep }), "DEFAULT": OperatorConfig("replace") }
qa_operators = { "DEFAULT": OperatorConfig("replace") }

def anonymize(text: str, is_feedback=False):
    # Call analyzer to get results
    results = analyzer.analyze(
        text=text,
        language="en",
    )

    anonymized_text = anonymizer.anonymize(
        text=text,
        analyzer_results=results,
        operators=fb_operators if is_feedback else qa_operators,
    )

    return anonymized_text.text
