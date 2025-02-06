import { useState } from "react"
import { useAppKitAccount } from "@reown/appkit/react"
import useSubmitKYC from "../../hooks/KYC/useSubmitKYC"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "react-toastify"

export function KYCSubmissionForm() {
  const { address } = useAppKitAccount()
  const { submitKYC, loading, error } = useSubmitKYC()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nationality: "",
    idNumber: "",
    idImage: "",
  })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "estoken")

      const response = await fetch("https://api.cloudinary.com/v1_1/dn2ed9k6p/image/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to upload ID image")
      const data = await response.json()

      setFormData((prevState) => ({
        ...prevState,
        idImage: data.secure_url,
      }))

      toast.success("ID uploaded successfully!")
    } catch (error) {
      console.error("Error uploading ID:", error)
      toast.error("Failed to upload ID. Please try again.")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveImage = () => {
    setFormData((prevState) => ({ ...prevState, idImage: "" }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.idImage) {
      toast.error("Please upload an ID image.")
      return
    }

    if (address) {
      await submitKYC(formData.name, formData.email, formData.nationality, formData.idNumber, formData.idImage)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="nationality">Nationality</Label>
        <Input id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="idNumber">ID Number</Label>
        <Input id="idNumber" name="idNumber" value={formData.idNumber} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="idImage">Upload ID Image</Label>
        {formData.idImage ? (
          <div className="relative group w-48 h-32 border rounded-lg overflow-hidden">
            <img src={formData.idImage || "/placeholder.svg"} alt="ID Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="relative flex items-center">
            <Input id="idImage" type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
            {uploading && <Loader2 className="animate-spin text-blue-500 ml-2" />}
          </div>
        )}
        {uploading && <Progress value={uploadProgress} className="w-full mt-2" />}
      </div>

      <Button type="submit" disabled={loading || uploading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting KYC...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Submit KYC
          </>
        )}
      </Button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  )
}