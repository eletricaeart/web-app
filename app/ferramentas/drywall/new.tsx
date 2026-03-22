// app/ferramentas/drywall/page.tsx

// ... (imports e interfaces mantidos)

// Dentro do seu componente DrywallCalculator:

// ... (logica de estados e funções mantida)

// No retorno do DrawerContent:

{
  /* 3. CONFIGURAÇÃO DO SERVIÇO ATUAL */
}
<View
  tag="service-card"
  className="flex flex-col gap-4 bg-slate-50 px-4 pt-4 rounded-2xl border border-slate-200 "
>
  <View tag="tab-grid" className="flex bg-white rounded-xl p-1 border">
    <Button
      variant={activeType === "wall" ? "default" : "outline"}
      onClick={() => setActiveType("wall")}
      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[0.9rem_0_0_0.9rem] text-[12px] font-bold uppercase transition-all ${activeType === "wall" ? "bg-[#00559c] text-white shadow-md" : "text-slate-400"}`}
    >
      <Wall size={18} /> Parede
    </Button>
    <Button
      variant={activeType === "ceiling" ? "default" : "outline"}
      onClick={() => setActiveType("ceiling")}
      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[0_0.9rem_0.9rem_0] text-[12px] font-bold uppercase transition-all ${activeType === "ceiling" ? "bg-[#00559c] text-white shadow-md" : "text-slate-400"}`}
    >
      <HardHat size={18} /> Forro
    </Button>
  </View>

  <Input
    placeholder="Identificação (Ex: Parede Leste)"
    value={activeTag}
    onChange={(e) => setActiveTag(e.target.value)}
    className="bg-white border-slate-200"
  />

  {activeType === "wall" && (
    <div className="flex items-center justify-between p-3 rounded-xl">
      <Label
        htmlFor="incluir-la-mode"
        className="flex items-center justify-between w-full text-[12px] font-bold text-mauve-700 capitalize cursor-pointer"
      >
        Incluir Lã de Vidro/Pet
        <Switch
          id="incluir-la-mode"
          checked={activeInsulation}
          onCheckedChange={(checked) => setActiveInsulation(checked)}
          className="data-[state=checked]:bg-[#00559C] data-[state=unchecked]:bg-slate-300"
        />
      </Label>
    </div>
  )}

  {/* Medidas Dinâmicas */}
  <View tag="medidas-dinamicas" className="space-y-4">
    <span className="text-[10px] font-bold text-indigo-500 uppercase ml-1">
      Medidas (Soma Automática)
    </span>

    <View
      tag="measures"
      className="flex flex-col space-y-2 p-3 bg-white rounded-xl border border-slate-100 relative shadow-sm"
    >
      {activeMeasures.map((m, mIdx) => (
        <View tag="measure-card" key={mIdx} className="space-y-3">
          <View tag="main-measure-inputs" className="grid grid-cols-2 gap-2">
            <label>
              <span className="text-xs font-bold text-slate-400 capitalize">
                Largura (m)
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
          </View>
          {mIdx < activeMeasures.length - 1 && (
            <div className="border-b border-slate-50 my-2" />
          )}
        </View>
      ))}

      <Button
        variant="ghost"
        onClick={addMeasureField}
        className="w-full text-indigo-600 font-bold text-[12px] uppercase border-2 border-dashed border-indigo-100 rounded-xl mt-2"
      >
        Adicionar Medida (Irregular)
      </Button>
    </View>

    {/* ALTERAÇÃO: Componente de Vãos movido para fora do measure-card e posicionado após o botão */}
    {activeType === "wall" && (
      <View tag="add-portas-e-janelas" className="space-y-2 mt-2 px-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-orange-500 capitalize">
            Descontar Vãos da Parede
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addOpening(0, "door")}
              className="p-1 bg-orange-50 text-orange-600 rounded flex items-center gap-1 text-[10px] font-bold"
            >
              <Door size={16} /> + Porta
            </button>
            <button
              type="button"
              onClick={() => addOpening(0, "window")}
              className="p-1 bg-blue-50 text-blue-600 rounded flex items-center gap-1 text-[10px] font-bold"
            >
              <Browser size={16} /> + Janela
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {/* Note que agora acessamos sempre activeMeasures[0] para as aberturas */}
          {activeMeasures[0].openings?.map((o, oIdx) => (
            <div
              key={o.id}
              className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm"
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 w-4">
                {o.type === "door" ? "P" : "J"}
              </span>
              <Input
                className="h-8 text-[12px]"
                type="number"
                placeholder="L"
                value={o.w || ""}
                onChange={(e) =>
                  updateOpening(0, oIdx, "w", parseFloat(e.target.value))
                }
              />
              <Input
                className="h-8 text-[12px]"
                type="number"
                placeholder="A"
                value={o.h || ""}
                onChange={(e) =>
                  updateOpening(0, oIdx, "h", parseFloat(e.target.value))
                }
              />
              <View
                tag="oi"
                className="grid items-center justify-center bg-red-100 rounded-full p-1 cursor-pointer"
                onClick={() => {
                  const nm = [...activeMeasures];
                  nm[0].openings.splice(oIdx, 1);
                  setActiveMeasures(nm);
                }}
              >
                <Trash size={14} weight="duotone" className="text-red-600" />
              </View>
            </div>
          ))}
        </div>
      </View>
    )}
  </View>

  {/* Visor de Área ao Vivo */}
  <View
    tag="visor-area"
    className="bg-indigo-600 p-3 rounded-xl text-white flex justify-between items-center shadow-inner"
  >
    <div className="flex flex-col">
      <span className="text-[10px] font-bold uppercase opacity-80">
        Área Calculada
      </span>
      <span className="text-xs italic opacity-70">(Bruta - Vãos)</span>
    </div>
    <div className="text-xl font-black">{currentLiveArea.toFixed(2)} m²</div>
  </View>

  <Button
    variant="ghost"
    onClick={addServiceToTempList}
    className="w-full text-indigo-800 font-bold text-[12px] uppercase h-12 border-2 border-dashed border-indigo-100 rounded-xl"
  >
    Salvar Serviço na Lista
  </Button>
</View>;

// ... (restante do código mantido)
