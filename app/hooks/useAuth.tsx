'use client'
import { useCallback, useEffect, useState } from "react"
import { getMe } from "../auth/auth"
import { ReadUsersMeUsersMeGetResponse } from "../client"

const isLoggedIn = () => {
    return localStorage.getItem("access_token") !== null
}

const useAuth = () => {
    const [user, setUser] = useState<ReadUsersMeUsersMeGetResponse | null>(null)

    const fetchUser = useCallback(async () => {

        if (isLoggedIn()) {
            const userData = await getMe()
            setUser(userData)

        }
    }, [])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])
    
    return {
        user
    }
}
export {isLoggedIn}
export default useAuth