export const SessionStorageSetItem = (key: string, value: string) => {
    if (!key || !value)
        throw new Error('You must provide a value and a key, to use this service.')

    const sessionValue = sessionStorage.setItem(key,value)
    return sessionValue
}

export const SessionStorageGetItems = (key: string) => {
    if (!key)
        throw new Error('You must provide a value and a key, to use this service.')
    
    const findValue = sessionStorage.getItem(key)
    return findValue
}

export const SessionStorageDeleteItems = (key: string) => {
    if (!key)
        throw new Error('You must provide a value and a key, to use this service.')
    
    const findValue = sessionStorage.removeItem(key)
    return findValue
}