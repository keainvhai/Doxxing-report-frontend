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
import GlobeMap from "../components/GlobeMap";
import "../styles/Statistic.css";
import PlatformChart from "../components/PlatformChart";
import TimeChart from "../components/TimeChart";

//规避周日无法被计算在本周的情况
dayjs.extend(isoWeek);

const API_URL = import.meta.env.VITE_API_URL;

const Statistic = () => {
  const [locationData, setLocationData] = useState([]);

  // useEffect(() => {
  //   fetchStatistics();
  // }, []);
  useEffect(() => {
    fetchLocationSummary();
  }, []);

  const fetchLocationSummary = async () => {
    try {
      const res = await axios.get(`${API_URL}/reports/location-statistics`);
      setLocationData(res.data);
    } catch (err) {
      console.error("location data error:", err);
    }
  };

  return (
    <div className="statistic-container">
      <h2>Report Statistics</h2>
      <h3>Time Chart</h3>
      <TimeChart />

      <h3>Victim Location Map</h3>
      {locationData.length > 0 ? (
        <GlobeMap data={locationData} />
      ) : (
        <p>No location data yet.</p>
      )}

      {/* <h3 style={{ marginTop: "2rem" }}>Platform Distribution</h3> */}
      <PlatformChart />
    </div>
  );
};

export default Statistic;
