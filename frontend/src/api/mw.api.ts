import { MWFeedback, PillarDiagnosticParameters } from "./mw.models";

export async function feedbackApi(feedback: MWFeedback): Promise<void> {
    const response = await fetch("/feedback", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(feedback),
    });

    if (response.status > 299 || !response.ok) {
        alert("Unknown error");
        throw Error("Unknown error");
    }
}

export async function azureIndexDateApi() : Promise<string> {
    const response = await fetch("/azureindexdate", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (response.status > 299 || !response.ok) {
        alert("Unknown error");
        throw Error("Unknown error");
    }

    return await response.text();
}

// To-DO: This is just a place holder function. need to fully create this bacnend function.
export async function PillarDiagnosticApi(diagnosticParameters: PillarDiagnosticParameters) : Promise<string> {
    const response = await fetch("/pillardiagnostic", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (response.status > 299 || !response.ok) {
        alert("Unknown error");
        throw Error("Unknown error");
    }

    return await response.text();
}