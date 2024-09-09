import { AxiosError } from 'axios';
import { createNewChatChatPost, getChatsChatsGet, OpenAPI, getChatMessagesChatsChatIdMessagesGet, getChatChatsChatIdGet, GetChatChatsChatIdGetData, GetChatMessagesChatsChatIdMessagesGetData, createAnonymousChatAnonymousChatsPost, getAnonymousChats, getChatsByUser } from '../client';
import { request as __request } from "../client/core/request";

export const createChat = async () => {
    try {
        return await createNewChatChatPost();
    } catch (error) {
        if (error instanceof AxiosError) {
            throw error.message
        }
        throw error
    }
}
export const createAnonymousChat = async () => {
    try {
        return await createAnonymousChatAnonymousChatsPost()
    } catch (error) {
        if (error instanceof AxiosError) {
            throw error.message
        }
        throw error
    }
}
export const getAllChatsByUser = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
        throw new Error("No token found")
    }
    OpenAPI.TOKEN = async () => {
        return localStorage.getItem("access_token") || ""
    }
    try {
        console.log("inbhdtf")
        return await getChatsChatsGet();
    } catch (error) {
        if (error instanceof AxiosError) {
            throw error.message
        }
        throw error
    }
}
export const getAllAnonymousChats = async () => {

    try {
        return await getAnonymousChats();
    } catch (error) {
        if (error instanceof AxiosError) {
            throw error.message
        }
        throw error
    }
}

export const getChatById = async (data: GetChatChatsChatIdGetData) => {
    try {
        return await getChatChatsChatIdGet(data)
    } catch (error) {
        if (error instanceof AxiosError) {
            throw error.message
        }
        throw error
    }
}

export const getAllChatsByUserId = async (data: any) => {

    try {
        return await getChatsByUser({ userId: data })
    } catch (error) {
        if (error instanceof AxiosError) {
            throw error.message
        }
        throw error
    }
}

export const getMessagesByChatId = async (data: GetChatMessagesChatsChatIdMessagesGetData) => {
    try {
        return await getChatMessagesChatsChatIdMessagesGet(data)
    } catch (error) {
        if (error instanceof AxiosError) {
            throw error.message
        }
        throw error
    }
}