const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        //  match: [/^\\w+([.-]?\\w+)*@\\w+([.-]?\\w+)*(\\.\\w{2,3})+$/, 'Please enter a valid email address']
    },
    mobile: {
        type: String,
        required: false,
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    password: {
        type: String,
        required: function () {
            return !this.isGoogle;
        },
        validate: {
            validator: function (v) {
                if (this.isGoogle) return true;
                return v && v.length >= 8;
            },
            message: 'Password must be at least 8 characters long'
        },
        maxlength: [128, 'Password cannot exceed 128 characters']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    photoUrl: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    },
    isGoogle: {
        type: Boolean,
        default: false
    },
    isGoogleAuthenticated: {
        type: Boolean,
        default: false
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    },
    refreshTokens: {
        type: [{
            token: { type: String },
            expiresAt: { type: Date },
            createdAt: { type: Date, default: Date.now },
            deviceInfo: { type: String, default: 'unknown' }
        }],
        default: []
    },
    passwordResetToken: {
        type: String,
        default: undefined
    },
    passwordResetExpires: {
        type: Date,
        default: undefined
    }
}, { timestamps: true });

// Add text index for search
userSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('User', userSchema);
