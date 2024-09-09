import { AxiosError } from 'axios';
import { UserCreate, registerRegisterPost, OpenAPI, readUsersMeUsersMeGet, LoginLoginPostData, loginLoginPost, validateTokenValidateTokenGet } from '../client';


export const signUp = async (data: UserCreate) => {
    try {
        await registerRegisterPost({ requestBody: data })

    } catch (err: any) {
        let errDetail = err

        if (err instanceof AxiosError) {
            errDetail = err.message
        }
        console.log("Something went wrong:", errDetail)
        throw errDetail as string
    }
}

export const login = async (data: LoginLoginPostData) => {
    try {
        const response = await loginLoginPost(data) as any
        localStorage.setItem("access_token", response.access_token)
        window.location.reload();
    } catch (err: any) {
        let errDetail = err

        if (err instanceof AxiosError) {
            errDetail = err.message
        }

        if (Array.isArray(errDetail)) {
            errDetail = "Something went wrong"
        }
        console.log("error: ", errDetail)
        throw errDetail as string
        
    }
}

export const getMe = async () => {
    const token = localStorage.getItem("access_token")
    if(!token) {
        throw new Error("No token found")
    }
    OpenAPI.TOKEN = async () => {
        return localStorage.getItem("access_token") || ""
    }
    try {
        const userData = await readUsersMeUsersMeGet()
        return userData
    } catch (error) {
        console.log('error', error)
        throw error as string
    }
};

export const validateToken = async () => {
    const token = localStorage.getItem("access_token")
    if(!token) {
        throw new Error("No token found")
    }
    OpenAPI.TOKEN = token
    try {
        return await validateTokenValidateTokenGet()
    } catch (error) {
        localStorage.removeItem("access_token")
        if (error instanceof AxiosError) {
            throw error.message
        }
        throw error as string
    }
}