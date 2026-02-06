CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('teacher','hod','tech_staff');

CREATE TYPE booking_status AS ENUM (
  'pending','approved','rejected','completed','cancelled'
);

CREATE TYPE equipment_condition AS ENUM (
  'active','not_working','under_repair'
);

CREATE TYPE hall_status AS ENUM (
  'available','booked','ongoing','maintenance'
);

CREATE TYPE component_type AS ENUM (
  'projector','screen','audio_system','microphone',
  'whiteboard','smartboard','ac','lighting','camera','other'
);

CREATE TYPE equipment_type AS ENUM (
  'speaker','microphone','mixer','amplifier','laptop','pointer',
  'cable','adapter','router','tablet','camera','stand','projector','other'
);

CREATE TYPE component_status AS ENUM (
  'operational','maintenance_required','under_maintenance','non_operational'
);

CREATE TYPE maintenance_request_status AS ENUM (
  'pending','approved','rejected','completed'
);

CREATE TYPE maintenance_target AS ENUM (
  'hall','equipment','component'
);

CREATE TYPE maintenance_request_type AS ENUM (
  'new_installation','repair','replacement',
  'inspection','calibration','preventive','general_issue'
);

CREATE TYPE maintenance_priority AS ENUM (
  'low','medium','high','critical'
);

CREATE TYPE maintenance_action AS ENUM (
  'created','inspected','repaired','replaced','calibrated',
  'cleaned','tested','marked_non_operational',
  'marked_operational','completed'
);

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  hod_id UUID UNIQUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  clerk_id TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  department_id UUID,
  user_id UUID UNIQUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (department_id)
    REFERENCES departments(id)
    ON DELETE SET NULL,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

ALTER TABLE departments
ADD CONSTRAINT fk_department_hod
FOREIGN KEY (hod_id)
REFERENCES profiles(id)
ON DELETE SET NULL;

CREATE TABLE user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (profile_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE,

  UNIQUE (profile_id, role)
);

CREATE TABLE seminar_halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  seating_capacity INT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  status hall_status DEFAULT 'available',
  department_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (department_id)
    REFERENCES departments(id)
);

CREATE TABLE hall_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (hall_id)
    REFERENCES seminar_halls(id)
    ON DELETE CASCADE
);

CREATE TABLE favorite_halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  hall_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (hall_id) REFERENCES seminar_halls(id) ON DELETE CASCADE,

  UNIQUE (user_id, hall_id)
);

CREATE TABLE hall_tech_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id UUID NOT NULL,
  tech_staff_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (hall_id) REFERENCES seminar_halls(id) ON DELETE CASCADE,
  FOREIGN KEY (tech_staff_id) REFERENCES profiles(id),

  UNIQUE (hall_id, tech_staff_id)
);

CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type equipment_type NOT NULL,
  serial_number TEXT,
  condition equipment_condition DEFAULT 'active',
  hall_id UUID NOT NULL,
  last_updated_by UUID,
  created_at TIMESTAMP DEFAULT now(),
  last_updated_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (hall_id) REFERENCES seminar_halls(id) ON DELETE CASCADE,
  FOREIGN KEY (last_updated_by) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE equipment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL,
  action maintenance_action NOT NULL,
  condition_after equipment_condition,
  notes TEXT,
  updated_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES profiles(id)
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_date DATE NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  purpose TEXT NOT NULL,
  permission_letter_url TEXT,
  status booking_status DEFAULT 'pending',
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  session_summary TEXT,
  ai_summary JSONB,
  expected_participants INT,
  special_requirements TEXT,
  hall_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  hod_id UUID,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (hall_id) REFERENCES seminar_halls(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (hod_id) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE booking_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  action TEXT NOT NULL,
  previous_status booking_status,
  new_status booking_status,
  notes TEXT,
  metadata JSONB,
  performed_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE booking_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  url TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE hall_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id UUID NOT NULL,
  name TEXT NOT NULL,
  type component_type NOT NULL,
  status component_status DEFAULT 'operational',
  location TEXT,
  installation_date DATE,
  last_maintenance TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (hall_id) REFERENCES seminar_halls(id) ON DELETE CASCADE
);

CREATE TABLE component_maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL,
  action maintenance_action NOT NULL,
  status_after component_status,
  notes TEXT,
  performed_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (component_id) REFERENCES hall_components(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id UUID NOT NULL,
  tech_staff_id UUID NOT NULL,
  component_id UUID,
  equipment_id UUID,
  target maintenance_target NOT NULL,
  requested_component_type component_type,
  requested_equipment_type equipment_type,
  request_type maintenance_request_type NOT NULL,
  priority maintenance_priority DEFAULT 'medium',
  status maintenance_request_status DEFAULT 'pending',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hod_id UUID,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (hall_id) REFERENCES seminar_halls(id) ON DELETE CASCADE,
  FOREIGN KEY (component_id) REFERENCES hall_components(id) ON DELETE SET NULL,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE SET NULL,
  FOREIGN KEY (tech_staff_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (hod_id) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL,
  related_booking_id UUID,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (related_booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_halls_updated
BEFORE UPDATE ON seminar_halls
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bookings_updated
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_components_updated
BEFORE UPDATE ON hall_components
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_maintenance_updated
BEFORE UPDATE ON maintenance_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
