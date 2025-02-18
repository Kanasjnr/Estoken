import { useState, useEffect } from "react"
import useVerifyKYC from "../../hooks/KYC/useVerifyKYC"
import useGetPendingVerifications from "../../hooks/KYC/useGetPendingVerifications"
import useGetUserKYCDetails from "../../hooks/KYC/useGetUserKYCDetails"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader } from "lucide-react"

export function KYCVerificationList() {
  const [pendingKYCs, setPendingKYCs] = useState([])
  const [loading, setLoading] = useState(true)
  const { verifyKYC, loading: verifyLoading, error: verifyError } = useVerifyKYC()
  const { getPendingVerifications, loading: getPendingLoading, error: getPendingError } = useGetPendingVerifications()
  const { getUserKYCDetails, loading: getDetailsLoading, error: getDetailsError } = useGetUserKYCDetails()

  useEffect(() => {
    const loadPendingKYCs = async () => {
        try {
            console.log("Fetching pending KYCs...");
            const pendingAddresses = await getPendingVerifications();
            console.log("Pending addresses:", pendingAddresses);
      
            if (!pendingAddresses || !Array.isArray(pendingAddresses)) {
              throw new Error("Invalid response from getPendingVerifications()");
            }
            const detailedKYCs = await Promise.all(
                pendingAddresses.map(async (address) => {
                  console.log("Fetching KYC details for:", address);
                  const details = await getUserKYCDetails(address);
                  console.log(`Details for ${address}:`, details);
                  return { address, ...details };
                })
              );
        
              setPendingKYCs(detailedKYCs);
            } catch (error) {
              console.error("Error loading pending KYCs:", error);
            } finally {
              setLoading(false);
            }
    }
    loadPendingKYCs()
  }, [getPendingVerifications, getUserKYCDetails])

  const handleVerify = async (address, status) => {
    await verifyKYC(address, status)
    // After verification, refresh the list
    setPendingKYCs(pendingKYCs.filter((kyc) => kyc.address !== address))
  }

  if (loading || getPendingLoading || getDetailsLoading) {
    return (
      <div className="flex justify-center">
        <Loader className="animate-spin h-8 w-8" />
      </div>
    )
  }

 

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending KYC Verifications</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Nationality</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingKYCs.map((kyc) => (
            <TableRow key={kyc.address}>
              <TableCell>{kyc.address}</TableCell>
              <TableCell>{kyc.name}</TableCell>
              <TableCell>{kyc.nationality}</TableCell>
              <TableCell>
                <Button onClick={() => handleVerify(kyc.address, true)} disabled={verifyLoading} className="mr-2">
                  Approve
                </Button>
                <Button onClick={() => handleVerify(kyc.address, false)} disabled={verifyLoading} variant="destructive">
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {verifyError && <p className="text-red-500 mt-2">{verifyError}</p>}
    </div>
  )
}