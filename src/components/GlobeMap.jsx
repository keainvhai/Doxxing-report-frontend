import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css"; // ✅ 引入 Mapbox CSS
import "../styles/GlobeMap.css";
import { locationOverrides } from "../helpers/locationOverrides";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function GlobeMap({ data }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popupRef = useRef(
    new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
  );

  // const normalizeLocation = (d) => {
  //   // 如果已有 city/state 字段，直接使用
  //   const city = d.city || "";
  //   const state = d.state || "";
  //   let country = d.country;

  //   // 处理异常缩写或错误国家名
  //   if (["D.C.", "IL", "KR", "SG"].includes(country)) {
  //     if (country === "D.C.") {
  //       country = "United States";
  //     } else if (country === "IL") {
  //       country = "United States";
  //     } else if (country === "KR") {
  //       country = "South Korea";
  //     } else if (country === "SG") {
  //       country = "Singapore";
  //     }
  //   }

  //   return {
  //     ...d,
  //     city,
  //     state,
  //     country,
  //     label: city || state || country,
  //   };
  // };

  const getGeoJSONFromData = (data) => {
    const grouped = {};

    const getNormalizedName = (loc) =>
      locationOverrides[loc]?.normalized || loc;

    data.forEach((d) => {
      const key = getNormalizedName(d.location);
      const override = locationOverrides[d.location];
      const lat = override?.lat || d.lat;
      const lng = override?.lng || d.lng;

      if (!lat || !lng || lat === 0 || lng === 0 || key === "Unknown") return;

      if (!grouped[key]) {
        grouped[key] = {
          location: key,
          count: 0,
          lat,
          lng,
          city: d.city ?? null,
          state: d.state ?? null,
          country: d.country ?? null,
        };
      }

      grouped[key].count += d.count;
    });

    return {
      type: "FeatureCollection",
      features: Object.values(grouped).map((d) => ({
        type: "Feature",
        properties: {
          location: d.location,
          count: d.count,
          label: d.location,
          city: d.city,
          state: d.state,
          country: d.country,
        },
        geometry: {
          type: "Point",
          coordinates: [d.lng, d.lat],
        },
      })),
    };
  };

  // 初始化地图
  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [0, 20],
        zoom: 1.5,
        projection: "globe",
      });

      map.current.on("style.load", () => {
        map.current.setFog({});
        // 🌐 样式加载完成后可以安全添加图层
        if (data && data.length > 0) {
          addLabelLayer(data);
        }
      });
    }
  }, []);

  // 当 data 更新时动态更新图层
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      addLabelLayer(data);
    } else {
      // 等待 style 加载完后再更新
      map.current?.once("style.load", () => {
        addLabelLayer(data);
      });
    }
  }, [data]);

  const addLabelLayer = (data) => {
    const geojson = getGeoJSONFromData(data);
    // console.log("✅ GeoJSON Features:", geojson.features);

    if (map.current.getSource("victim-labels")) {
      map.current.getSource("victim-labels").setData(geojson);
    } else {
      map.current.addSource("victim-labels", {
        type: "geojson",
        data: geojson,
      });

      map.current.addLayer({
        id: "victim-count-labels",
        type: "symbol",
        source: "victim-labels",
        layout: {
          "text-field": ["get", "label"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["get", "count"],
            1,
            10,
            10,
            14,
            100,
            20,
          ],
          "text-anchor": "top",
          "text-allow-overlap": false, // ✅ 标签不重叠
          "text-font": ["Open Sans Bold"],
        },
        paint: {
          "text-color": "#1e90ff", // 蓝色
          // 删除 halo 设置
        },
      });
      map.current.off("click", "victim-count-labels");

      // ✅ 鼠标悬浮显示 tooltip
      map.current.on("mouseenter", "victim-count-labels", (e) => {
        map.current.getCanvas().style.cursor = "pointer";

        const coordinates = e.features[0].geometry.coordinates.slice();
        const { country, count } = e.features[0].properties;

        popupRef.current
          .setLngLat(coordinates)
          .setHTML(
            `
  <strong>${e.features[0].properties.label}</strong><br/>
  ${
    e.features[0].properties.city
      ? `City: ${e.features[0].properties.city}<br/>`
      : ""
  }
  ${
    e.features[0].properties.state
      ? `State: ${e.features[0].properties.state}<br/>`
      : ""
  }
  Reports: ${e.features[0].properties.count}
`
          )
          .addTo(map.current);
      });

      map.current.on("mouseleave", "victim-count-labels", () => {
        map.current.getCanvas().style.cursor = "";
        popupRef.current.remove();
      });

      // ✅ 点击跳转到搜索页面
      // map.current.on("click", "victim-count-labels", (e) => {
      //   const country = e.features[0].properties.country;
      //   window.location.href = `/search?country=${encodeURIComponent(country)}`;
      // });
      map.current.on("click", "victim-count-labels", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const zoomLevel = 5; // 你可以调整放大等级，比如 4~8 之间

        map.current.flyTo({
          center: coordinates,
          zoom: zoomLevel,
          speed: 1.5, // 飞行速度，越大越快
          curve: 1.2, // 趋势，1-1.5 通常比较自然
          easing: (t) => t,
          essential: true,
        });
      });
    }
  };

  return <div ref={mapContainer} className="mapbox-globe-container" />;
}

export default GlobeMap;
