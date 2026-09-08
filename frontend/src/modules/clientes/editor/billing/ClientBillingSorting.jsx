/**
 * Archivo: frontend/src/modules/clientes/editor/billing/ClientBillingSorting.jsx
 * Actualización: 2026-09-08 — ordenamiento independiente de la tabla de facturas.
 * Función: convierte Recibo, Servicio, Período, Monto, Vencimiento y Estado en encabezados ordenables.
 * Recibe de: wrapper estable ClientBilling.jsx.
 * Entrega a: la tabla renderizada por el módulo aislado de Facturación.
 */
import React, { useEffect, useRef, useState } from "react";

const SORTABLE_COLUMNS = ["Recibo", "Servicio", "Período", "Monto", "Vencimiento", "Estado"];

const valueFor = (row, index) => {
  const cell = row?.children?.[index];
  const text = (cell?.textContent || "").trim();
  if (index === 3) return Number(text.replace(/[^0-9,.-]/g, "").replace(/,/g, "")) || 0;
  return text.toLocaleLowerCase("es");
};

const compare = (a, b, direction) => {
  if (typeof a === "number" && typeof b === "number") return direction === "asc" ? a - b : b - a;
  return direction === "asc" ? String(a).localeCompare(String(b), "es") : String(b).localeCompare(String(a), "es");
};

export default function ClientBillingSorting({ children }) {
  const rootRef = useRef(null);
  const [sort, setSort] = useState({ index: null, direction: "asc" });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let scheduled = false;
    let applying = false;

    const apply = () => {
      scheduled = false;
      if (applying) return;
      const table = root.querySelector("table");
      if (!table) return;
      const headers = Array.from(table.querySelectorAll("thead th"));
      if (headers.length < 6) return;

      applying = true;
      headers.slice(0, 6).forEach((header, index) => {
        header.dataset.mikrohubSortable = "true";
        header.style.cursor = "pointer";
        header.style.userSelect = "none";
        header.setAttribute("role", "button");
        header.setAttribute("tabindex", "0");
        const arrow = sort.index === index ? (sort.direction === "asc" ? " ▲" : " ▼") : "";
        const label = SORTABLE_COLUMNS[index];
        if (header.textContent !== `${label}${arrow}`) header.textContent = `${label}${arrow}`;
        header.setAttribute("aria-label", `Ordenar por ${label}${arrow ? `, ${sort.direction === "asc" ? "ascendente" : "descendente"}` : ""}`);
      });

      if (sort.index !== null) {
        const tbody = table.querySelector("tbody");
        if (tbody) {
          const childrenRows = Array.from(tbody.children);
          const groups = [];
          for (let i = 0; i < childrenRows.length; i += 1) {
            const mainRow = childrenRows[i];
            const group = [mainRow];
            const next = childrenRows[i + 1];
            if (next?.querySelector("td[colspan='7']")) {
              group.push(next);
              i += 1;
            }
            groups.push(group);
          }
          groups.sort((left, right) => compare(valueFor(left[0], sort.index), valueFor(right[0], sort.index), sort.direction));
          const orderedRows = groups.flat();
          const currentRows = Array.from(tbody.children);
          if (orderedRows.some((row, index) => currentRows[index] !== row)) {
            orderedRows.forEach(row => tbody.appendChild(row));
          }
        }
      }
      applying = false;
    };

    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(apply);
    };

    const onClick = event => {
      const header = event.target.closest("th");
      if (!header || header.dataset.mikrohubSortable !== "true") return;
      const index = Array.from(header.parentElement.children).indexOf(header);
      setSort(current => ({ index, direction: current.index === index && current.direction === "asc" ? "desc" : "asc" }));
    };

    const onKeyDown = event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const header = event.target.closest("th");
      if (!header || header.dataset.mikrohubSortable !== "true") return;
      event.preventDefault();
      header.click();
    };

    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true });
    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKeyDown);
    schedule();

    return () => {
      observer.disconnect();
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKeyDown);
    };
  }, [sort]);

  return <div ref={rootRef}>{children}</div>;
}
