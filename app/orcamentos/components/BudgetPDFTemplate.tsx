import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Registro da fonte Montserrat (que você usa nos títulos do app)
Font.register({
  family: "Montserrat",
  src: "https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm453RRn714toMthpzhjdw.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica", // Base estável para PDFs
    fontSize: 9,
    color: "#333",
    backgroundColor: "#FFFFFF",
  },
  // Cabeçalho Visual (Simulando seu EACard)
  headerBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  brandName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a237e", // Seu Azul Sodalita
    fontFamily: "Helvetica-Bold",
  },
  docIdBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderColor: "#e5e5e5",
    padding: 5,
    marginTop: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10, // Border radius conforme seu CSS
    textTransform: "uppercase",
  },
  // Título do Documento
  titleContainer: {
    marginVertical: 15,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#1a237e",
    fontWeight: "bold",
    marginBottom: 5,
  },
  mainTitle: {
    width: "100%",
    backgroundColor: "#00559c", // Sua var --sv-marine
    color: "#FFFFFF",
    textAlign: "center",
    padding: 6,
    fontSize: 11,
    fontWeight: "bold",
  },
  // Seção Cliente
  clientSection: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    overflow: "hidden",
  },
  clientHeader: {
    backgroundColor: "#1a237e",
    padding: 5,
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 10,
  },
  clientBody: {
    padding: 10,
  },
  // Cláusulas (Onde a mágica da quebra de página acontece)
  clause: {
    marginTop: 10,
    marginBottom: 5,
  },
  clauseHeader: {
    backgroundColor: "#1a237e",
    padding: 4,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  clauseHeaderText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  clauseContent: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderTopWidth: 0,
  },
  subclauseTitle: {
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 3,
    marginBottom: 5,
    marginTop: 8,
  },
  textP: { marginBottom: 5, lineHeight: 1.4 },
  textBullet: { marginLeft: 10, marginBottom: 2 },
  tagc: {
    // Seu bloco de destaque azul
    backgroundColor: "#e8f1ff",
    color: "#0075bd",
    padding: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2277ff",
    borderRadius: 8,
    marginVertical: 5,
  },
  // Rodapé e Assinaturas
  footer: {
    marginTop: 20,
    padding: 10,
  },
  tagb: {
    // Destaque de encerramento
    backgroundColor: "#00ffff", // Seu Cyan (#0df)
    color: "#00559c",
    padding: 15,
    borderRadius: 20,
    marginVertical: 10,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    paddingHorizontal: 20,
  },
  signatureLine: {
    width: "40%",
    borderTopWidth: 1,
    borderTopColor: "#000",
    textAlign: "center",
    paddingTop: 5,
    fontSize: 10,
    fontWeight: "bold",
  },
});

export const BudgetPDFTemplate = ({ data }) => {
  const getFormattedDate = (date) =>
    date.includes("T")
      ? date.split("T")[0].split("-").reverse().join("/")
      : date;

  return (
    <Document title={`Orçamento_${data?.cliente?.name}`}>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho Elétrica & Art */}
        <View style={styles.headerBox}>
          <Text style={styles.brandName}>ELÉTRICA & ART</Text>
          <View style={{ textAlign: "right" }}>
            <Text style={{ fontSize: 8 }}>Engenharia e Automação</Text>
          </View>
        </View>

        <View style={styles.docIdBox}>
          <Text>EMISSÃO: {getFormattedDate(data?.docTitle?.emissao)}</Text>
          <Text>VALIDADE: {data?.docTitle?.validade}</Text>
        </View>

        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={styles.subtitle}>{data?.docTitle?.subtitle}</Text>
          <Text style={styles.mainTitle}>{data?.docTitle?.text}</Text>
        </View>

        {/* Cliente */}
        <View style={styles.clientSection}>
          <Text style={styles.clientHeader}>DADOS DO CLIENTE</Text>
          <View style={styles.clientBody}>
            <Text style={{ fontWeight: "bold" }}>
              Nome: {data?.cliente?.name}
            </Text>
            <Text>
              Endereço:{" "}
              {`${data?.cliente?.rua}, ${data?.cliente?.num} - ${data?.cliente?.bairro}`}
            </Text>
            <Text>{`${data?.cliente?.cidade} - ${data?.cliente?.cep}`}</Text>
          </View>
        </View>

        {/* Cláusulas Dinâmicas */}
        {data?.servicos?.map((servico, index) => (
          <View key={index} style={styles.clause} wrap={false}>
            <View style={styles.clauseHeader}>
              <Text style={styles.clauseHeaderText}>
                {index + 1}. {servico.titulo}
              </Text>
            </View>
            <View style={styles.clauseContent}>
              {servico.itens.map((item, iIdx) => (
                <View key={iIdx}>
                  <Text style={styles.subclauseTitle}>{item.subtitulo}</Text>
                  {item.detalhes.map((d, dIdx) => {
                    if (d.tipo === "t6")
                      return (
                        <Text
                          key={dIdx}
                          style={{ fontWeight: "bold", marginTop: 5 }}
                        >
                          {d.conteudo}
                        </Text>
                      );
                    if (d.tipo === "tagc")
                      return (
                        <View key={dIdx} style={styles.tagc}>
                          <Text>{d.conteudo}</Text>
                        </View>
                      );
                    if (d.tipo === "ul")
                      return d.conteudo.map((li, lIdx) => (
                        <Text key={lIdx} style={styles.textBullet}>
                          • {li}
                        </Text>
                      ));
                    return (
                      <Text key={dIdx} style={styles.textP}>
                        {d.conteudo}
                      </Text>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Rodapé */}
        <View style={styles.footer} wrap={false}>
          <Text style={{ fontWeight: "bold", fontSize: 11 }}>
            Compromisso Elétrica & Art:
          </Text>
          <Text style={{ marginTop: 5 }}>
            Unir técnica, estética, precisão e responsabilidade para entregar um
            resultado impecável.
          </Text>

          <View style={styles.tagb}>
            <Text>
              Agradecemos a oportunidade de apresentar esta proposta e estamos à
              disposição para esclarecimentos.
            </Text>
          </View>

          {/* Assinaturas */}
          <View style={styles.signatureRow}>
            <View style={styles.signatureLine}>
              <Text style={{ color: "#00559c" }}>Rafael - Elétrica & Art</Text>
            </View>
            <View style={styles.signatureLine}>
              <Text>Assinatura do Cliente</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
