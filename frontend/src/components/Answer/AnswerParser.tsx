import { AskResponse, Citation, Diagnostic } from "../../api";
import { cloneDeep, matches } from "lodash-es";


type ParsedAnswer = {
    citations: Citation[];
    diagnostics: Diagnostic[];
    markdownFormatText: string;
};

export function parseAnswer(answer: AskResponse): ParsedAnswer {
    let answerText = answer.answer;
    const citationLinks = answerText.match(/\[(doc\d\d?\d?)]/g);
    
    //citation.content.match(/diag:\/\/\S+/g));

    const lengthDocN = "[doc".length;
    const lengthDiag = "diag://".length;

    let filteredCitations = [] as Citation[];
    let diagnosticLinks = [] as Diagnostic[];
    let citationReindex = 0;
    citationLinks?.forEach(link => {
        // Replacing the links/citations with number
        let citationIndex = link.slice(lengthDocN, link.length - 1);
        let citation = cloneDeep(answer.citations[Number(citationIndex) - 1]) as Citation;
        if (!filteredCitations.find((c) => c.id === citationIndex)) {
          answerText = answerText.replaceAll(link, ` ^${++citationReindex}^ `);
          citation.id = citationIndex; // original doc index to de-dupe
          citation.reindex_id = citationReindex.toString(); // reindex from 1 for display
          filteredCitations.push(citation);
        }
        
        //filters the citation.content to find the 'diag://' link in the citation
        filteredCitations.forEach( citation => {
            const matches = citation.content.match(/diag:\/\/\S+/g);
            if (matches) {
                diagnosticLinks = matches.map( match => ({
                    diagnosticLink: match,
                }));
            }
        })
    })



    return {
        citations: filteredCitations,
        diagnostics: diagnosticLinks,
        markdownFormatText: answerText
    };
}
