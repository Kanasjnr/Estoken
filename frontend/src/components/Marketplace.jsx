import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import useAllProperties from "../hooks/useAllProperties"
import useBuyTokens from "../hooks/useBuyTokens"

export function Marketplace() {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [amount, setAmount] = useState("")
  const { properties, loading: propertiesLoading } = useAllProperties()
  const { buyTokens, loading: buyLoading } = useBuyTokens()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    setOrders([
      { id: 1, propertyId: 1, type: "Buy", amount: 10, price: 0.5, total: 5 },
      { id: 2, propertyId: 2, type: "Sell", amount: 5, price: 0.6, total: 3 },
    ])
  }, [])

  const handleBuy = async () => {
    if (selectedProperty && amount) {
      await buyTokens(selectedProperty.id, amount, selectedProperty.pricePerShare)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Token Marketplace</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Buy Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Property</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  onChange={(e) =>
                    setSelectedProperty(properties.find((p) => p.id === Number.parseInt(e.target.value)))
                  }
                  disabled={propertiesLoading}
                >
                  <option value="">Select a property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Button onClick={handleBuy} disabled={buyLoading || !selectedProperty || !amount}>
                {buyLoading ? "Processing..." : "Buy Tokens"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sell Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Sell functionality to be implemented</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{properties.find((p) => p.id === order.propertyId)?.name || "Unknown"}</TableCell>
                  <TableCell>{order.type}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>{order.price} ETH</TableCell>
                  <TableCell>{order.total} ETH</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}