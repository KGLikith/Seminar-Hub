import { Document, Page, Text } from "@react-pdf/renderer"

export default function TestPDF() {
  return (
    <Document>
      <Page>
        <Text>Hello</Text>
      </Page>
    </Document>
  )
}
