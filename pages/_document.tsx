// pages/_document.js

import { ColorModeScript, theme } from '@chakra-ui/react'
import NextDocument, { Html, Head, Main, NextScript } from 'next/document'


export default class Document extends NextDocument {
  render() {
    return (
      <Html lang='en'>
        <Head >
            <title> tutreg.com | Tutorial Registration Helper </title>
        </Head>
        <body>
          {/* 👇 Here's the script */}
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}