// import mongoose from 'mongoose';
// import { Class, IClass, DayOfWeek } from '../../models';
// import {
//     timeToMinutes,
//     isTimeBefore,
//     isTimeAfter,
//     getTimeAsDate,
//     isDateInRange
// } from '../../utils/dateUtils';

// // ============================================
// // Conflict Detection Service
// // ============================================

// export interface ConflictResult {
//     hasConflict: boolean;
//     conflicts: ConflictInfo[];
// }

// export interface ConflictInfo {
//     classId: string;
//     className: string;
//     date: Date;
//     startTime: string;
//     endTime: string;
//     instructor?: string;
//     room?: string;
//     conflictType: 'instructor' | 'room';
// }

// export class ConflictDetector {
//     /**
//      * Check for instructor conflicts
//      */
//     async checkInstructorConflict(
//         instructorId: string,
//         date: Date,
//         startTime: string,
//         endTime: string,
//         excludeClassId?: string
//     ): Promise<ConflictResult> {
//         const conflicts: ConflictInfo[] = [];

//         const query: any = {
//             instructorId: new mongoose.Types.ObjectId(instructorId),
//             isActive: true,
//             $or: [
//                 {
//                     classType: 'single',
//                     startDate: { $lte: date },
//                     endDate: { $gte: date }
//                 },
//                 {
//                     classType: 'recurring',
//                     'recurrence.endDate': { $gte: date }
//                 }
//             ]
//         };

//         if (excludeClassId) {
//             query._id = { $ne: new mongoose.Types.ObjectId(excludeClassId) };
//         }

//         const existingClasses = await Class.find(query);

//         for (const cls of existingClasses) {
//             const isConflict = this.checkTimeConflict(
//                 cls,
//                 date,
//                 startTime,
//                 endTime
//             );

//             if (isConflict) {
//                 conflicts.push({
//                     classId: cls._id.toString(),
//                     className: cls.name,
//                     date: date,
//                     startTime: cls.startTime,
//                     endTime: cls.endTime,
//                     conflictType: 'instructor'
//                 });
//             }
//         }

//         const instanceQuery: any = {
//             instructorId: new mongoose.Types.ObjectId(instructorId),
//             date: date,
//             status: { $ne: 'cancelled' },
//         };

//         if (excludeClassId) {
//             instanceQuery.parentClassId = { $ne: new mongoose.Types.ObjectId(excludeClassId) };
//         }

//         const instances = await ClassInstance.find(instanceQuery);

//         for (const instance of instances) {
//             if (this.timesOverlap(startTime, endTime, instance.startTime, instance.endTime)) {
//                 conflicts.push({
//                     classId: instance.parentClassId.toString(),
//                     className: 'Instance',
//                     date: date,
//                     startTime: instance.startTime,
//                     endTime: instance.endTime,
//                     conflictType: 'instructor'
//                 });
//             }
//         }

//         return {
//             hasConflict: conflicts.length > 0,
//             conflicts
//         };
//     }

//     /**
//      * Check for room conflicts
//      */
//     async checkRoomConflict(
//         roomId: string,
//         date: Date,
//         startTime: string,
//         endTime: string,
//         excludeClassId?: string
//     ): Promise<ConflictResult> {
//         const conflicts: ConflictInfo[] = [];

//         const query: any = {
//             roomId: new mongoose.Types.ObjectId(roomId),
//             isActive: true,
//             $or: [
//                 {
//                     classType: 'single',
//                     startDate: { $lte: date },
//                     endDate: { $gte: date }
//                 },
//                 {
//                     classType: 'recurring',
//                     'recurrence.endDate': { $gte: date }
//                 }
//             ]
//         };

//         if (excludeClassId) {
//             query._id = { $ne: new mongoose.Types.ObjectId(excludeClassId) };
//         }

//         const existingClasses = await Class.find(query);

//         for (const cls of existingClasses) {
//             const isConflict = this.checkTimeConflict(
//                 cls,
//                 date,
//                 startTime,
//                 endTime
//             );

//             if (isConflict) {
//                 conflicts.push({
//                     classId: cls._id.toString(),
//                     className: cls.name,
//                     date: date,
//                     startTime: cls.startTime,
//                     endTime: cls.endTime,
//                     conflictType: 'room'
//                 });
//             }
//         }

