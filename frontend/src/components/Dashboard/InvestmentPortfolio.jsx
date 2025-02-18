"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import useAllProperties from "../../hooks/Properties/useAllProperties"

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"]

const InvestmentPortfolio = () => {
  const { properties, loading, error } = useAllProperties()
  const [portfolio, setPortfolio] = useState([])
  const [summary, setSummary] = useState({
    totalProperties: 0,
    activeTokens: 0,
    totalAvailableShares: 0,
    totalValueLocked: 0,
    monthlyRentalIncome: 0,
  })

  useEffect(() => {
    if (Array.isArray(properties)) {
      setPortfolio(properties)

      const totalProperties = properties.length
      const activeTokens = properties.reduce((acc, property) => acc + Number(property.totalShares || 0), 0)
      const totalAvailableShares = properties.reduce((acc, property) => acc + Number(property.availableShares || 0), 0)
      const totalValueLocked = properties.reduce(
        (acc, property) => acc + Number(property.totalShares || 0) * Number.parseFloat(property.pricePerShare || 0),
        0,
      )
      const monthlyRentalIncome = properties.reduce(
        (acc, property) => acc + Number.parseFloat(property.monthlyRentalIncome || 0),
        0,
      )

      setSummary({
        totalProperties,
        activeTokens,
        totalAvailableShares,
        totalValueLocked,
        monthlyRentalIncome,
      })
    }
  }, [properties])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                <Skeleton className="h-4 w-[150px]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-[200px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-100 text-red-800 p-6">
        <CardTitle className="text-xl mb-2">Error</CardTitle>
        <CardContent>
          <p>Error loading properties: {error}</p>
        </CardContent>
      </Card>
    )
  }

  const barChartData = portfolio.map((property) => ({
    name: property.name,
    value: Number(property.totalShares),
  }))

  const pieChartData = portfolio.map((property) => ({
    name: property.name,
    value: Number.parseFloat(property.pricePerShare),
  }))

  return (
    <div className="p-6 space-y-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Investment Portfolio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          {
            title: "Total Properties",
            value: summary.totalProperties,
            color: "bg-green-500",
          },
          {
            title: "Active Tokens",
            value: summary.activeTokens.toLocaleString(),
            color: "bg-blue-500",
          },
          {
            title: "Total Available Shares",
            value: summary.totalAvailableShares.toLocaleString(),
            color: "bg-yellow-500",
          },
          {
            title: "Total Value Locked",
            value: `${summary.totalValueLocked.toFixed(2)} XFI`,
            color: "bg-purple-500",
          },
          {
            title: "Monthly Rental Income",
            value: `${summary.monthlyRentalIncome.toFixed(2)} XFI`,
            color: "bg-red-500",
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{item.value}</div>
                <div className={`h-2 w-full mt-2 rounded-full ${item.color}`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800">Token Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800">Property Value Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default InvestmentPortfolio

