"use client";
import { Skeleton } from "../../../components/ui/skeleton";
import View from "@/components/layout/View";
// import "../Budget.css"; // Reaproveita os espaçamentos originais

export default function BudgetSkeleton() {
  return (
    <View tag="budget-page" className="bg-[#e5e5e5] opacity-70">
      {/* Simulação do EACard */}
      <View
        tag="page-header"
        style={{
          marginBottom: "32px",
        }}
      >
        <Skeleton className="bg-blue-950 w-full aspect-[3.8/1.5] rounded-2xl mb-4" />
        {/* Simulação do doc-id */}
        <div
          className="flex items-center justify-between w-[calc(100%-1rem)] h-4 p-[.7rem_1rem] bg-white rounded-b-2xl border-x-[5px] border-gray-100"
          style={{ padding: ".7rem 1rem" }}
        >
          <Skeleton className="h-3 w-32" style={{ background: "#bbb" }} />
          <Skeleton className="h-3 w-32" style={{ background: "#bbb" }} />
        </div>
      </View>

      {/* Simulação do doc-title */}
      <View tag="doc-title" style={{ marginBottom: "32px" }}>
        <div
          className="flex flex-col items-center py-4 w-full"
          style={{
            gap: "32px",
          }}
        >
          <Skeleton
            className="h-6 w-48 mb-4"
            style={{ background: "#c9c3c4" }}
          />
          <Skeleton className="h-10 w-full bg-[#00559c]" />
        </div>
      </View>

      {/* Simulação da cliente-section */}
      <View tag="cliente-section">
        <View tag="ui" className="w-full">
          <Skeleton
            className="h-10 w-full rounded-t-2xl"
            style={{
              background: "var(--sv-sombra-azul)",
            }}
          />
          <div
            className="p-4 bg-white"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "1rem",
            }}
          >
            <Skeleton
              className="h-5 w-3/4 mb-3"
              style={{ background: "#c9c3c4" }}
            />
            <Skeleton
              className="h-5 w-full"
              style={{ background: "#c9c3c4" }}
            />
          </div>
        </View>
      </View>

      {/* Simulação de Cláusulas (loop de 2 cláusulas) */}
      {[1, 2].map((i) => (
        <View key={i} tag="cliente-section">
          <View tag="ui" className="w-full">
            <Skeleton
              className="h-10 w-full rounded-t-2xl"
              style={{
                background: "var(--sv-sombra-azul)",
              }}
            />
            <div
              className="p-4 bg-white"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                padding: "1rem",
              }}
            >
              <Skeleton
                className="h-5 w-3/4 mb-3"
                style={{ background: "#c9c3c4" }}
              />
              <Skeleton
                className="h-5 w-full"
                style={{ background: "#c9c3c4" }}
              />
            </div>
          </View>
        </View>
      ))}
    </View>
  );
}
