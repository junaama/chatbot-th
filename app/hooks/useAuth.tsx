'use client'
import { useCallback, useEffect, useState } from "react"
import { getMe, validateToken } from "../auth/auth"
import { ReadUsersMeUsersMeGetResponse } from "../client"


const useAuth = () => {
    const [user, setUser] = useState<ReadUsersMeUsersMeGetResponse | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const loggedIn = localStorage.getItem("access_token") !== null

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem("access_token")
        if (token !== null) {
            try {
                const response = await validateToken()
                if(response){
                    const userData = await getMe()
                    setUser(userData)
                    setIsLoggedIn(true)
                } else {
                    localStorage.removeItem("access_token")
                    setIsLoggedIn(false)
                }
            } catch (error) {
                setIsLoggedIn(false)
            }
        } else {
            setIsLoggedIn(false)
        }
    }, [])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])
    
    return {
        user,
        fetchUser,
        isLoggedIn,
        loggedIn
    }
}
export default useAuth