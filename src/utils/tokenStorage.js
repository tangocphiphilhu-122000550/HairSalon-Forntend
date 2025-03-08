import { openDB } from 'idb';

const DB_NAME = 'HaircutApp';
const STORE_NAME = 'auth';
const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

// Khởi tạo hoặc mở IndexedDB
const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            // Tạo object store nếu chưa tồn tại
            db.createObjectStore(STORE_NAME);
        },
    });
};

// Lưu token
export const setToken = async (token) => {
    const db = await initDB();
    await db.put(STORE_NAME, token, TOKEN_KEY);
};

// Lấy token
export const getToken = async () => {
    const db = await initDB();
    return await db.get(STORE_NAME, TOKEN_KEY);
};

// Xóa token
export const clearToken = async () => {
    const db = await initDB();
    await db.delete(STORE_NAME, TOKEN_KEY);
};

// Lưu username
export const setUsername = async (username) => {
    const db = await initDB();
    await db.put(STORE_NAME, username, USERNAME_KEY);
};

// Lấy username
export const getUsername = async () => {
    const db = await initDB();
    return await db.get(STORE_NAME, USERNAME_KEY);
};

// Xóa username
export const clearUsername = async () => {
    const db = await initDB();
    await db.delete(STORE_NAME, USERNAME_KEY);
};