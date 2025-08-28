import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUsers, setAuthUsers] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUsers(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Auth check failed");
    }
  };

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUsers(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUsers(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["token"];
    toast.success("Logged out successfully");
    if (socket) socket.disconnect();
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUsers(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  const connectSocket = (userData) => {
    if (!userData) return;

    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      checkAuth();
    }
  }, []);

  const value = {
    axios,
    authUsers,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
