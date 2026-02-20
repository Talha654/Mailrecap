const OpenAI = require('openai');
const fs = require('fs');
const config = require('../config/env');
const { parseResponse } = require('../utils/responseParser');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: config.openaiApiKey,
});

/**
 * PRODUCTION CONFIGURATION
 */
const MODEL_CONFIG = {
    model: 'gpt-4o', // Upgraded from gpt-4o-mini
    max_tokens: 1500, // Increased for safety with long documents
    temperature: 0.2, // Low temperature for more deterministic/structured output
};

/**
 * STATIC SYSTEM PROMPT
 * Defines the persona, rules, and output format.
 */
const SYSTEM_PROMPT = `
You are the MailRecap Expert Mail Analyzer.

This is a personal document (utility bill, letter, notice, form, or mailed offer) provided by the user for their own record-keeping and information extraction.

Your task is to:
1) Extract the visible text
2) Summarize it clearly
3) Categorize it using Smart Inbox rules
4) Critically assess credibility and potential risk patterns ONLY when warranted
5) Extract links and a due date (if present) safely

Do NOT refuse to process this document unless it contains content you are not allowed to handle under policy (e.g., explicit instructions for wrongdoing). Otherwise, proceed.

========================
SMART INBOX CATEGORY RULES (STRICT)

You MUST assign exactly ONE category from the list below.
Every document MUST fit into one of these categories.

Marketing, Offers, Subscriptions, Bills, Banking, Insurance, Utilities, Government, Medical, Housing, Legal, Business, Receipts, Warranty, Personal, Packages, Notices, Urgent, Archive, Charity, Education, ID, Suspicious

DO NOT invent categories.
DO NOT use placeholders such as "general" or "review".

========================
SUSPICIOUS OVERRIDE RULE

Assign the category "Suspicious" if:
- There is ONE strong risk signal (e.g., misleading authority cues, unusual payment method, suspicious domain or link), OR
- There are TWO OR MORE moderate risk signals (e.g., urgency + vague sender, generic “final notice” language + payment pressure).

If "Suspicious" is assigned, it OVERRIDES all other categories.
If NOT Suspicious, classify by the primary subject and intent using the category list.

IMPORTANT:
Only include “credibility / risk / verification hygiene” language in the Summary or Smart Bullets if the category is Suspicious OR if there are clear risk signals. Do NOT imply fraud or wrongdoing for normal official mail.

========================
SAFE ANALYSIS RULES
NO PROFESSIONAL ADVICE

Provide clear summarization and general information only.
Do NOT provide legal, financial, or medical advice.
Do NOT interpret or assert the user’s rights, protections, claims, or outcomes.
Do NOT tell the user what they “should” do in a way that substitutes for a licensed professional.

ALLOWED:
- Key facts (dates, amounts, sender purpose)
- Neutral follow-ups (only when relevant, especially for Suspicious)
- Smart questions the user could ask the sender or a licensed professional (only when relevant)
- ONE high-value, practical insight focused on verification, organization, or risk awareness (only when relevant)

========================
SMART LINK EXTRACTION

If the document contains URLs, QR codes, or payment portals:
- Identify them
- Describe their general purpose (payment, account access, information)
- Do NOT encourage clicking
- Do NOT imply fraud for official-looking mail

IMPORTANT:
- Only extract valid full URLs starting with http:// or https://.
- Do NOT include plain text descriptions as links.
- If a link is just text like "Visit our website" without a URL, IGNORE it.

If the category is Suspicious, you MAY include a brief neutral caution about links using probabilistic language.

========================
PRIVACY / PII MINIMIZATION

Do NOT output sensitive identifiers in full.
Mask or omit: Full account numbers, SSNs, Barcodes, Full addresses, Full card or bank numbers, Passwords.
Use “[REDACTED]” where appropriate.

========================
DUE DATE EXTRACTION (USER-FACING)

Extract a single due date (or respond-by date) if the document provides one.
- If the document says “Due upon receipt”, set Due Date to: UPON RECEIPT
- If multiple due dates exist, choose the most urgent one
- If no due date exists, set Due Date to: NONE

========================
OUTPUT TEMPLATE (STRICT)

Title: <3–5 word descriptive title>
Date: <YYYY-MM-DD or 'Today' if not found>
Category: <ONE category from the allowed list>

Summary:
Write 60–70 words in the Target Language.
Paraphrase the document (do NOT copy).
Include:
- Type of mail
- Sender’s apparent purpose
- Key dates or amounts to note (neutral; no conclusions)
- One practical usage or record-keeping insight (e.g., what information to retain, what details to compare later)
DO NOT mention how or where the mail should be filed.
DO NOT explain or restate the assigned category in narrative form.

Avoid exposing PII.
Do NOT include fraud/verification warnings unless category is Suspicious or clear risk signals exist.

Smart Bullets:
1. <20–30 words: the most important thing to note or verify (amount, due date, service period, sender, reference number)>
2. <20–30 words: a neutral next step for record-keeping (e.g., save, match to insurance/EOB, keep receipt, note balance)>
3. <20–30 words: if Suspicious, include a cautious verification-oriented question; otherwise, include a neutral clarifying question to ask the sender if needed>

Links:
- <List any URLs or portals referenced (describe purpose). If none, write NONE.>

Due Date:
<YYYY-MM-DD | UPON RECEIPT | NONE>
`;

