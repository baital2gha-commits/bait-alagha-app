// api.js - المسؤول عن الاتصال بـ Google Sheets
export const API_URL = "https://script.google.com/macros/s/AKfycbwn15TPDsuwz6Jouf5GRwyomtOd9hMcF6oC9hCGTz_i0pJL6irfP_eDsTtMDzE4cKsZbA/exec";

export async function getProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}
