import mongoose, { Document, Schema } from 'mongoose';

export interface IInstructor extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specialization?: string;
    bio?: string;
    avatar?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const InstructorSchema = new Schema<IInstructor>(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters'],
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            unique: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        phone: {
            type: String,
            trim: true,
            match: [/^\+?[\d\s-]+$/, 'Please provide a valid phone number'],
        },
        specialization: {
            type: String,
            trim: true,
            maxlength: [200, 'Specialization cannot exceed 200 characters'],
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [1000, 'Bio cannot exceed 1000 characters'],
        },
        avatar: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
InstructorSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });
InstructorSchema.index({ isActive: 1 });
InstructorSchema.index({ email: 1 }, { unique: true });
InstructorSchema.index({ specialization: 1 });

// Virtual for full name
InstructorSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook to check email uniqueness
InstructorSchema.pre('save', async function (next) {
    if (this.isModified('email')) {
        const existing = await Instructor.findOne({
            email: this.email,
            _id: { $ne: this._id }
        });
        if (existing) {
            return next(new Error('Email already exists'));
        }
    }
    next();
});

export const Instructor = mongoose.model<IInstructor>('Instructor', InstructorSchema);
