const OpenAI = require('openai');
const fs = require('fs');
const config = require('../config/env');
const { parseResponse } = require('../utils/responseParser');

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

This is a personal document (utility bill, letter, notice, form, or mailed offer) provided by the user for their own record-keeping and information extraction.

Your task is to:
1) Extract the visible text
2) Summarize it clearly
3) Categorize it using Smart Inbox rules
4) Critically assess credibility and potential risk patterns ONLY when warranted
5) Extract links and a due date (if present) safely

Do NOT refuse to process this document unless it contains content you are not allowed to handle under policy (e.g., explicit instructions for wrongdoing). Otherwise, proceed.

========================
CRITICAL LANGUAGE REQUIREMENT
YOU MUST GENERATE ALL OUTPUT IN ${target_language}.
This includes the Title, Category, Summary, Smart Bullets, Links, and Due Date.
Do NOT use English unless ${target_language} is English.
Every single word in your response must be in ${target_language}.
========================

INPUT VARIABLES
Letter Text: ${letter_text}
Mail Category Hint (may be ignored or overridden): ${mail_category}
Domain Expert Role: ${domain_expert_role}
Extracted Date: ${extracted_date}
Extracted Title: ${extracted_title}
Output Language: ${target_language}

========================
SMART INBOX CATEGORY RULES (STRICT)

You MUST assign exactly ONE category from the list below.
Every document MUST fit into one of these categories.

Marketing
Offers
Subscriptions
Bills
Banking
Insurance
Utilities
Government
Medical
Housing
Legal
Business
Receipts
Warranty
Personal
Packages
Notices
Urgent
Archive
Charity
Education
ID
Suspicious

DO NOT invent categories.
DO NOT use placeholders such as "general" or "review".

========================
SUSPICIOUS OVERRIDE RULE

Assign the category "Suspicious" if:
- There is ONE strong risk signal (e.g., misleading authority cues, unusual payment method, suspicious domain or link), OR
- There are TWO OR MORE moderate risk signals (e.g., urgency + vague sender, generic “final notice” language + payment pressure).

Common patterns include (but are not limited to):
- Vague or unverifiable sender identity
- Fear-based or deadline-driven urgency that seems manipulative
- Generic notices without a clear user relationship
- Payment pressure or unusual payment paths
- Unclear or uncommon links or QR codes
- Common solicitation patterns such as vehicle warranty mail

If "Suspicious" is assigned, it OVERRIDES all other categories.

If NOT Suspicious, classify by the primary subject and intent using the category list.

IMPORTANT:
Only include “credibility / risk / verification hygiene” language in the Summary or Smart Bullets if the category is Suspicious
OR if there are clear risk signals. Do NOT imply fraud or wrongdoing for normal official mail.

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

NO LEGAL OR FORMAL DOCUMENT DRAFTING

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
Mask or omit:
- Full account numbers
- SSNs
- Barcodes
- Full addresses
- Full card or bank numbers
- Passwords

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
Date: ${extracted_date}
Category: <ONE category from the allowed list>

Summary:
Write 60–70 words in ${target_language}.
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

        // -----------------------
        // 4. OpenAI Call
        // -----------------------
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
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


module.exports = {
    analyzeImage,
};
