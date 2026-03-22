{
  /* 3. CONFIGURAÇÃO DO SERVIÇO ATUAL */
}
<div className="flex flex-col gap-4 bg-slate-50 px-4 pt-4 rounded-2xl border border-slate-200 ">
  {/* ... (Seu código de tabs e activeTag permanece igual) ... */}

  {/* Medidas Dinâmicas */}
  <div className="space-y-4">
    <span className="text-[10px] font-bold text-indigo-500 uppercase ml-1">
      Medidas (Soma Automática)
    </span>
    {activeMeasures.map((m, mIdx) => (
      <div
        key={mIdx}
        className="space-y-2 p-3 bg-white rounded-xl border border-slate-100 relative shadow-sm"
      >
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="text-xs font-bold text-slate-400 capitalize">
              {activeType === "wall" ? "Largura (m)" : "Largura (m)"}
            </span>
            <Input
              type="number"
              placeholder="0.00"
              value={m.w || ""}
              onChange={(e) => {
                const nm = [...activeMeasures];
                nm[mIdx].w = parseFloat(e.target.value) || 0;
                setActiveMeasures(nm);
              }}
            />
          </label>
          <label>
            <span className="text-xs font-bold text-slate-400 capitalize">
              {activeType === "wall" ? "Altura (m)" : "Comprimento (m)"}
            </span>
            <Input
              type="number"
              placeholder="0.00"
              value={m.h || ""}
              onChange={(e) => {
                const nm = [...activeMeasures];
                nm[mIdx].h = parseFloat(e.target.value) || 0;
                setActiveMeasures(nm);
              }}
            />
          </label>
        </div>

        {/* IMPLEMENTAÇÃO TAREFA 1: Vãos apenas no primeiro card de medida */}
        {activeType === "wall" && mIdx === 0 && (
          <div className="space-y-2 mt-2 pt-2 border-t border-dashed">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-orange-500 capitalize">
                Descontar Vãos da Parede
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => addOpening(mIdx, "door")}
                  className="p-1 bg-orange-50 text-orange-600 rounded flex items-center gap-1 text-[12px] font-bold"
                >
                  <Door size={16} /> + Porta
                </button>
                <button
                  onClick={() => addOpening(mIdx, "window")}
                  className="p-1 bg-blue-50 text-blue-600 rounded flex items-center gap-1 text-[12px] font-bold"
                >
                  <Browser size={16} /> + Janela
                </button>
              </div>
            </div>
            {m.openings.map((o, oIdx) => (
              <div
                key={o.id}
                className="flex gap-2 items-center animate-in slide-in-from-right-2"
              >
                <span className="text-[12px] uppercase font-bold text-slate-400">
                  {o.type === "door" ? "P" : "J"}
                </span>
                <Input
                  className="h-7 text-[12px]"
                  type="number"
                  placeholder="L"
                  onChange={(e) =>
                    updateOpening(mIdx, oIdx, "w", parseFloat(e.target.value))
                  }
                />
                <Input
                  className="h-7 text-[12px]"
                  type="number"
                  placeholder="A"
                  onChange={(e) =>
                    updateOpening(mIdx, oIdx, "h", parseFloat(e.target.value))
                  }
                />
                <Trash
                  size={14}
                  className="text-red-300"
                  onClick={() => {
                    const nm = [...activeMeasures];
                    nm[mIdx].openings.splice(oIdx, 1);
                    setActiveMeasures(nm);
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Botão para remover medida irregular (caso não seja a primeira) */}
        {mIdx > 0 && (
          <button
            onClick={() =>
              setActiveMeasures(activeMeasures.filter((_, i) => i !== mIdx))
            }
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
          >
            <Trash size={12} weight="bold" />
          </button>
        )}
      </div>
    ))}

    {/* IMPLEMENTAÇÃO TAREFA 2: Visor de Área ao Vivo */}
    <div className="bg-indigo-600 p-3 rounded-xl text-white flex justify-between items-center shadow-inner">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase opacity-80">
          Área Calculada
        </span>
        <span className="text-xs italic opacity-70">(Bruta - Vãos)</span>
      </div>
      <div className="text-xl font-black">
        {activeMeasures
          .reduce((acc, m) => {
            const gross = m.w * m.h;
            const openings = m.openings.reduce(
              (oAcc, o) => oAcc + o.w * o.h,
              0,
            );
            return acc + (gross - openings);
          }, 0)
          .toFixed(2)}{" "}
        m²
      </div>
    </div>

    <Button
      variant="ghost"
      onClick={addMeasureField}
      className="w-full text-indigo-600 font-bold text-[12px] uppercase border-2 border-dashed border-indigo-100 rounded-xl"
    >
      + Adicionar Medida (Irregular)
    </Button>
  </div>

  {/* ... (Restante do seu código: Botão Adicionar Mais Serviço, etc) ... */}
</div>;
