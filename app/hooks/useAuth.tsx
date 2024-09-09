'use client'
import { useCallback, useEffect, useState } from "react"
import { getMe, validateToken } from "../auth/auth"
import { ReadUsersMeUsersMeGetResponse } from "../client"

const useAuth = () => {
    const [user, setUser] = useState<ReadUsersMeUsersMeGetResponse | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [token, setToken] = useState<string | null>(typeof window !== undefined ? localStorage.getItem("access_token") : "")

    const fetchUser = useCallback(async () => {
        const storedToken = localStorage.getItem("access_token");
        if (storedToken) {
            try {
                const response = await validateToken();
                if (response) {
                    const userData = await getMe();
                    setUser(userData);
                    setIsLoggedIn(true);
                } else {
                    localStorage.removeItem("access_token");
                    setIsLoggedIn(false);
                }
            } catch (error) {
                setIsLoggedIn(false);
            }
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("chatId")
        setIsLoggedIn(false)
        setToken("")
    };
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        const storedToken = localStorage.getItem("access_token");
        if (storedToken !== token) {
            setToken(storedToken);
        }
    }, [token]);

    useEffect(() => {
        const handleStorageChange = () => {
            const storedToken = localStorage.getItem("access_token");
            setToken(storedToken);
            if (storedToken) {
                fetchUser();
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [fetchUser]);

    return {
        user,
        fetchUser,
        isLoggedIn,
        logout,
    };
}

export default useAuth;
