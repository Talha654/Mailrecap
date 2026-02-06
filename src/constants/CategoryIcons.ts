import {
    Megaphone,
    Tag,
    Repeat,
    FileText,
    CreditCard,
    Shield,
    Zap,
    Scale,
    Activity,
    Home,
    Briefcase,
    Receipt,
    ShieldCheck,
    User,
    Package,
    AlertCircle,
    AlertTriangle,
    Archive,
    Heart,
    GraduationCap,
    AlertOctagon,
    Mail,
    Car,
    LucideIcon
} from 'lucide-react-native';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
    'Marketing': Megaphone,
    'Offers': Tag,
    'Subscriptions': Repeat,
    'Bills': FileText,
    'Banking': CreditCard,
    'Insurance': Shield,
    'Utilities': Zap,
    'Government': Scale,
    'Medical': Activity,
    'Housing': Home,
    'Legal': Scale,
    'Business': Briefcase,
    'Receipts': Receipt,
    'Warranty': ShieldCheck,
    'Personal': User,
    'Packages': Package,
    'Notices': AlertCircle,
    'Urgent': AlertTriangle,
    'Archive': Archive,
    'Charity': Heart,
    'Education': GraduationCap,
    'ID': CreditCard,
    'Suspicious': AlertOctagon,
    // Fallbacks or Compound Categories
    'Bills & Utilities': FileText,
    'Mortgage / Rent / Housing': Home,
    'Vehicle': Car,
    'Medical / Insurance': Activity,
    'Banking / Financial': CreditCard,
    'Government / Legal': Scale,
    'Subscriptions / Memberships': Repeat,
    'Personal / General': User,
    'Promotions / Offers': Tag,
};

export const getCategoryIcon = (category: string | undefined): LucideIcon => {
    if (!category) return Mail;

    // Direct match
    if (CATEGORY_ICONS[category]) {
        return CATEGORY_ICONS[category];
    }

    // Case insensitive match
    const lowerCat = category.toLowerCase();
    // Sort keys by length descending
    const keys = Object.keys(CATEGORY_ICONS).sort((a, b) => b.length - a.length);

    // 1. Check if input category includes a known key
    for (const key of keys) {
        if (lowerCat.includes(key.toLowerCase())) {
            return CATEGORY_ICONS[key];
        }
    }

    // 2. Check if a known key includes the input category
    for (const key of keys) {
        if (key.toLowerCase().includes(lowerCat)) {
            return CATEGORY_ICONS[key];
        }
    }

    return Mail;
};
