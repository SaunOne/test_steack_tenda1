"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Lazy load the Chart component
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Item {
  name: string;
  amount: number;
}

interface Props {
  items: { [key: string]: Item };
}

const BarChart: React.FC<Props> = ({ items }) => {
  // Prepare data for the chart
  const categories = Object.values(items).map((item) => item.name); // Item names
  const seriesData = Object.values(items).map((item) => item.amount); // Amounts

  // Chart options
  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: 400,
          colors: "#6b7280",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: 400,
          colors: "#6b7280",
        },
        formatter: (value) => `${value}x`,
      },
    },
    fill: {
      opacity: 1,
      colors: ["#2563eb"],
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} transaksi`,
      },
    },
    grid: {
      borderColor: "#e5e7eb",
    },
  };

  const chartSeries = [
    {
      name: "Total Transaksi",
      data: seriesData,
    },
  ];

  return (
    <div>
      <h3 className="text-center text-lg font-semibold mb-4">
        Total Transaksi per Item
      </h3>
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="bar"
        height={350}
      />
    </div>
  );
};

export default BarChart;
