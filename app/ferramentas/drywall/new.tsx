// app/ferramentas/drywall/page.tsx

// ... (imports e interfaces iniciais permanecem idênticos)

// Dentro do seu componente DrywallCalculator:

// ... (lógica de estados e funções permanece idêntica)

  return (
    <>
      <AppBar title="Calculadora Drywall" />
      <View
        tag="page"
        className="p-4 bg-slate-50 min-h-[calc(100dvh_-_72px)] pb-40"
      >
        {/* --- Header e Listagem (Mantidos) --- */}
        <header className="mb-6 text-center">
          <SquareHalf
            size={48}
            weight="duotone"
            className="mx-auto text-indigo-600 mb-2"
          />
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Estimativa de Materiais
          </h2>
          <p className="text-slate-500 text-sm italic">
            Cálculos baseados em padrões técnicos ABNT
          </p>
        </header>

        {/* --- Drawer --- */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="bg-white h-[95vh] p-4 overflow-y-scroll data-[vaul-drawer]:rounded-[2rem_2rem_0_0_!important]">
            <div className="mx-auto w-full max-w-md space-y-6 pb-10">
              <DrawerHeader className="px-0 border-b pb-4">
                <DrawerTitle className="flex flex-col gap-4 text-xl font-black text-indigo-900 uppercase items-center justify-between">
                  <span>Adicionar Ambiente</span>
                  <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[12px]">
                    {tempServices.length} serviços na lista
                  </div>
                </DrawerTitle>
              </DrawerHeader>

              {/* 1. NOME DO AMBIENTE */}
              <label className="block">
                <span className="text-[12px] font-bold text-slate-400 uppercase ml-1">
                  Nome do Cômodo
                </span>
                <Input
                  placeholder="Ex: Sala de Estar"
                  value={currentRoomName}
                  onChange={(e) => setCurrentRoomName(e.target.value)}
                />
              </label>

              {/* 2. LISTA TEMPORÁRIA */}
              {tempServices.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {tempServices.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 bg-slate-900 text-white p-2 rounded-xl text-[12px] flex items-center gap-2"
                    >
                      {s.type === "wall" ? (
                        <Wall size={14} />
                      ) : (
                        <HardHat size={14} />
                      )}
                      {s.tag} | {s.totalArea.toFixed(2)}m²
                      <Trash
                        size={14}
                        className="text-red-400 cursor-pointer"
                        onClick={() =>
                          setTempServices(
                            tempServices.filter((_, i) => i !== idx),
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 3. CONFIGURAÇÃO DO SERVIÇO ATUAL */}
              <div className="flex flex-col gap-4 bg-slate-50 px-4 pt-4 rounded-2xl border border-slate-200 ">
                <View
                  tag="tab-grid"
                  className="flex bg-white rounded-xl p-1 border"
                >
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

                {/* Opção de Lã para Parede */}
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
                        onCheckedChange={(checked) =>
                          setActiveInsulation(checked)
                        }
                        className="data-[state=checked]:bg-[#00559C] data-[state=unchecked]:bg-slate-300"
                      />
                    </Label>
                  </div>
                )}

                {/* Medidas Dinâmicas */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase ml-1">
                    Medidas (Soma Automática)
                  </span>

                  {/* Medidas Principais em um card limpo */}
                  <View
                    tag="measure-card"
                    className="flex flex-col space-y-3 p-3 bg-white rounded-xl border border-slate-100 relative shadow-sm"
                  >
                    {activeMeasures.map((m, mIdx) => (
                      <div key={mIdx} className="space-y-3">
                        <View
                          tag="main-measure-inputs"
                          className="grid grid-cols-2 gap-2"
                        >
                          <label>
                            <span className="text-[10px] font-bold text-slate-400 capitalize">
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
                            <span className="text-[10px] font-bold text-slate-400 capitalize">
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
                      </div>
                    ))}
                  </View>

                  {/* ALTERAÇÃO SOLICITADA: Seção de Vãos movida para fora do card de medidas */}
                  {activeType === "wall" && (
                    <View
                      tag="add-portas-e-janelas"
                      className="space-y-2 px-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-orange-500 uppercase">
                          Descontar Vãos (Portas/Janelas)
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

                      {/* Lista de vãos adicionados */}
                      <div className="space-y-2">
                        {activeMeasures[0].openings.map((o, oIdx) => (
                          <div
                            key={o.id}
                            className="flex gap-2 items-center animate-in slide-in-from-right-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm"
                          >
                            <span className="text-[10px] uppercase font-bold text-slate-400 w-4">
                              {o.type === "door" ? "P" : "J"}
                            </span>
                            <Input
                              className="h-8 text-[12px]"
                              type="number"
                              placeholder="largura"
                              value={o.w || ""}
                              onChange={(e) =>
                                updateOpening(0, oIdx, "w", parseFloat(e.target.value))
                              }
                            />
                            <Input
                              className="h-8 text-[12px]"
                              type="number"
                              placeholder="altura"
                              value={o.h || ""}
                              onChange={(e) =>
                                updateOpening(0, oIdx, "h", parseFloat(e.target.value))
                              }
                            />
                            <div className="grid items-center justify-center bg-red-100 rounded-full p-1 cursor-pointer">
                              <Trash
                                size={14}
                                weight="duotone"
                                className="text-red-600"
                                onClick={() => {
                                  const nm = [...activeMeasures];
                                  nm[0].openings.splice(oIdx, 1);
                                  setActiveMeasures(nm);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </View>
                  )}

                  <Button
                    variant="ghost"
                    onClick={addMeasureField}
                    className="w-full text-indigo-600 font-bold text-[12px] uppercase border-2 border-dashed border-indigo-100 rounded-xl"
                  >
                    Adicionar Medida (Irregular)
                  </Button>
                </div>

                {/* IMPLEMENTAÇÃO TAREFA 2: Visor de Área ao Vivo */}
                <div className="bg-indigo-600 p-3 rounded-xl text-white flex justify-between items-center shadow-inner">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase opacity-80">
                      Área Calculada
                    </span>
                    <span className="text-xs italic opacity-70">
                      (Bruta - Vãos)
                    </span>
                  </div>
                  <div className="text-xl font-black">
                    {currentLiveArea.toFixed(2)} m²
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={addServiceToTempList}
                  className="w-full text-indigo-800 font-bold text-[12px] uppercase h-12 border-2 border-dashed border-indigo-100 rounded-xl"
                >
                  Salvar O serviço na lista
                </Button>
              </div>

              {/* ... Restante do rodapé do drawer e listagem (Mantidos) */}
