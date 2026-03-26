const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        action: {
            type: String,
            required: true, // e.g., 'Update Marks', 'Update Attendance', 'Deactivate User'
        },
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        targetName: { type: String },
        details: { type: String },
    },
    {
        timestamps: true,
    }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
