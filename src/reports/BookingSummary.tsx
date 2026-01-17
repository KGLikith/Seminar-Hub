import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 10,
    color: "#1e3a8a",
  },
  section: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    backgroundColor: "#f8fafc",
  },
  label: {
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#c7d2fe",
    color: "#1d4ed8",
  },
  row: {
    marginBottom: 6,
    color: "#374151",
  },
  highlight: {
    color: "#111827",
    fontWeight: "bold",
  },
  image: {
    width: 200,
    height: 120,
    marginBottom: 10,
    marginTop: 8,
    objectFit: "cover",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
  },
  footer: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    fontSize: 9,
    color: "#6b7280",
    textAlign: "center",
  },
})

export default function BookingReportPDF({ booking }: { booking: any }) {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Booking Report</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Booking Information</Text>
          <Text style={styles.row}>
            Status: <Text style={styles.highlight}>{booking.status}</Text>
          </Text>
          <Text style={styles.row}>
            Created At: {new Date(booking.created_at).toLocaleString()}
          </Text>
          {booking.approved_at && (
            <Text style={styles.row}>
              Approved At: {new Date(booking.approved_at).toLocaleString()}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Booked By</Text>
          <Text style={styles.row}>
            Name: <Text style={styles.highlight}>{booking.teacher.name}</Text>
          </Text>
          {booking.teacher.email && (
            <Text style={styles.row}>Email: {booking.teacher.email}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Hall</Text>
          <Text style={styles.row}>
            <Text style={styles.highlight}>{booking.hall.name}</Text>
          </Text>
          <Text style={styles.row}>{booking.hall.location}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Schedule</Text>
          <Text style={styles.row}>
            Date: {new Date(booking.booking_date).toDateString()}
          </Text>
          <Text style={styles.row}>
            Time:{" "}
            {new Date(booking.start_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            –{" "}
            {new Date(booking.end_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {booking.expected_participants && (
            <Text style={styles.row}>
              Participants: {booking.expected_participants}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Session Summary</Text>
          <Text style={styles.row}>
            {booking.session_summary || "Not provided"}
          </Text>
        </View>

        {booking.media?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Session Media</Text>
            {booking.media.map((m: any) => (
              <Image key={m.id} src={m.url} style={styles.image} />
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          Generated on {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  )
}
