import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 200 },
  { name: 'Apr', value: 278 },
  { name: 'May', value: 189 },
]

function DashboardContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">15</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">5,678</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Value Locked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">$9.87M</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Rental Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">$45.2K</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Token Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardContent

