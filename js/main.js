"use strict";

import { apiFetch } from "../js/utils.js";

const fuelMetrics = document.getElementById("fuelMetrics");
const mmtrHistoryChart = document.getElementById("mmtrHistoryChart");
const recentTicketsTable = document.getElementById("recentTicketsTable");
const loading = document.getElementById("loading");

const loadingControl = {
  show: () => {
    if (loading) loading.style.display = "flex";
  },
  hide: () => {
    if (loading) loading.style.display = "none";
  },
};

document.addEventListener("DOMContentLoaded", async function () {
  try {
    loadingControl.show();

    const { data, error } = await apiFetch("dashboard");

    if (error) {
      console.error("Failed to load dashboard data:", error);
      return;
    }

    // Kpis
    const kpiElements = {
      ["kpi-total-tickets"]: data.kpis.total_tickets,
      ["kpi-open-tickets"]: data.kpis.open_tickets,
      ["kpi-avg-resolution-time"]: data.kpis.avg_resolution_time_hours,
      ["kpi-mttr-hours"]: data.kpis.mttr_hours,
      ["kpi-uptime-percent"]: data.kpis.uptime_percent + "%",
    };

    Object.entries(kpiElements).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) element.textContent = value;
    });

    // Recent Tickets Table
    if (recentTicketsTable) {
      const tableBody = recentTicketsTable.querySelector("tbody");
      data.open_tickets_by_department.forEach((ticket) => {
        const row = document.createElement("tr");

        const deptCell = document.createElement("td");
        deptCell.textContent = ticket.department;
        row.appendChild(deptCell);

        const countCell = document.createElement("td");
        countCell.textContent = ticket.count;
        row.appendChild(countCell);

        tableBody.appendChild(row);
      });
    }

    // Fuel Metrics
    if (fuelMetrics) {
      const totalConsumedPercent =
        (data.fuel.fuel_consumed_liters / data.fuel.fuel_capacity_liters) * 100;

      const fuelBar = document.createElement("div");
      fuelBar.style.background = "#eeeeee";
      fuelBar.style.width = "100%";
      fuelBar.style.height = "20px";
      fuelBar.style.borderRadius = "5px";
      fuelBar.style.overflow = "hidden";

      const fuelConsumedBar = document.createElement("div");
      fuelConsumedBar.style.background = "#009688";
      fuelConsumedBar.style.width = `${totalConsumedPercent}%`;
      fuelConsumedBar.style.height = "20px";

      const fuelLabel = document.createElement("div");
      fuelLabel.textContent = `Consumed: ${data.fuel.fuel_consumed_liters}L / ${data.fuel.fuel_capacity_liters}L`;
      fuelLabel.style.fontSize = "12px";
      fuelLabel.style.marginTop = "8px";

      fuelBar.appendChild(fuelConsumedBar);
      fuelMetrics.appendChild(fuelBar);
      fuelMetrics.appendChild(fuelLabel);
    }

    // MMTR History Chart
    if (mmtrHistoryChart) {
      const { mttrLabels, mttrData } = data.mttr_history.reduce(
        (acc, curr) => {
          acc.mttrLabels.push(curr.date);
          acc.mttrData.push(curr.mttr);
          return acc;
        },
        { mttrLabels: [], mttrData: [] }
      );

      const mmtrHistoryChartCtx = mmtrHistoryChart.getContext("2d");

      new Chart(mmtrHistoryChartCtx, {
        type: "bar",
        data: {
          labels: mttrLabels,
          datasets: [
            {
              label: "MMTR (Hours)",
              data: mttrData,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              labels: {
                boxWidth: 10,
                boxHeight: 10,
              },
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  } finally {
    loadingControl.hide();
  }
});