//         const instanceQuery: any = {
//             roomId: new mongoose.Types.ObjectId(roomId),
//             date: date,
//             status: { $ne: 'cancelled' },
//         };

//         if (excludeClassId) {
//             instanceQuery.parentClassId = { $ne: new mongoose.Types.ObjectId(excludeClassId) };
//         }

//         const instances = await ClassInstance.find(instanceQuery);

//         for (const instance of instances) {
//             if (this.timesOverlap(startTime, endTime, instance.startTime, instance.endTime)) {
//                 conflicts.push({
//                     classId: instance.parentClassId.toString(),
//                     className: 'Instance',
//                     date: date,
//                     startTime: instance.startTime,
//                     endTime: instance.endTime,
//                     conflictType: 'room'
//                 });
//             }
//         }

//         return {
//             hasConflict: conflicts.length > 0,
//             conflicts
//         };
//     }

//     /**
//      * Check for conflicts for a new class before creation
//      */
//     async checkClassConflicts(
//         instructorId: string,
//         roomId: string | undefined,
//         date: Date,
//         startTime: string,
//         endTime: string
//     ): Promise<ConflictResult[]> {
//         const results: ConflictResult[] = [];

//         const instructorConflict = await this.checkInstructorConflict(
//             instructorId,
//             date,
//             startTime,
//             endTime
//         );
//         results.push(instructorConflict);

//         if (roomId) {
//             const roomConflict = await this.checkRoomConflict(
//                 roomId,
//                 date,
//                 startTime,
//                 endTime
//             );
//             results.push(roomConflict);
//         }

//         return results;
//     }

//     /**
//      * Check time conflict for a recurring class
//      */
//     private checkTimeConflict(
//         cls: IClass,
//         targetDate: Date,
//         targetStartTime: string,
//         targetEndTime: string
//     ): boolean {
//         if (cls.classType === 'single') {
//             if (!isDateInRange(targetDate, cls.startDate, cls.endDate || cls.startDate)) {
//                 return false;
//             }
//             return this.timesOverlap(
//                 targetStartTime,
//                 targetEndTime,
//                 cls.startTime,
//                 cls.endTime
//             );
//         } else if (cls.recurrence) {
//             const matchesRecurrence = this.dateMatchesRecurrence(
//                 targetDate,
//                 cls.recurrence
//             );

//             if (!matchesRecurrence) {
//                 return false;
//             }

//             if (cls.recurrence.timeSlots) {
//                 return cls.recurrence.timeSlots.some(slot =>
//                     this.timesOverlap(
//                         targetStartTime,
//                         targetEndTime,
//                         slot.startTime,
//                         slot.endTime
//                     )
//                 );
//             }

//             return this.timesOverlap(
//                 targetStartTime,
//                 targetEndTime,
//                 cls.startTime,
//                 cls.endTime
//             );
//         }

//         return false;
//     }

//     /**
//      * Check if a date matches the recurrence pattern
//      */
//     private dateMatchesRecurrence(
//         date: Date,
//         recurrence: IClass['recurrence']
//     ): boolean {
//         if (!recurrence) return false;

//         switch (recurrence.pattern) {
//             case 'daily':
//                 return true;

//             case 'weekly':
//                 if (recurrence.daysOfWeek) {
//                     const dayOfWeek = date.getDay() as DayOfWeek;
//                     return recurrence.daysOfWeek.includes(dayOfWeek);
//                 }
//                 return false;

//             case 'monthly':
//                 if (recurrence.dayOfMonth) {
//                     const dayOfMonth = date.getDate();
//                     return recurrence.dayOfMonth.includes(dayOfMonth);
//                 }
//                 return false;

//             case 'custom':
//                 return true;

//             default:
//                 return false;
//         }
//     }

//     /**
//      * Check if two time ranges overlap
//      */
//     private timesOverlap(
//         start1: string,
//         end1: string,
//         start2: string,
//         end2: string
//     ): boolean {
//         const start1Min = timeToMinutes(start1);
//         const end1Min = timeToMinutes(end1);
//         const start2Min = timeToMinutes(start2);
//         const end2Min = timeToMinutes(end2);

//         return start1Min < end2Min && end1Min > start2Min;
//     }
// }

// export const conflictDetector = new ConflictDetector();
