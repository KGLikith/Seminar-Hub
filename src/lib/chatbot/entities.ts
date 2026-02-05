import {
  EquipmentType,
  ComponentType,
  MaintenanceRequestType,
  MaintenanceTarget,
  MaintenancePriority,
} from "@prisma/client"

export function extractEntities(message: string) {
  const msg = message.toLowerCase()

  const equipmentMap: Record<string, EquipmentType> = {
    projector: "projector",
    microphone: "microphone",
    mic: "microphone",
    speaker: "speaker",
    camera: "camera",
  }

  const componentMap: Record<string, ComponentType> = {
    screen: "screen",
    smartboard: "smartboard",
    ac: "ac",
    lighting: "lighting",
  }

  let equipmentType: EquipmentType | null = null
  let componentType: ComponentType | null = null

  for (const key in equipmentMap) {
    if (msg.includes(key)) equipmentType = equipmentMap[key]
  }

  for (const key in componentMap) {
    if (msg.includes(key)) componentType = componentMap[key]
  }

  const requestType: MaintenanceRequestType =
    msg.includes("install")
      ? "new_installation"
      : msg.includes("replace")
      ? "replacement"
      : msg.includes("inspect")
      ? "inspection"
      : "repair"

  const priority: MaintenancePriority =
    msg.includes("urgent") || msg.includes("immediately")
      ? "critical"
      : msg.includes("soon")
      ? "high"
      : "medium"

  return {
    equipmentType,
    componentType,
    requestType,
    priority,
  }
}
