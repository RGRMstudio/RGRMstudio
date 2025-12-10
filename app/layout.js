import './globals.css'
import Script from 'next/script'  // ← ADDED THIS LINE

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>RGRMstudio</title>
        
        {/* Google Analytics - ADDED THIS SECTION */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-492YH65ZG1"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-492YH65ZG1');
            `,
          }}
        />
        
      </head>
      <body>{children}</body>
    </html>
  )
}
