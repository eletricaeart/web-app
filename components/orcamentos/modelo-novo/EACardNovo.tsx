// components/orcamentos/modelo-novo/EACardNovo.tsx
import React from 'react';
import View from '@/components/layout/View';
import './EACardNovo.css';

// URIs das imagens oficiais do cabeçalho da Elétrica & Art
const IMAGE_PATHS = {
  logo: '/pix/ea/EA-logo.png',
  name: '/pix/ea/ea-Name.png',
  logoUri:
    'https://res.cloudinary.com/dyycxyttb/image/upload/v1772753360/EA-logo_ebbhge.png',
  nameUri:
    'https://res.cloudinary.com/dyycxyttb/image/upload/v1772753359/ea-Name_iq49ju.png',
  bgUri:
    'https://res.cloudinary.com/dyycxyttb/image/upload/v1772753715/bg3_jwcwgx.png',
};

/**
 * Novo Card de Cabeçalho do Orçamento (Clone do Original com altura reduzida em 25%).
 *
 * - Altura reduzida em 25% (aspect-ratio ~5.07 / 1).
 * - Imagem do logotipo (lado esquerdo) reduzida para acompanhar proporcionalmente a nova altura.
 * - Conteúdos do lado direito mantidos integralmente intactos (identificação, endereço e contatos).
 * - Totalmente isolado do EACard legado para segurança e testes.
 */
const EACardNovo: React.FC = () => {
  return (
    <View
      tag="ea-card-novo"
      className="ea_card_novo relative z-10 w-full grid grid-cols-[0.26fr_0.74fr] h-auto min-h-[135px] p-[1.2cqw_2cqw] box-border text-slate-100 m-0 overflow-hidden shadow-md rounded-t-2xl rounded-b [print-color-adjust:exact] [WebkitPrintColorAdjust:exact] bg-cover bg-center bg-no-repeat bg-[#0a0f19]/90 print:grid print:grid-cols-[0.26fr_0.74fr] print:h-auto print:min-h-[130px] print:break-inside-avoid print:p-[8px_16px] print:rounded-t-2xl print:rounded-b"
      style={{
        backgroundImage: `url(${IMAGE_PATHS.bgUri})`,
      }}
    >
      {/* Logotipo à esquerda proporcional à nova altura */}
      <div className="logoAreaNovo flex h-full items-center justify-center p-[0.5cqw] box-border print:h-full print:flex print:items-center print:justify-center">
        <img
          src={IMAGE_PATHS.logoUri}
          alt="EA Logo"
          className="logoImgNovo max-h-[110px] w-auto max-w-[90%] aspect-square rounded-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] print:max-h-[105px] print:w-auto print:max-w-[90%] print:object-contain"
        />
      </div>

      {/* Conteúdos da empresa à direita mantidos intactos */}
      <div className="descriptionNovo flex flex-col w-full items-center justify-center text-center text-slate-100 px-1 box-border print:flex print:flex-col print:w-full print:items-center print:justify-center print:text-center print:px-1">
        <div className="eaNameNovo flex justify-center items-center w-full print:flex print:justify-center print:items-center">
          <img
            src={IMAGE_PATHS.nameUri}
            alt="Elétrica & Art"
            className="nameImgNovo w-full max-w-[290px] h-auto object-contain mb-0.5 block print:max-w-[270px] print:mb-0.5"
          />
        </div>

        <span className="cnpjTextNovo text-[clamp(9px,1.8cqw,11.5px)] font-bold text-white block leading-tight print:text-[10.5px] print:leading-tight">
          CNPJ 32.858.892/0001-52 - IM 67358/0001
        </span>

        <p className="addressTextNovo text-[clamp(8.5px,1.6cqw,10.5px)] my-0.5 text-slate-100 leading-tight print:text-[9.5px] print:leading-tight print:my-[1px]">
          Rua José Alves Maciel, 40 - Aviação <br />
          Praia Grande - São Paulo - SP - Cep 11702-440
        </p>

        <div className="contactsAreaNovo text-[clamp(8.5px,1.6cqw,10.5px)] text-slate-50 leading-[1.22] print:text-[9.5px] print:leading-[1.2]">
          <a
            href="tel:+5513997685853"
            className="contactLinkNovo text-inherit no-underline hover:text-white print:text-inherit print:no-underline"
          >
            <strong className="text-white font-bold">Fone </strong> ( 13 )
            99768-5853
          </a>{' '}
          <br />
          <a
            href="https://wa.me/5513997685853"
            className="contactLinkNovo text-inherit no-underline hover:text-white print:text-inherit print:no-underline"
          >
            <strong className="text-white font-bold">Whatsapp </strong> ( 13 )
            99768-5853
          </a>{' '}
          <br />
          <a
            href="mailto:eletrica.art.ltda@gmail.com"
            className="contactLinkNovo text-inherit no-underline hover:text-white print:text-inherit print:no-underline"
          >
            <strong className="text-white font-bold">E-mail </strong>{' '}
            eletrica.art.ltda@gmail.com
          </a>
        </div>
      </div>
    </View>
  );
};

export default EACardNovo;