/**
 * Construct the user message with dynamic variables.
 */
const buildUserMessage = (extractedData, letterText) => {
    const {
        mail_category = 'general',
        domain_expert_role = 'general advisor',
        extracted_date = 'Today',
        extracted_title = 'Mail Summary',
        target_language = 'English',
    } = extractedData;

    return `
========================
CRITICAL LANGUAGE REQUIREMENT
YOU MUST GENERATE THE CONTENT OF YOUR OUTPUT IN ${target_language}.
EXCEPTIONS - DO NOT TRANSLATE THESE SPECIFIC HEADERS:
- Title:
- Date:
- Category:
- Summary:
- Smart Bullets:
- Links:
- Due Date:
These headers MUST remain exactly as written above in English, and no formatting asterisks should be added to them.
Only translate the actual *values* and *content* that you generate into ${target_language}.
========================

INPUT VARIABLES
Letter Text: ${letterText}
Mail Category Hint: ${mail_category}
Domain Expert Role: ${domain_expert_role}
Extracted Date: ${extracted_date}
Extracted Title: ${extracted_title}
Output Language: ${target_language}

Please analyze the attached image and the text above provided according to the system rules.
`;
};

/**
 * SUGGESTION: Image Optimization
 * Un-comment and install 'sharp' (npm install sharp) to enable.
 * Large images can cause latency or failures.
 */
/*
const sharp = require('sharp');
const optimizeImage = async (buffer) => {
    try {
        return await sharp(buffer)
            .resize(2048, 2048, { fit: 'inside' }) // Resize to max 2048x2048
            .jpeg({ quality: 80 }) // Compress to JPEG 80% quality
            .toBuffer();
    } catch (err) {
        console.warn('Image optimization failed, using original:', err.message);
        return buffer;
    }
};
*/

/**
 * Sleep helper for retry logic
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main Analysis Function with Retry Logic
 */
const analyzeImage = async (filePath, originalName, mimeType, extractedData) => {
    let retries = 0;
    const MAX_RETRIES = 3;

    console.log(`[OpenAI Service] Processing image: ${originalName}`);

    // 1. Read Image File
    let imageBuffer;
    try {
        imageBuffer = fs.readFileSync(filePath);
        // Optimization hook:
        // imageBuffer = await optimizeImage(imageBuffer);
    } catch (readError) {
        console.error('[OpenAI Service] Failed to read file:', readError);
        throw readError;
    }

    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // 2. Prepare Messages
    const userContent = buildUserMessage(extractedData, extractedData.letter_text || '');

    while (retries < MAX_RETRIES) {
        try {
            console.log(`[OpenAI Service] Attempt ${retries + 1}/${MAX_RETRIES} using ${MODEL_CONFIG.model}...`);

            const response = await openai.chat.completions.create({
                model: MODEL_CONFIG.model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: userContent },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: dataUrl,
                                    detail: 'high', // Use high detail for document text
                                },
                            },
                        ],
                    },
                ],
                max_tokens: MODEL_CONFIG.max_tokens,
                temperature: MODEL_CONFIG.temperature,
            });

            const choice = response.choices[0];
            const content = choice.message.content;
            const finishReason = choice.finish_reason;

            // 3. Validation
            if (!content || content.trim().length === 0) {
                const err = new Error('OpenAI returned empty content.');
                // Trigger retry
                throw err;
            }

            if (finishReason === 'length') {
                console.warn('[OpenAI Service] Warning: Output truncated due to token limit.');
                // Depending on requirements, we might want to retry with even higher tokens 
                // or just accept partial (risk of invalid JSON/Structure). 
                // For now, we treat as an error to trigger retry or fail safely.
                const err = new Error('OpenAI response truncated (length).');
                throw err;
            }

            console.log('[OpenAI Service] Analysis successful.');
            // console.log('AI OUTPUT DEBUG:', content); // Uncomment for debugging

            // 4. Parse Output
            return parseResponse(content);

        } catch (error) {
            retries++;
            console.error(`[OpenAI Service] Error on attempt ${retries}:`, error.message);

            if (retries >= MAX_RETRIES) {
                console.error('[OpenAI Service] Max retries reached. Failing.');
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s...
            const delay = Math.pow(2, retries - 1) * 1000;
            console.log(`[OpenAI Service] Retrying in ${delay}ms...`);
            await sleep(delay);
        }
    }
};

module.exports = {
    analyzeImage,
};
