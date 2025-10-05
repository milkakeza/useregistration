"use client"

import { useState, type FormEvent, type ChangeEvent } from "react"
import { Fragment } from "react"
import { User, Mail, Lock, Eye, EyeOff, CreditCard } from "lucide-react"
import { supabase } from "../../lib/supabase"
import { Toaster, toast } from "react-hot-toast"
import { userApi } from "../../lib/api"

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  idNumber: string
}

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    idNumber: "",
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

  function handleIdNumberInput(event: FormEvent<HTMLInputElement>) {
    const input = event.currentTarget
    let value = input.value.replace(/\D/g, "")
    if (value.length > 16) {
      value = value.slice(0, 16)
    }
    input.value = value

    // Update form data
    setFormData((prevFormData) => ({
      ...prevFormData,
      idNumber: value,
    }))

    // Set custom validation message
    if (value.length > 0 && value.length !== 16) {
      input.setCustomValidity("ID number must be exactly 16 digits")
    } else {
      input.setCustomValidity("")
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Signup validation
    if (!isLoginMode) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!", {
          duration: 3000,
          style: {
            background: "#ef4444",
            color: "#fff",
            fontWeight: "bold",
          },
        })
        return
      }

      if (formData.idNumber.length !== 16) {
        toast.error("ID number must be exactly 16 digits!", {
          duration: 3000,
          style: {
            background: "#ef4444",
            color: "#fff",
            fontWeight: "bold",
          },
        })
        return
      }

      try {
        console.log("[v0] Validating national ID:", formData.idNumber)
        const validationResponse = await userApi.validateUserByNationalId(formData.idNumber)
        console.log("[v0] Validation response:", validationResponse)

        if (validationResponse.status !== "success") {
          toast.error("National ID not found in our system. Please contact administrator.", {
            duration: 5000,
            style: {
              background: "#ef4444",
              color: "#fff",
              fontWeight: "bold",
            },
          })
          return
        }
      } catch (error) {
        console.error("[v0] National ID validation failed:", error)
        toast.error("National ID not found in our system. Please contact administrator.", {
          duration: 5000,
          style: {
            background: "#ef4444",
            color: "#fff",
            fontWeight: "bold",
          },
        })
        return
      }
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
        console.log("[v0] Starting signup process with data:", {
          email: formData.email,
          name: formData.name,
          idNumber: formData.idNumber,
        })

        // Signup
        ;({ data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: formData.name,
              id_number: formData.idNumber,
            },
          },
        }))

        console.log("[v0] Signup response:", { data, error })

        if (!error && data.user) {
          console.log("[v0] User created successfully, user ID:", data.user.id)

          await new Promise((resolve) => setTimeout(resolve, 1000))

          console.log("[v0] Creating profile with data:", {
            id: data.user.id,
            email: formData.email,
            full_name: formData.name,
            national_id: formData.idNumber,
            role: "user",
          })

          // Create profile record in the profiles table
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              email: formData.email,
              full_name: formData.name,
              national_id: formData.idNumber,
              role: "user",
            })
            .select()

          console.log("[v0] Profile creation response:", { profileData, profileError })

          if (profileError) {
            console.error("[v0] Profile creation failed:", profileError)
            if (profileError.code === "23505") {
              // Unique constraint violation - profile might already exist
              toast.error("Profile already exists for this user.", {
                duration: 3000,
                style: {
                  background: "#f59e0b",
                  color: "#fff",
                  fontWeight: "bold",
                },
              })
            } else {
              toast.error(`Profile creation failed: ${profileError.message}`, {
                duration: 5000,
                style: {
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: "bold",
                },
              })
            }
          } else {
            console.log("[v0] Profile created successfully")
            toast.success("Account and profile created successfully!", {
              duration: 3000,
              style: {
                background: "#10b981",
                color: "#fff",
                fontWeight: "bold",
              },
            })
          }
        }
      }

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast.error("Please check your email and click the confirmation link before logging in.", {
            duration: 5000,
            style: {
              background: "#f59e0b",
              color: "#fff",
              fontWeight: "bold",
            },
          })
        } else {
          toast.error(error.message, {
            duration: 4000,
            style: {
              background: "#ef4444",
              color: "#fff",
              fontWeight: "bold",
            },
          })
        }
      } else {
        if (isLoginMode) {
          toast.success("Login successful!", {
            duration: 3000,
            style: {
              background: "#10b981",
              color: "#fff",
              fontWeight: "bold",
            },
          })
          // The auth state change in App.tsx will automatically redirect to dashboard

          // Optional: redirect after a short delay
          setTimeout(() => {
            // Your redirect logic, e.g., router.push("/dashboard")
          }, 1500)
        } else {
          toast.success("Please check your email for the verification link!", {
            duration: 5000,
            style: {
              background: "#10b981",
              color: "#fff",
              fontWeight: "bold",
            },
          })
        }
        console.log("Supabase response:", data)
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.", {
        duration: 4000,
        style: {
          background: "#ef4444",
          color: "#fff",
          fontWeight: "bold",
        },
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Fragment>
      <div className="flex justify-center items-center bg-slate-800 min-h-screen">
        <div className="bg-white flex flex-col rounded-xl w-[500px] p-8 shadow-lg">
          <div>
            <div className="flex flex-col">
              <div className="flex justify-center mb-4">
                <h2 className="text-3xl font-semibold text-center text-slate-800">
                  {isLoginMode ? "Login" : "SignUp"}
                </h2>
              </div>
              {/* Tab controls */}
              <div className="relative flex justify-between h-12 w-[300px] mb-6 border border-slate-300 rounded-full overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsLoginMode(true)}
                  className={`w-1/2 bg-transparent text-lg font-medium transition-all z-10 ${
                    isLoginMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsLoginMode(false)}
                  className={`w-1/2 bg-transparent text-lg font-medium transition-all z-10 ${
                    !isLoginMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  SignUp
                </button>
                <div
                  className={`absolute top-0 h-full w-1/2 rounded-full bg-amber-500 transition-all duration-300 ease-in-out z-0 pointer-events-none ${
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
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  value={formData.name}
                  name="name"
                  onChange={handleChange}
                  type="text"
                  placeholder="Name"
                  required
                  className="w-full text-[1rem] p-3 pl-12 border-b-2 border-slate-300 outline-none focus:border-emerald-500 placeholder-slate-400"
                />
              </div>
            )}
            {!isLoginMode && (
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  value={formData.idNumber}
                  name="idNumber"
                  onInput={handleIdNumberInput}
                  type="text"
                  placeholder="16-digit ID number"
                  required
                  pattern="^[0-9]{16}$"
                  title="ID number must be exactly 16 digits"
                  minLength={16}
                  maxLength={16}
                  className="w-full text-[1rem] p-3 pl-12 border-b-2 border-slate-300 outline-none focus:border-emerald-500 placeholder-slate-400"
                />
              </div>
            )}
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  value={formData.email}
                  name="email"
                  onChange={handleChange}
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full text-[1rem] p-3 pl-12 border-b-2 border-slate-300 outline-none focus:border-emerald-500 placeholder-slate-400"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  value={formData.password}
                  name="password"
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  required
                  className="w-full text-[1rem] p-3 pl-12 pr-12 border-b-2 border-slate-300 outline-none focus:border-emerald-500 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {!isLoginMode && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  value={formData.confirmPassword}
                  name="confirmPassword"
                  onChange={handleChange}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  required
                  className="w-full text-[1rem] p-3 pl-12 pr-12 border-b-2 border-slate-300 outline-none focus:border-emerald-500 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            )}
            {isLoginMode && (
              <div className="flex justify-end">
                <a
                  className="text-slate-800 text-[15px] hover:underline font-semibold"
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
              className="w-full p-3 text-[1rem] bg-amber-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition-all duration-200"
            >
              {loading ? "Loading..." : isLoginMode ? "Login" : "Sign Up"}
            </button>
            <div>
              {isLoginMode ? "Don't have an account?" : "Already have an account?"}{" "}
              <a
                className="ml-2 hover:text-emerald-600 cursor-pointer"
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
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </Fragment>
  )
}

export default Login
