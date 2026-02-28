// import React from "react";
import styles from "./EACard.module.css";
import View from "../layout/View";

// Centralizando os paths das imagens conforme seu EACard.js
const IMAGE_PATHS = {
  // logo: "/assets/imgs/favicons/EA-logo.png",
  logo: "pix/ea/EA-logo.png",
  // name: "/assets/imgs/ea/ea-Name.png",
  name: "pix/ea/ea-Name.png",
};

const EACard = () => {
  return (
    <View tag="ea-card">
      <div className={styles.logoArea}>
        <img src={IMAGE_PATHS.logo} alt="EA Logo" className={styles.logoImg} />
      </div>

      <div className={styles.description}>
        <div className={styles.eaName}>
          <img
            src={IMAGE_PATHS.name}
            alt="Elétrica & Art"
            className={styles.nameImg}
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
          <a href="tel:+5513997685853" className={styles.contactLink}>
            <strong>Fone </strong> ( 13 ) 99768-5853
          </a>{" "}
          <br />
          <a href="https://wa.me/5513997685853" className={styles.contactLink}>
            <strong>Whatsapp </strong> ( 13 ) 99768-5853
          </a>{" "}
          <br />
          <a
            href="mailto:rafa.julia.forever@gmail.com"
            className={styles.contactLink}
          >
            <strong>E-mail </strong> rafa.julia.forever@gmail.com
          </a>
        </div>
      </div>
    </View>
  );
};

export default EACard;
