/**
 * Enumerated values of the Atlas database, as Zod schemas.
 * They mirror the SQL `CHECK` constraints in `supabase/migrations/` one to one,
 * so TypeScript code and the database accept exactly the same values (RNF-07).
 * Spec (Spanish) names are noted next to each enum for traceability.
 */
import { z } from "zod";

/** mision.destino */
export const destinationSchema = z.enum(["low_earth_orbit", "moon", "mars"]);

/** mision.fase_actual / medicion.fase_mision */
export const missionPhaseSchema = z.enum([
  "preparation",
  "outbound_transit",
  "surface",
  "return_transit",
  "post_flight",
]);

/** perfil.rol */
export const profileRoleSchema = z.enum(["astronaut", "flight_surgeon"]);

/** indicador.sistema_codigo — the six dashboard groups (spec M02). */
export const systemCodeSchema = z.enum([
  "cardiovascular",
  "bone_muscle",
  "neuro_ocular",
  "behavioral_sleep",
  "immune_metabolic",
  "environment_radiation",
]);

/** indicador.codigo — the ten base indicators. */
export const indicatorCodeSchema = z.enum([
  "heart_rate",
  "systolic_pressure",
  "diastolic_pressure",
  "glucose",
  "temperature",
  "sleep_hours",
  "mood",
  "bone_density",
  "eye_exam",
  "radiation_dose",
]);

/** indicador.tipo_entrada */
export const inputTypeSchema = z.enum(["number", "scale", "text"]);

/** indicador.frecuencia_sugerida */
export const suggestedFrequencySchema = z.enum(["continuous_telemetry", "daily", "weekly", "monthly"]);

/** linea_base.origen */
export const baselineSourceSchema = z.enum(["calculated", "manual"]);

/** chequeo.estado */
export const checkupStatusSchema = z.enum(["in_progress", "completed", "abandoned"]);

/** medicion.estado_semaforo / chequeo.resultado_global — the traffic light. */
export const trafficLightSchema = z.enum(["green", "yellow", "red"]);

/** medicion.origen (RN-15) */
export const measurementOriginSchema = z.enum(["manual", "simulated"]);

/** alerta.tipo */
export const alertTypeSchema = z.enum(["value", "trend"]);

/** alerta.nivel */
export const alertLevelSchema = z.enum(["yellow", "red"]);

/** alerta.estado */
export const alertStatusSchema = z.enum(["active", "attended", "dismissed"]);

/** escenario_incidente.codigo */
export const scenarioCodeSchema = z.enum(["fainting_gravity", "chest_pain", "solar_storm"]);

/** escenario_incidente.pasos_json[].tipo (RN-13: never drugs or treatments) */
export const scenarioStepTypeSchema = z.enum([
  "documented_action",
  "verification",
  "data_entry",
  "escalation",
]);

/** incidente.estado */
export const incidentStatusSchema = z.enum(["open", "closed"]);

/** mensaje.tipo */
export const messageTypeSchema = z.enum([
  "message",
  "checkup_report",
  "incident_report",
  "critical_alert",
  "reply",
]);

/** mensaje.prioridad */
export const messagePrioritySchema = z.enum(["normal", "high", "urgent"]);

/** mensaje_ia.rol */
export const aiMessageRoleSchema = z.enum(["user", "assistant"]);

/** articulo_biblioteca.categoria */
export const articleCategorySchema = z.enum(["indicator", "hazard", "risk", "technology", "system"]);

export type TrafficLight = z.infer<typeof trafficLightSchema>;
export type IndicatorCode = z.infer<typeof indicatorCodeSchema>;
export type SystemCode = z.infer<typeof systemCodeSchema>;
export type MissionPhase = z.infer<typeof missionPhaseSchema>;
