import './globals.css'

export const metadata = {
  title: 'IEEE 802.15.6 DTMC Visualization',
  description: 'Interactive visualization of Discrete Time Markov Chain for IEEE 802.15.6 slotted Aloha protocol',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
