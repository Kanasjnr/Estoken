"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useAppKitAccount } from "@reown/appkit/react"
import useClaimRentalIncome from "../../hooks/Properties/useClaimRentalIncome"
import useAllProperties from "../../hooks/Properties/useAllProperties"
import useCalculateRentalIncome from "../../hooks/Properties/useCalculateRentalIncome"

export function RentalIncome() {
  const [rentalIncomes, setRentalIncomes] = useState([])
  const { isConnected } = useAppKitAccount()
  const { claimRentalIncome, loading: claimLoading } = useClaimRentalIncome()
  const { calculateRentalIncome, loading: calculateLoading } = useCalculateRentalIncome()
  const { getAllProperties, loading: propertiesLoading, error: propertiesError, properties } = useAllProperties()

  const fetchProperties = useCallback(async () => {
    try {
      console.log("Fetching properties...")
      await getAllProperties()
    } catch (error) {
      console.error("Error fetching properties:", error)
      toast.error(`Error fetching properties: ${error.message}`)
    }
  }, [getAllProperties])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  useEffect(() => {
    if (properties && properties.length > 0) {
      ;(async () => {
        const incomeData = await Promise.all(
          properties.map(async (property) => {
            console.log("Processing property:", property)
            const rentalIncome = await calculateRentalIncome(property.id, 1) // Calculate for 1 share

            return {
              id: property.id,
              propertyId: property.id,
              propertyName: property.name,
              amount: rentalIncome,
              lastUpdate: property.lastRentalUpdate,
              accumulatedIncomePerShare: property.accumulatedRentalIncomePerShare,
            }
          }),
        )

        console.log("Processed rental income data:", incomeData)
        setRentalIncomes(incomeData)
      })()
    }
  }, [properties, calculateRentalIncome])

  const handleClaim = useCallback(
    async (propertyId) => {
      if (!isConnected) {
        toast.error("Please connect your wallet to claim rental income.")
        return
      }

      if (claimLoading) {
        toast.info("Please wait while rental income is being claimed.")
        return
      }

      try {
        console.log(`Claiming rental income for property ${propertyId}...`)
        const transactionHash = await claimRentalIncome(propertyId)
        if (transactionHash) {
          console.log("Claim transaction hash:", transactionHash)
          toast.success(`Rental income claimed! TX: ${transactionHash}`)
          fetchProperties() // Refresh properties after claiming
        }
      } catch (err) {
        console.error("Error claiming rental income:", err)
        // Error handling is done in the hook, so we don't need to do anything here
      }
    },
    [isConnected, claimLoading, claimRentalIncome, fetchProperties],
  )

  const memoizedRentalIncomes = useMemo(() => rentalIncomes, [rentalIncomes])

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
                <TableHead className="text-gray-600">Claimable Amount (XFI)</TableHead>
                <TableHead className="text-gray-600">Last Update</TableHead>
                <TableHead className="text-gray-600">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertiesLoading || calculateLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-600">
                    Loading properties and rental incomes...
                  </TableCell>
                </TableRow>
              ) : propertiesError ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-red-500">
                    Error: {propertiesError}
                  </TableCell>
                </TableRow>
              ) : memoizedRentalIncomes.length > 0 ? (
                memoizedRentalIncomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell className="font-medium text-gray-800">{income.propertyName}</TableCell>
                    <TableCell className="text-gray-600">{income.amount} XFI</TableCell>
                    <TableCell className="text-gray-600">{income.lastUpdate}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleClaim(income.propertyId)}
                        disabled={claimLoading || Number.parseFloat(income.amount) === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {claimLoading ? "Claiming..." : "Claim"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-600">
                    No rental incomes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default React.memo(RentalIncome)

