import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { formatEther } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAppKitAccount } from "@reown/appkit/react";
import useClaimRentalIncome from "../hooks/useClaimRentalIncome";
import useAllProperties from "../hooks/useAllProperties";

export function RentalIncome() {
  const [rentalIncomes, setRentalIncomes] = useState([]);
  const { address, isConnected } = useAppKitAccount();
  const { claimRentalIncome, loading } = useClaimRentalIncome();
  const { properties, loading: propertiesLoading, error: propertiesError } = useAllProperties();

  useEffect(() => {
    if (properties.length > 0) {
      const incomeData = properties.map((property) => {
        const accumulatedIncome = property.accumulatedRentalIncomePerShare;
  
        let amount = "0.0";
        try {
          if (accumulatedIncome) {
            amount = formatEther(BigInt(accumulatedIncome));
          }
        } catch (error) {
          console.warn(`Invalid accumulated income for property ${property.id}:`, error);
        }
  
        let lastUpdate = "N/A";
        if (property.lastRentalUpdate) {
          try {
            const timestamp = parseInt(property.lastRentalUpdate, 10);
            if (!isNaN(timestamp)) {
              lastUpdate = new Date(timestamp * 1000).toLocaleString();
            }
          } catch (error) {
            console.warn(`Invalid date for property ${property.id}:`, error);
          }
        }
  
        return {
          id: property.id,
          propertyId: property.id,
          propertyName: property.name,
          amount,
          lastUpdate,
        };
      });
      setRentalIncomes(incomeData);
    }
  }, [properties]);
  

  const handleClaim = async (propertyId) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to claim rental income.");
      return;
    }
    try {
      const success = await claimRentalIncome(propertyId);
      if (success) {
        toast.success("Rental income claimed successfully!");
        // Optionally refresh rental income data here
      }
    } catch (err) {
      console.error("Error claiming rental income:", err);
      toast.error("Error claiming rental income.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Rental Income</h2>
      <Card>
        <CardHeader>
          <CardTitle>Your Rental Incomes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Amount (ETH)</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertiesLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading rental incomes...
                  </TableCell>
                </TableRow>
              ) : propertiesError ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-red-500">
                    Error fetching rental incomes: {propertiesError}
                  </TableCell>
                </TableRow>
              ) : rentalIncomes.length > 0 ? (
                rentalIncomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>{income.propertyName}</TableCell>
                    <TableCell>{income.amount}</TableCell>
                    <TableCell>{income.lastUpdate}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleClaim(income.propertyId)}
                        disabled={loading}
                      >
                        {loading ? "Claiming..." : "Claim"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No rental incomes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
