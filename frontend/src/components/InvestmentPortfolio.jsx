import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import useAllProperties from "../hooks/useAllProperties";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const InvestmentPortfolio = () => {
  const { properties, loading, error } = useAllProperties();
  const [portfolio, setPortfolio] = useState([]);
  const [rentalLogs, setRentalLogs] = useState([]);
  const [summary, setSummary] = useState({
    totalProperties: 0,
    activeTokens: 0,
    totalValueLocked: 0,
    monthlyIncome: 0,
  });

  useEffect(() => {
    if (Array.isArray(properties)) {
      setPortfolio(properties);

      const totalProperties = properties.length;
      const activeTokens = properties.reduce(
        (acc, property) => acc + Number(property.totalShares || 0),
        0
      );
      const totalValueLocked = properties.reduce(
        (acc, property) =>
          acc + Number(property.totalShares || 0) * parseFloat(property.pricePerShare || 0),
        0
      );
      const monthlyIncome = properties.reduce(
        (acc, property) =>
          acc + Number(property.accumulatedRentalIncomePerShare || 0) * Number(property.totalShares || 0),
        0
      );

      setSummary({
        totalProperties,
        activeTokens,
        totalValueLocked,
        monthlyIncome,
      });

      const rentalIncomeData = properties.map((property) => ({
        id: property.id,
        name: property.name,
        rentalIncomeLogs: property.rentalIncomeLogs || [],
      }));
      setRentalLogs(rentalIncomeData);
    }
  }, [properties]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-xl font-medium text-blue-600">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return <p>Error loading properties: {error}</p>;
  }

  const barChartData = portfolio.map((property) => ({
    name: property.name,
    value: Number(property.totalShares),
  }));

  const pieChartData = portfolio.map((property) => ({
    name: property.name,
    value: Number(property.pricePerShare),
  }));

  const lineChartData = portfolio.map((property, index) => ({
    name: `Property ${index + 1}`,
    value: Number(property.accumulatedRentalIncomePerShare || 0),
  }));

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Properties", value: summary.totalProperties },
          { title: "Active Tokens", value: summary.activeTokens.toLocaleString() },
          { title: "Total Value Locked", value: `$${summary.totalValueLocked.toFixed(2)}ETH` },
          { title: "Monthly Rental Income", value: `$${summary.monthlyIncome.toFixed(2)}ETH` },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center text-center"
          >
            <h3 className="text-xl font-semibold text-gray-700">{item.title}</h3>
            <p className="text-4xl font-bold text-blue-600 mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Token Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Property Value Distribution</h3>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Rental Income Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default InvestmentPortfolio;
