// ========================
// PARSER UTILITY
// ========================

const parseResponse = (content) => {
    let title = '';
    let category = '';
    let date = '';
    let summary = '';
    let links = [];
    let steps = [];
    let dueDate = null;

    const lines = content.split('\n');
    let section = '';

    for (let line of lines) {
        line = line.trim();

        if (line.startsWith('Title:')) {
            section = 'title';
            title = line.replace('Title:', '').trim();
            continue;
        }
        if (line.startsWith('Category:')) {
            section = 'category';
            category = line.replace('Category:', '').trim();
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
        if (line.startsWith('Smart Bullets:')) {
            section = 'steps';
            continue;
        }
        if (line.startsWith('Links:')) {
            section = 'links';
            continue;
        }
        if (line.startsWith('Due Date:')) {
            const val = line.replace('Due Date:', '').trim();
            if (val && val !== 'NONE') {
                dueDate = val;
            }
            continue;
        }

        // Section Parsing
        if (section === 'summary' && line) {
            summary += line + ' ';
        }

        if (section === 'steps') {
            const cleanedLine = line.replace(/^\d+[\.)]\s*/, '').trim();
            if (cleanedLine) {
                steps.push(cleanedLine);
            }
        }

        if (section === 'links') {
            // Remove bullet points if present
            const cleanedLink = line.replace(/^-\s*/, '').trim();
            // FILTER: Only allow links that contain 'http'
            if (cleanedLink && cleanedLink !== 'NONE' && cleanedLink.includes('http')) {
                links.push(cleanedLink);
            }
        }
    }

    // Build result object
    const result = {
        title: title || 'Mail Summary',
        category: category || 'General',
        date: date || 'Today',
        summary: summary.trim(),
        suggestions: steps,
        links: links,
        fullText: content,
    };

    // Map Due Date to actionableDate structure for compatibility
    if (dueDate) {
        result.actionableDate = {
            date: dueDate,
            type: 'deadline', // Defaulting to deadline as it's a due date
            confidence: 'HIGH', // Assuming high confidence since it's explicitly extracted
            description: 'Due Date extracted from document'
        };
    }

    return result;
};

module.exports = {
    parseResponse,
};
