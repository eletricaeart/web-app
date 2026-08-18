// components/orcamentos/EACardStylesheet.ts
export const EACardStyles = `
ea-card,
.ea_card {
  /* Definimos o card como um container de tamanho */
  container-type: inline-size; 

  font-size: 14px !important;
  display: grid !important;
  grid-template-columns: 0.35fr 0.65fr;
  width: 100%;
  aspect-ratio: 3.8 / 1;
  padding: 1vw;
  inset: 0;
  color: #f5f5f5 !important;
  filter: var(--appbar-filter-shadow);

  margin: 0;

  background-image: url("https://res.cloudinary.com/dyycxyttb/image/upload/v1772753715/bg3_jwcwgx.png");
  background-color: #0009;
  background-size: cover;
  border-radius: 1rem;
}
.card {
  background: var(--sv-sombra-azul);
  color: #f5f5f5 !important;
  font-size: 14px !important;
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
  color: #f5f5f5 !important;

  /* Tamanho isolado do EACard */
  font-size: clamp(10px, 3.2cqw, 15px) !important;

  /* Reduzimos o espaçamento entre linhas para caber mais texto */
  line-height: 1.15 !important; 

  height: 100% !important;
  padding: 0.5vw !important;
  padding: 2cqw; /* Padding proporcional à largura do card */ 

  box-sizing: border-box !important;

  aspect-ratio: 1.8 / 1;
}

.description span {
  font-size: 0.9em !important;
  font-weight: bold !important;
  color: #f5f5f5 !important;
  display: block !important;
  line-height: 1.2 !important;
}

.description p {
  font-size: 0.88em !important;
  margin: 0.2em 0 !important;
  color: #f5f5f5 !important;
  line-height: 1.2 !important;
}

.description div {
  font-size: 0.88em !important;
  color: #f5f5f5 !important;
  line-height: 1.25 !important;
}

.nameImg {
  /* Logo do nome proporcional ao card */
  width: 80cqw; 
  max-width: 90%;
  max-height: 40% !important;
  object-fit: contain;
  margin-bottom: 0.5cqw;
}

.description t5,
.description t {
  display: block;
  width: 100%;
  overflow-wrap: break-word;
  margin-bottom: 2px !important;
  white-space: nowrap;
}

.contactLink {
  color: #f5f5f5 !important;
  text-decoration: none;
}

@media print {
  ea-card,
  .ea_card,
  .card {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    font-size: 13px !important;
  }
  .description {
    font-size: 12px !important;
    line-height: 1.15 !important;
  }
  .description span {
    font-size: 11px !important;
  }
  .description p {
    font-size: 10.5px !important;
  }
  .description div,
  .contactLink {
    font-size: 10.5px !important;
  }
}
`;
