// import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const rentalIncomeData = [
  { id: 1, property: "Luxury Apartment", amount: "$500", date: "2023-05-01" },
  { id: 2, property: "Beach House", amount: "$350", date: "2023-05-02" },
  { id: 3, property: "Mountain Cabin", amount: "$250", date: "2023-05-03" },
]

function RentalIncome() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Rental Income</h2>
      <Card>
        <CardHeader>
          <CardTitle>Income Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentalIncomeData.map((income) => (
                <TableRow key={income.id}>
                  <TableCell>{income.property}</TableCell>
                  <TableCell>{income.amount}</TableCell>
                  <TableCell>{income.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Button>Withdraw Income</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RentalIncome

