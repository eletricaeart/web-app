// components/orcamentos/EACardStylesheet.ts
export const EACardStyles = `
ea-card,
.ea_card {
  /* Definimos o card como um container de tamanho */
  container-type: inline-size; 

  /*font-size: 2.5vw;*/
  display: grid !important;
  grid-template-columns: 0.35fr 0.65fr;
  width: 100%;
  /* height: 36.3vw; */
  aspect-ratio: 3.8 / 1;
  padding: 1vw;
  inset: 0;
  color: #f5f5f5;
  filter: var(--appbar-filter-shadow);

  margin: 0;

  background-image: url("https://res.cloudinary.com/dyycxyttb/image/upload/v1772753715/bg3_jwcwgx.png");
  background-color: #0009;
  background-size: cover;
  border-radius: 1rem;
}
.card {
  background: var(--sv-sombra-azul);
  color: #f5f5f5;
  font-size: 2.5vw;
  display: grid;
  grid-template-columns: 0.35fr 0.65fr;
  width: 100%;
  aspect-ratio: 3.8 / 1;
  padding: 1vw;
  box-sizing: border-box;
  font-family: "Poppins", sans-serif !important;
  border-radius: 1rem;
  background-size: cover;
  background-blend-mode: overlay;
}

.logoArea {
  display: flex;
  height: 100%;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;

  padding: 1cqw;
}

.logoImg {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 100vw;
}

.description {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
  text-align: center;

  font-size: 2.25vw;
  /* clamp para a fonte não ficar gigante nem minúscula */
  font-size: clamp(8px, 2.25vw, 16px) !important;

  /* A MÁGICA: Fonte baseada na largura do card (cqw) */
  /* 4cqw costuma ser o 'sweet spot' para esse layout 3.8/1 */
  font-size: clamp(10px, 4cqw, 18px) !important;

  /* Reduzimos o espaçamento entre linhas para caber mais texto */
  line-height: 1.1 !important; 

  height: 95%;
  /* Permitimos que a altura seja flexível se necessário, mas mantendo a proporção */
  height: 100% !important;
  padding: 0.5vw !important;
  padding: 2cqw; /* Padding proporcional à largura do card */ 

  box-sizing: border-box !important;

  aspect-ratio: 1.8 / 1;
}

.nameImg {
  width: 100%;
  margin-bottom: 0.2em;
}

/* Ajuste na imagem do nome (Elétrica & Art) para não empurrar o resto */
.nameImg {
  width: 90% !important; /* Reduzimos levemente a largura da logo de texto */
  max-height: 40% !important; /* Garante que ela não ocupe o card todo */
  object-fit: contain;
  margin-bottom: 4px !important;
}

.nameImg {
  /* Logo do nome também proporcional ao card */
  width: 80cqw; 
  max-width: 90%;
  margin-bottom: 0.5cqw;
}

.description t5,
.description t {
  display: block;
  /* line-height: 1.2; */

  width: 100%;
  overflow-wrap: break-word; /* Garante que o CNPJ/Endereço quebrem se forem longos */
  margin-bottom: 2px !important;

  white-space: nowrap; /* Evita quebra feia se o container for pequeno */
}

.contactLink {
  color: inherit;
  text-decoration: none;
}

@media print {
  .card {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;
