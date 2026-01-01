const OpenAI = require('openai');
const fs = require('fs');
const config = require('../config/env');

const openai = new OpenAI({
    apiKey: config.openaiApiKey,
});

const analyzeImage = async (filePath, originalName, mimeType, extractedData) => {
    try {
        console.log('Processing image:', originalName);

        // -----------------------
        // 1. Read Image File
        // -----------------------
        const imageBuffer = fs.readFileSync(filePath);
        const base64Image = imageBuffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        // -----------------------
        // 2. Extracted Variables (from OCR & logic)
        // -----------------------
        const {
            letter_text = '',
            mail_category = 'general',
            domain_expert_role = 'general advisor',
            extracted_date = 'Today',
            extracted_title = 'Mail Summary',
            target_language = 'English',
        } = extractedData;

        // -----------------------
        // 3. Final Updated Prompt (v3)
        // -----------------------
        const prompt = `
You are the MailRecap Expert Mail Analyzer.
This is a personal document (utility bill, letter, or form) provided by the user for their own record-keeping and data extraction.
Your task is to extract the visible text and summarize it for the user.

Do NOT refuse to process this document unless it contains content you are not allowed to handle under policy (e.g., explicit instructions for wrongdoing). Otherwise, proceed.

========================
CRITICAL LANGUAGE REQUIREMENT
========================
*YOU MUST GENERATE ALL OUTPUT IN ${target_language}.*
This includes the Title, Summary, and Smart Bullets.
Do NOT use English unless ${target_language} is English.
Every single word in your response must be in ${target_language}.

========================
INPUT VARIABLES
========================
Letter Text: {letter_text}
Mail Category: ${mail_category}
Domain Expert Role: ${domain_expert_role}
Extracted Date: ${extracted_date}
Extracted Title: ${extracted_title}
Output Language: ${target_language}

========================
FULL INSTRUCTIONS
========================
Analyze the letter like a specialized ${domain_expert_role}, BUT you must follow these safety rules:

1) NO PROFESSIONAL ADVICE
- Provide clear summarization and general information only.
- Do NOT provide legal advice, financial advice, medical advice, or other professional advice.
- Do NOT interpret or assert the user’s legal rights, legal protections, legal claims, or legal outcomes.
- Do NOT tell the user what they “should” do in a way that substitutes for a licensed professional.

2) SAFE ACTIONABILITY (ALLOWED)
You MAY provide:
- dates to verify, amounts, sender purpose, and key factual details
- common follow-ups phrased generally (e.g., “Consider contacting the sender to confirm…”)
- smart questions the user can ask the sender or a licensed professional
- one high-value insight that is practical and non-obvious (e.g., what to verify, what to gather, what to watch for)

3) NO LEGAL DOCUMENT DRAFTING
- Do NOT draft motions, demand letters, legal filings, or formal legal correspondence.

4) PRIVACY / PII MINIMIZATION
- Do NOT output sensitive identifiers in full.
- Mask or omit: full account numbers, SSN, barcodes, full addresses, full card/bank numbers, passwords.
- If needed, show only last 2–4 digits (e.g., “****1234”) or use “[REDACTED]”.

5) TONE / CERTAINTY
- Avoid absolute statements. Use “may,” “might,” “appears,” and “to verify” where appropriate.
- If the document appears time-sensitive or serious (legal/medical/financial), include a short “consider a licensed professional” note inside Smart Bullets (in ${target_language}).

*REMEMBER: Write everything in ${target_language}.*

========================
OUTPUT TEMPLATE (STRICT)
========================

Title: <Generate a short, descriptive title (3-5 words) based on the letter content - MUST BE IN ${target_language}>

Date: ${extracted_date}

Summary:
Write 60–70 words in ${target_language}.
Paraphrase the letter (do NOT copy text).
Include:
- type of mail
- sender's purpose
- key amounts/dates to verify (do not present as legal conclusions)
- what the user needs to know at a glance
- one deep, practical insight (verification or organization tip), NOT professional advice
- avoid exposing PII (mask/redact)

*ALL SUMMARY TEXT MUST BE IN ${target_language}*

Smart Bullets:
1.<20–30 words: the single most urgent thing to verify or check (deadline/date/contact), IN ${target_language}>
2.<20–30 words: a common follow-up phrased generally (e.g., contact sender, gather documents), IN ${target_language}>
3.<20–30 words: smart questions to ask a licensed professional or the sender + a brief “general information, not advice” note if relevant, IN ${target_language}>

*ALL Smart Bullets MUST BE IN ${target_language}*
        `;

        // -----------------------
        // 4. OpenAI Call
        // -----------------------
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt.replace('{letter_text}', letter_text) },
                        {
                            type: 'image_url',
                            image_url: { url: dataUrl },
                        },
                    ],
                },
            ],
            max_tokens: 500,
        });

        const content = response.choices[0].message.content;
        console.log('AI OUTPUT:', content);

        // -----------------------
        // 5. Parse AI Output
        // -----------------------
        return parseResponse(content);
    } catch (error) {
        console.error('Error in OpenAI service:', error);
        throw error;
    }
};

// ========================
// PARSER UPDATED FOR v3
// ========================

const parseResponse = (content) => {
    let title = '';
    let date = '';
    let summary = '';
    let steps = [];

    const lines = content.split('\n');
    let section = '';

    for (let line of lines) {
        line = line.trim();

        if (line.startsWith('Title:')) {
            section = 'title';
            title = line.replace('Title:', '').trim();
            continue;
        }
        if (line.startsWith('Date:')) {
            section = 'date';
            date = line.replace('Date:', '').trim();
            continue;
        }
        if (line.startsWith('Summary:')) {
            section = 'summary';
            continue;
        }
        if (line.startsWith('Smart Bullets:') || line.startsWith('Next Steps:')) {
            section = 'steps';
            continue;
        }

        // Section Parsing
        if (section === 'summary' && line) {
            summary += line + ' ';
        }

        if (section === 'steps') {
            // Remove numbering like "1.", "2." and keep the text
            const cleanedLine = line.replace(/^\d+[\.)]\s*/, '').trim();
            if (cleanedLine) {
                steps.push(cleanedLine);
            }
        }
    }

    return {
        title: title || 'Mail Summary',
        date: date || 'Today',
        summary: summary.trim(),
        suggestions: steps,
        fullText: content,
    };
};

module.exports = {
    analyzeImage,
};
