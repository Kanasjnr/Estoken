import { useEffect, useState } from "react"
import { useAppKitAccount } from "@reown/appkit/react"
import useIsUserVerified from "../../hooks/KYC/useIsUserVerified"
import { Shield, ShieldAlert, Loader } from "lucide-react"

export function KYCStatus() {
  const { address } = useAppKitAccount()
  const { isUserVerified, loading, error } = useIsUserVerified()
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const checkVerification = async () => {
      if (address) {
        const status = await isUserVerified(address)
        setVerified(status)
      }
    }
    checkVerification()
  }, [address, isUserVerified])

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Loader className="animate-spin h-5 w-5" />
        <span>Checking KYC status...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-500">
        <ShieldAlert className="h-5 w-5" />
        <span>Error checking KYC status</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${verified ? "text-green-500" : "text-yellow-500"}`}>
      <Shield className="h-5 w-5" />
      <span>{verified ? "KYC Verified" : "KYC Not Verified"}</span>
    </div>
  )
}