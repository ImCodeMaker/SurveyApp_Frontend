export const SessionStorageGetItem = (key: string): string | null => {
    if (typeof window !== 'undefined') {
        return sessionStorage.getItem(key);
    }
    return null;
};

export const SessionStorageSetItem = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, value);
    }
};

export const SessionStorageDeleteItem = (key: string): void => {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem(key);
    }
};