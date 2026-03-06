// components/ui/EACard.tsx
import React from "react";
import View from "../layout/View";
import "./EACard.css";
// import Image from "next/image"; // Mantido para referência futura conforme seu original

// Centralizando os paths das imagens conforme seu EACard.js
const IMAGE_PATHS = {
  logo: "/pix/ea/EA-logo.png",
  name: "/pix/ea/ea-Name.png",
  logoUri:
    "https://res.cloudinary.com/dyycxyttb/image/upload/v1772753360/EA-logo_ebbhge.png",
  nameUri:
    "https://res.cloudinary.com/dyycxyttb/image/upload/v1772753359/ea-Name_iq49ju.png",
  bgUri:
    "https://res.cloudinary.com/dyycxyttb/image/upload/v1772753715/bg3_jwcwgx.png",
};

const EACard: React.FC = () => {
  return (
    <View tag="ea-card" className="ea_card">
      <div className={"logoArea"}>
        <img src={IMAGE_PATHS.logoUri} alt="EA Logo" className={"logoImg"} />
      </div>

      <div className={"description"}>
        <div className={"eaName"}>
          <img
            src={IMAGE_PATHS.nameUri}
            alt="Elétrica & Art"
            className={"nameImg"}
          />
        </div>

        <span style={{ fontSize: "0.9em", fontWeight: "bold" }}>
          CNPJ 32.858.892/0001-52 - IM 67358/0001
        </span>

        <p style={{ margin: "0.2em 0" }}>
          Rua José Alves Maciel, 40 - Aviação <br />
          Praia Grande - São Paulo - SP - Cep 11702-440
        </p>

        <div style={{ fontSize: "0.9em" }}>
          <a href="tel:+5513997685853" className={"contactLink"}>
            <strong>Fone </strong> ( 13 ) 99768-5853
          </a>{" "}
          <br />
          <a href="https://wa.me/5513997685853" className={"contactLink"}>
            <strong>Whatsapp </strong> ( 13 ) 99768-5853
          </a>{" "}
          <br />
          <a
            href="mailto:rafa.julia.forever@gmail.com"
            className={"contactLink"}
          >
            <strong>E-mail </strong> rafa.julia.forever@gmail.com
          </a>
        </div>
      </div>
    </View>
  );
};

export default EACard;
