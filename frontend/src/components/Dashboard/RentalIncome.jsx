import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { ethers } from "ethers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppKitAccount } from "@reown/appkit/react"
import useClaimRentalIncome from "../../hooks/useClaimRentalIncome"
import useAllProperties from "../../hooks/useAllProperties"

export function RentalIncome() {
  const [rentalIncomes, setRentalIncomes] = useState([])
  const [claimError, setClaimError] = useState(null)
  const {  isConnected } = useAppKitAccount()
  const { claimRentalIncome, loading: claimLoading } = useClaimRentalIncome()
  const { properties, loading: propertiesLoading, error: propertiesError } = useAllProperties()

  useEffect(() => {
    if (properties.length > 0) {
      const incomeData = properties.map((property) => {
        const accumulatedIncome = property.accumulatedRentalIncomePerShare

        let amount = "0.0"
        try {
          if (accumulatedIncome && accumulatedIncome !== "0") {
            const bigNumberIncome = ethers.parseUnits(accumulatedIncome.toString(), 18)
            amount = ethers.formatUnits(bigNumberIncome, 18)
          }
        } catch (error) {
          console.warn(`Invalid accumulated income for property ${property.id}:`, error)
        }

        let lastUpdate = "N/A"
        if (property.lastRentalUpdate) {
          try {
            const timestamp = Number(property.lastRentalUpdate)
            if (!isNaN(timestamp)) {
              lastUpdate = new Date(timestamp * 1000).toLocaleString()
            }
          } catch (error) {
            console.warn(`Invalid date for property ${property.id}:`, error)
          }
        }

        return {
          id: property.id,
          propertyId: property.id,
          propertyName: property.name,
          amount,
          lastUpdate,
        }
      })
      setRentalIncomes(incomeData)
    }
  }, [properties])

  const handleClaim = async (propertyId) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to claim rental income.")
      return
    }
    setClaimError(null)
    try {
      const success = await claimRentalIncome(propertyId)
      if (success) {
        // Optionally refresh rental income data here
        // For example, you could call a function to update the rental incomes
        // updateRentalIncomes();
      }
    } catch (err) {
      console.error("Error claiming rental income:", err)
      setClaimError(`Error claiming rental income: ${err.message || err}`)
    }
  }

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      <motion.h2
        className="text-3xl font-bold text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Rental Income
      </motion.h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Your Rental Incomes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-600">Property</TableHead>
                <TableHead className="text-gray-600">Amount (ETH)</TableHead>
                <TableHead className="text-gray-600">Last Update</TableHead>
                <TableHead className="text-gray-600">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertiesLoading ? (
                [...Array(3)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-[100px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : propertiesError ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-red-500">
                    Error fetching rental incomes: {propertiesError}
                  </TableCell>
                </TableRow>
              ) : rentalIncomes.length > 0 ? (
                rentalIncomes.map((income, index) => (
                  <motion.tr
                    key={income.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <TableCell className="font-medium text-gray-800">{income.propertyName}</TableCell>
                    <TableCell className="text-gray-600">{Number.parseFloat(income.amount).toFixed(6)} ETH</TableCell>
                    <TableCell className="text-gray-600">{income.lastUpdate}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleClaim(income.propertyId)}
                        disabled={claimLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {claimLoading ? "Claiming..." : "Claim"}
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-600">
                    No rental incomes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {claimError && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{claimError}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RentalIncome

