import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: "Helvetica" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  section: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "bold", marginBottom: 12 },
  detailRow: { flexDirection: "row", marginBottom: 6 },
  detailLabel: { width: "30%", fontWeight: "bold" },
  detailValue: { width: "70%" },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    paddingVertical: 6,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  colDate: { width: "12%" },
  colTime: { width: "15%" },
  colTeacher: { width: "16%" },
  colEmail: { width: "20%" },
  colStatus: { width: "12%" },
  colPurpose: { width: "25%" },
  cellText: { fontSize: 8 },
  footer: { marginTop: 30, fontSize: 8, textAlign: "center" },
})

const safe = (v: any) => (v === null || v === undefined ? "—" : String(v))

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString() : "—"

const formatTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—"

export default function HallBookingReportPDF({ hall }: { hall: any }) {
  const bookings = hall.bookings ?? []

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Hall Booking Report</Text>

        {/* Hall Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Hall Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>{safe(hall.name)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{safe(hall.location)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Department:</Text>
            <Text style={styles.detailValue}>
              {safe(hall.department?.name)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Capacity:</Text>
            <Text style={styles.detailValue}>
              {safe(hall.seating_capacity)}
            </Text>
          </View>
        </View>

        {/* Bookings */}
        <View style={styles.section}>
          <Text style={styles.label}>Booking History</Text>

          <View style={styles.tableHeader}>
            <Text style={styles.colDate}>Date</Text>
            <Text style={styles.colTime}>Time</Text>
            <Text style={styles.colTeacher}>Teacher</Text>
            <Text style={styles.colEmail}>Email</Text>
            <Text style={styles.colStatus}>Status</Text>
            <Text style={styles.colPurpose}>Purpose</Text>
          </View>

          {bookings.length === 0 && (
            <Text style={styles.cellText}>No bookings found.</Text>
          )}

          {bookings.map((b: any) => (
            <View key={b.id} style={styles.tableRow}>
              <Text style={styles.colDate}>
                {formatDate(b.booking_date)}
              </Text>
              <Text style={styles.colTime}>
                {formatTime(b.start_time)} – {formatTime(b.end_time)}
              </Text>
              <Text style={styles.colTeacher}>
                {safe(b.teacher?.name)}
              </Text>
              <Text style={styles.colEmail}>
                {safe(b.teacher?.email)}
              </Text>
              <Text style={styles.colStatus}>{safe(b.status)}</Text>
              <Text style={styles.colPurpose}>{safe(b.purpose)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Generated on {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  )
}
