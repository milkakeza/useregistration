"use client"

import { useState, type FormEvent, type ChangeEvent } from "react"
import { Fragment } from "react"
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { supabase } from "../../lib/supabase"

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Signup validation
    if (!isLoginMode && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    setLoading(true)

    try {
      let data, error

      if (isLoginMode) {
        // Login
        ;({ data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        }))
      } else {
        // Signup with email confirmation
        ;({ data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        }))
      }

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          alert("Please check your email and click the confirmation link before logging in.")
        } else {
          alert(error.message)
        }
      } else {
        if (isLoginMode) {
          alert("Login successful!")
          // The auth state change in App.tsx will automatically redirect to dashboard
        } else {
          alert("Please check your email for the verification link!")
        }
        console.log("Supabase response:", data)
      }
    } catch (error) {
      alert("Something went wrong. Please try again.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Fragment>
      <div className="flex justify-center items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        <div className="bg-white flex flex-col rounded-xl w-[500px] p-8 shadow-lg">
          <div>
            <div className="flex flex-col">
              <div className="flex justify-center mb-4">
                <h2 className="text-3xl font-semibold text-center text-black">{isLoginMode ? "Login" : "SignUp"}</h2>
              </div>
              {/* Tab controls */}
              <div className="relative flex justify-between h-12 w-[300px] mb-6 border border-gray-300 rounded-full overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsLoginMode(true)}
                  className={`w-1/2 bg-transparent text-lg font-medium transition-all z-10 ${
                    isLoginMode ? "text-white" : "text-black"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsLoginMode(false)}
                  className={`w-1/2 bg-transparent text-lg font-medium transition-all z-10 ${
                    !isLoginMode ? "text-white" : "text-black"
                  }`}
                >
                  SignUp
                </button>
                <div
                  className={`absolute top-0 h-full w-1/2 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 transition-all duration-300 ease-in-out z-0 pointer-events-none ${
                    isLoginMode ? "left-0" : "left-1/2"
                  }`}
                >
                  &nbsp;
                </div>
              </div>
            </div>
          </div>
          {/* Form section */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  value={formData.name}
                  name="name"
                  onChange={handleChange}
                  type="text"
                  placeholder="Name"
                  required
                  className="w-full text-[1rem] p-3 pl-12 border-b-2 border-gray-300 outline-none focus:border-blue-500 placeholder-gray-400"
                />
              </div>
            )}
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  value={formData.email}
                  name="email"
                  onChange={handleChange}
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full text-[1rem] p-3 pl-12 border-b-2 border-gray-300 outline-none focus:border-blue-500 placeholder-gray-400"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  value={formData.password}
                  name="password"
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  required
                  className="w-full text-[1rem] p-3 pl-12 pr-12 border-b-2 border-gray-300 outline-none focus:border-blue-500 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {!isLoginMode && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  value={formData.confirmPassword}
                  name="confirmPassword"
                  onChange={handleChange}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  required
                  className="w-full text-[1rem] p-3 pl-12 pr-12 border-b-2 border-gray-300 outline-none focus:border-blue-500 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            )}
            {isLoginMode && (
              <div className="flex justify-end">
                <a
                  className="text-black text-[15px] hover:underline font-semibold"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </a>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 text-[1rem] bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              {loading ? "Loading..." : isLoginMode ? "Login" : "Sign Up"}
            </button>
            <div>
              {isLoginMode ? "Don't have an account?" : "Already have an account?"}{" "}
              <a
                className="ml-2 hover:text-blue-600 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  setIsLoginMode(!isLoginMode)
                }}
              >
                {isLoginMode ? "Signup now" : "Login"}
              </a>
            </div>
          </form>
        </div>
      </div>
    </Fragment>
  )
}

export default Login
