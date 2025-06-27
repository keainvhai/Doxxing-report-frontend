import React, { useState } from "react";
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

dayjs.extend(isoWeek);

const API_URL = import.meta.env.VITE_API_URL;

const TimeChart = () => {
  const [startDate, setStartDate] = useState(dayjs("2025-01-01").toDate());
  const [endDate, setEndDate] = useState(new Date());
  const [unit, setUnit] = useState("month");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    setUnit(newUnit);
    const now = dayjs();
    if (newUnit === "day") {
      setStartDate(now.subtract(7, "day").toDate());
      setEndDate(now.toDate());
    } else if (newUnit === "week") {
      setStartDate(now.startOf("week").toDate());
      setEndDate(now.endOf("week").toDate());
    } else if (newUnit === "month") {
      setStartDate(now.startOf("month").toDate());
      setEndDate(now.endOf("month").toDate());
    } else if (newUnit === "year") {
      setStartDate(now.startOf("year").toDate());
      setEndDate(now.endOf("year").toDate());
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const start = dayjs(startDate)
        .startOf(unit === "week" ? "isoWeek" : unit)
        .format("YYYY-MM-DD");
      const end = dayjs(endDate)
        .endOf(unit === "week" ? "isoWeek" : unit)
        .format("YYYY-MM-DD");
      const res = await axios.get(`${API_URL}/reports/time-statistics`, {
        params: { start, end, unit },
      });

      if (unit === "week") {
        const filled = fillMissingWeeks(
          res.data,
          dayjs(startDate),
          dayjs(endDate)
        );
        setData(filled);
      } else {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  function fillMissingWeeks(data, startDate, endDate) {
    const result = [];
    let current = dayjs(startDate).startOf("isoWeek");
    const end = dayjs(endDate).endOf("isoWeek");
    while (current.isBefore(end) || current.isSame(end)) {
      const key = current.format("YYYY-MM-DD");
      const existing = data.find((d) => d.time === key);
      result.push(existing || { time: key, count: 0 });
      current = current.add(1, "week");
    }
    return result;
  }

  return (
    <div>
      <div className="controls">
        <div>
          <label>Start Date:</label>
          <DatePicker
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
              tickFormatter={(time) =>
                unit === "year"
                  ? time
                  : unit === "month"
                  ? dayjs(time).format("YYYY-MM")
                  : dayjs(time).format("MM/DD")
              }
              ticks={data.map((d) => d.time)}
            />
            <YAxis />
            <Tooltip
              formatter={(value) => [`${value} reports`, "Count"]}
              labelFormatter={(label) => {
                if (unit === "year") return `Year ${label}`;
                if (unit === "month") return `Month ${label}`;
                if (unit === "week")
                  return `Week of ${dayjs(label).format("MM/DD")}`;
                return `Date ${dayjs(label).format("MM/DD")}`;
              }}
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

export default TimeChart;
