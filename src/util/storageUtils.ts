import { ISaveStorageItems } from "../types";

const getLocalStorage = (key: string) => {
    let items;
    let parsedItems;
    try {
        items =  localStorage.getItem(key)
        parsedItems = items && JSON.parse(items);
    } catch (error) {
        throw new Error('Items not found')        
    } finally {
        return parsedItems;
    }
}

const saveLocalStorage = ({ value, key }:ISaveStorageItems):void => {
    if (!value) throw new Error('Param value not sent')
    if (!key) throw new Error('Param key not sent')

    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        throw new Error('Items not found')        
    } 
}

export {
    getLocalStorage,
    saveLocalStorage,
}