import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="pt-BR">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta
            name="description"
            content="Gere sua receita com base em ingredientes que você tem em casa."
          />
          <meta property="og:site_name" content="receitas.vercel.app" />
          <meta
            property="og:description"
            content="Gere sua receita com base em ingredientes que você tem em casa."
          />
          <meta property="og:title" content="Gerador de Receitas" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Gerador de Receitas" />
          <meta
            name="twitter:description"
            content="Gere sua receita com base em ingredientes que você tem em casa."
          />
          <meta
            property="og:image"
            content="https://receitas.vercel.app/og-image.png"
          />
          <meta
            name="twitter:image"
            content="https://receitas.vercel.app/og-image.png"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
