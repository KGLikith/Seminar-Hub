import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 30,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#1f2937",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  reportMeta: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 6,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#16a34a",
    marginTop: 8,
    padding: 8,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#86efac",
    marginBottom: 8,
  },
  section: {
    marginBottom: 18,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 14,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 0,
    backgroundColor: "#f9fafb",
  },
  label: {
    fontWeight: "bold",
    fontSize: 11,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    color: "#1f2937",
    textTransform: "uppercase",
  },
  row: {
    marginBottom: 6,
    color: "#374151",
    fontSize: 10,
  },
  rowLabel: {
    fontWeight: "bold",
    color: "#1f2937",
  },
  timelineItem: {
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#9ca3af",
    color: "#374151",
    fontSize: 9,
  },
  image: {
    width: 180,
    height: 110,
    marginBottom: 10,
    marginTop: 8,
    objectFit: "cover",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 0,
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: "#1f2937",
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },
})

export default function BookingReportPDF({ booking }: { booking: any }) {
  return (
    <Document>
      <Page style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Seminar Hall Booking Report</Text>
          <Text style={styles.reportMeta}>
            Report ID: {booking.id} | Generated: {new Date().toLocaleString()}
          </Text>
          <Text
            style={[
              styles.statusBadge,
              booking.status === "approved"
                ? { color: "#16a34a", backgroundColor: "#ecfdf5", borderColor: "#86efac" }
                : booking.status === "pending"
                  ? { color: "#ca8a04", backgroundColor: "#fefce8", borderColor: "#facc15" }
                  : booking.status === "rejected"
                    ? { color: "#dc2626", backgroundColor: "#fef2f2", borderColor: "#fca5a5" }
                    : { color: "#0284c7", backgroundColor: "#f0f9ff", borderColor: "#7dd3fc" },
            ]}
          >
            Status: {booking.status.toUpperCase()}
          </Text>
        </View>

        {/* Hall Information */}
        <View style={styles.section}>
          <Text style={styles.label}>Hall Details</Text>
          <Text style={styles.row}>
            <Text style={styles.rowLabel}>Hall Name: </Text>
            {booking.hall.name}
          </Text>
          <Text style={styles.row}>
            <Text style={styles.rowLabel}>Location: </Text>
            {booking.hall.location}
          </Text>
        </View>

        {/* Booking Schedule */}
        <View style={styles.section}>
          <Text style={styles.label}>Booking Schedule</Text>
          <Text style={styles.row}>
            <Text style={styles.rowLabel}>Date: </Text>
            {new Date(booking.booking_date).toLocaleDateString()}
          </Text>
          <Text style={styles.row}>
            <Text style={styles.rowLabel}>Time: </Text>
            {new Date(booking.start_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })} – {new Date(booking.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
          {booking.expected_participants && (
            <Text style={styles.row}>
              <Text style={styles.rowLabel}>Expected Participants: </Text>
              {booking.expected_participants}
            </Text>
          )}
        </View>

        {/* Booked By */}
        <View style={styles.section}>
          <Text style={styles.label}>Booked By</Text>
          <Text style={styles.row}>
            <Text style={styles.rowLabel}>Name: </Text>
            {booking.teacher.name}
          </Text>
          <Text style={styles.row}>
            <Text style={styles.rowLabel}>Email: </Text>
            {booking.teacher.email}
          </Text>
        </View>

        {/* Booking Timeline */}
        {booking.logs && booking.logs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Booking Timeline</Text>
            {booking.logs.map((log: any) => (
              <Text key={log.id} style={styles.timelineItem}>
                <Text style={{ fontWeight: "bold" }}>
                  {new Date(log.created_at).toLocaleString()}
                </Text>
                {" – "} {log.action}
              </Text>
            ))}
          </View>
        )}

        {/* Session Summary */}
        {booking.session_summary && (
          <View style={styles.section}>
            <Text style={styles.label}>Session Summary</Text>
            <Text style={styles.row}>{booking.session_summary}</Text>
          </View>
        )}

        {/* Session Media */}
        {booking.media && booking.media.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Session Media</Text>
            {booking.media.map((m: any) => (
              <Image key={m.id} src={m.url || "/placeholder.svg"} style={styles.image} />
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          This is an official booking report generated by the Seminar Hall Management System.
          Timestamp: {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  )
}
