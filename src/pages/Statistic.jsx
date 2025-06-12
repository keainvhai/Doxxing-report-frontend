import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "../styles/Statistic.css";

//规避周日无法被计算在本周的情况
dayjs.extend(isoWeek);

const API_URL = import.meta.env.VITE_API_URL;

const Statistic = () => {
  const [startDate, setStartDate] = useState(dayjs("2025-01-01").toDate());
  const [endDate, setEndDate] = useState(new Date());
  const [unit, setUnit] = useState("month");
  const [data, setData] = useState([]); //图表的数据数组
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   fetchStatistics();
  // }, []);

  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    setUnit(newUnit);

    const now = dayjs();
    // 根据 unit 设置默认时间范围
    if (newUnit === "day") {
      setStartDate(now.subtract(7, "day").toDate());
      setEndDate(now.toDate());
    } else if (newUnit === "week") {
      const start = now.startOf("week").toDate();
      const end = now.endOf("week").toDate();
      setStartDate(start);
      setEndDate(end);
    } else if (newUnit === "month") {
      const start = now.startOf("month").toDate();
      const end = now.endOf("month").toDate();
      setStartDate(start);
      setEndDate(end);
    } else if (newUnit === "year") {
      const start = now.startOf("year").toDate();
      const end = now.endOf("year").toDate();
      setStartDate(start);
      setEndDate(end);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      const start = dayjs(startDate)
        .startOf(unit === "week" ? "isoWeek" : unit) // 👈 强制 ISO 周
        .format("YYYY-MM-DD");
      const end = dayjs(endDate)
        .endOf(unit === "week" ? "isoWeek" : unit)
        .format("YYYY-MM-DD");

      const response = await axios.get(`${API_URL}/reports/statistics`, {
        params: { start, end, unit },
      });
      // setData(response.data);
      if (unit === "week") {
        const filled = fillMissingWeeks(
          response.data,
          dayjs(startDate),
          dayjs(endDate)
        );
        setData(filled);
      } else {
        setData(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  function fillMissingWeeks(data, startDate, endDate) {
    const result = [];
    const seen = new Set(data.map((d) => d.time));

    let current = dayjs(startDate).startOf("isoWeek");
    const end = dayjs(endDate).endOf("isoWeek");

    while (current.isBefore(end) || current.isSame(end)) {
      const weekKey = current.format("YYYY-MM-DD"); // 👈 eg: "2025-06-02"
      const existing = data.find((d) => d.time === weekKey);
      result.push(existing || { time: weekKey, count: 0 });
      current = current.add(1, "week");
    }

    return result;
  }

  return (
    <div className="statistic-container">
      <h2>📊 Report Statistics</h2>

      <div className="controls">
        <div>
          <label>Start Date:</label>
          {/* <DatePicker selected={startDate} onChange={setStartDate} /> */}
          <DatePicker
            openToDate={startDate}
            selected={startDate}
            onChange={setStartDate}
            showMonthYearPicker={unit === "month"}
            showYearPicker={unit === "year"}
            dateFormat={
              unit === "year"
                ? "yyyy"
                : unit === "month"
                ? "yyyy-MM"
                : "yyyy-MM-dd"
            }
          />
        </div>
        <div>
          <label>End Date:</label>
          {/* <DatePicker selected={endDate} onChange={setEndDate} /> */}
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            showMonthYearPicker={unit === "month"}
            showYearPicker={unit === "year"}
            dateFormat={
              unit === "year"
                ? "yyyy"
                : unit === "month"
                ? "yyyy-MM"
                : "yyyy-MM-dd"
            }
          />
        </div>
        <div>
          <label>Unit:</label>
          <select value={unit} onChange={handleUnitChange}>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
        <button onClick={fetchStatistics}>Show Chart</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickFormatter={(time) => dayjs(time).format("MM/DD")}
              ticks={data.map((d) => d.time)}
            />
            <YAxis />
            {/* <Tooltip /> */}
            <Tooltip
              formatter={(value, name, props) => [`${value} reports`, "Count"]}
              labelFormatter={(label) =>
                `month ${label.split("-")[1]} (${label})`
              }
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Statistic;
