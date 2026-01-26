"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExactlyDaysAway = exports.isThirtyMinutesBefore = exports.calculateUsualScanTime = void 0;
const HIGH_CONFIDENCE_THRESHOLD = 0.5;
const MIN_SAMPLES = 7;
/**
 * Calculate the usual scan time based on history
 * Returns a time string "HH:MM" if confidence is HIGH, else null
 */
function calculateUsualScanTime(scans) {
    if (scans.length < MIN_SAMPLES) {
        return { time: '', confidence: 'LOW' };
    }
    // Bucket scans into 30-minute intervals
    const buckets = {};
    scans.forEach(scan => {
        // Round to nearest 30 mins
        const bucketMinute = Math.floor(scan.minute / 30) * 30;
        const key = `${scan.hour.toString().padStart(2, '0')}:${bucketMinute.toString().padStart(2, '0')}`;
        buckets[key] = (buckets[key] || 0) + 1;
    });
    // Find bucket with max scans
    let maxScans = 0;
    let bestBucket = '';
    Object.entries(buckets).forEach(([bucket, count]) => {
        if (count > maxScans) {
            maxScans = count;
            bestBucket = bucket;
        }
    });
    // Calculate confidence
    const confidenceScore = maxScans / scans.length;
    return {
        time: bestBucket,
        confidence: confidenceScore >= HIGH_CONFIDENCE_THRESHOLD ? 'HIGH' : 'LOW'
    };
}
exports.calculateUsualScanTime = calculateUsualScanTime;
/**
 * Check if the current time is approximately 30 minutes before the target time
 */
function isThirtyMinutesBefore(targetTime, timezone = 'UTC') {
    var _a, _b;
    const [targetHour, targetMinute] = targetTime.split(':').map(Number);
    // Get current time in user's timezone
    const now = new Date();
    const options = {
        timeZone: timezone,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);
    const currentHour = parseInt(((_a = parts.find(p => p.type === 'hour')) === null || _a === void 0 ? void 0 : _a.value) || '0');
    const currentMinute = parseInt(((_b = parts.find(p => p.type === 'minute')) === null || _b === void 0 ? void 0 : _b.value) || '0');
    // Convert everything to minutes from midnight
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const targetTotalMinutes = targetHour * 60 + targetMinute;
    // Check if target is 30 mins ahead (with 15 min buffer window)
    const diff = targetTotalMinutes - currentTotalMinutes;
    // Ideally diff is 30. Allow 15-45 minute range to catch it.
    // Actually, since this runs every 30 mins, a window of 30 mins centered on target-30 is safe?
    // Let's say we want to catch it if we are [15, 45] minutes before.
    return diff >= 15 && diff <= 45;
}
exports.isThirtyMinutesBefore = isThirtyMinutesBefore;
/**
 * Check if a date is exactly N days from now
 */
function isExactlyDaysAway(targetDate, days) {
    const now = new Date();
    // Normalize to start of day
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === days;
}
exports.isExactlyDaysAway = isExactlyDaysAway;
//# sourceMappingURL=confidence.js.map