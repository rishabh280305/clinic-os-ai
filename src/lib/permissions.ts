import type{ClinicRole}from"./session";import type{QueueAction}from"./queue";
export const canManageSchedule=(role:ClinicRole)=>role==="receptionist"||role==="admin";
export const canUseQueue=(role:ClinicRole,action:QueueAction)=>role==="admin"||(role==="receptionist"&&action==="check_in")||(role==="doctor"&&(action==="start_consultation"||action==="complete"));
export const canWriteNotes=(role:ClinicRole)=>role==="doctor";
export const canReadNotes=(role:ClinicRole)=>role==="doctor"||role==="admin";
export const canViewAnalytics=(role:ClinicRole)=>role==="admin";
