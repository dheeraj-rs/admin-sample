import { ClassValue, ClassDictionary } from "@/types/lib";
import { useQuery } from '@tanstack/react-query';

// Enhanced cn utility with more features
export function cn(...args: ClassValue[]) {
    const classes: string[] = [];

    args.forEach((arg) => {
        if (!arg) return;

        const argType = typeof arg;

        if (argType === 'string' || argType === 'number') {
            classes.push(String(arg));
        } else if (Array.isArray(arg)) {
            classes.push(cn(...arg));
        } else if (argType === 'object' && !Array.isArray(arg)) {
            const argObj = arg as ClassDictionary; // Ensure arg is ClassDictionary
            Object.keys(argObj).forEach((key) => {
                if (argObj[key]) {
                    classes.push(key);
                }
            });
        }
    });

    return classes.filter(Boolean).join(' ');
}

export const classNames = (...classes: ClassValue[]): string => {
    const result = new Set<string>();

    const addClass = (item: ClassValue): void => {
        if (!item) return;

        // Handle strings and numbers
        if (typeof item === 'string' || typeof item === 'number') {
            result.add(String(item));
            return;
        }

        // Handle arrays recursively
        if (Array.isArray(item)) {
            item.forEach(addClass);
            return;
        }

        // Handle objects with conditional classes
        if (typeof item === 'object') {
            Object.entries(item).forEach(([className, condition]) => {
                // Explicitly evaluate the condition
                let shouldAdd = false;

                // Handle complex conditions with explicit checks
                if (typeof condition === 'boolean') {
                    shouldAdd = condition;
                } else {
                    try {
                        // More explicit evaluation of the condition
                        shouldAdd = condition === true || (condition !== false && condition !== null && condition !== undefined);
                    } catch {
                        shouldAdd = false;
                    }
                }

                if (shouldAdd) {
                    result.add(className);
                }
            });
        }
    };

    classes.forEach(addClass);
    return Array.from(result).filter(Boolean).join(' ');
};

export const dateFormat = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

export const fetchElements = async (page: number, limit: number, filters: any) => {
    // TODO: Implement actual API call
    return [];
};

export const useGetAllElements = (page: number, limit: number, filters: any) => {
    return useQuery({
        queryKey: ['elements', page, limit, filters],
        queryFn: () => fetchElements(page, limit, filters),
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
};