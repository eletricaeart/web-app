// components/orcamentos/prestyle.ts
export const prestyle = `
.ea-card,
.ea_card {
  display: grid;
  grid-template-columns: 0.30fr 0.70fr;
  width: 100%;
  aspect-ratio: 3.8 / 1;
  padding: 1vw;
  box-sizing: border-box;
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
  grid-template-columns: 0.30fr 0.70fr;
  width: 100%;
  aspect-ratio: 3.8 / 1;
  padding: 1vw;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif !important;
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
  font-size: 2.5vw;
  height: 98%;
  aspect-ratio: 1.9 / 1;
}

.eaName {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.nameImg {
  width: 100%;
  max-width: 370px;
  height: auto;
  object-fit: contain;
  margin-bottom: 0.35rem;
  display: block;
}

.description t5,
.description t {
  display: block;
  line-height: 1.2;
}

.contactLink {
  color: inherit;
  text-decoration: none;
}

@media print {
  .card {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    grid-template-columns: 0.30fr 0.70fr !important;
  }
  .description {
    font-size: 13.5px !important;
    line-height: 1.18 !important;
  }
  .eaName {
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }
  .nameImg {
    width: 100% !important;
    max-width: 370px !important;
    height: auto !important;
    object-fit: contain !important;
    margin-bottom: 4px !important;
    display: block !important;
  }
}
`;
