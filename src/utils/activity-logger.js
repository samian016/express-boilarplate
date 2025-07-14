const { ActivityModel } = require('../models');
function activityLogger(req, res, next) {
    if (!ActivityModel) return next();
    // Check if the route is related to login or signup
    if (req.path.includes('/users/seller/login') || req.path.includes('/login') || req.path.includes('/signup')) {
        let clientIp = req.ip || req.connection.remoteAddress || 'Unknown IP';
        clientIp = clientIp.includes('::ffff:') ? clientIp.split(':').pop() : clientIp;
        // Wrap the res.send method to capture the response data
        const originalSend = res.send;
        res.send = function (...args) {
            let data = args[0];

            if (!data) return originalSend.apply(res, args)
            else if (data) {
                data = JSON.parse(data);
                if (!data.user) return originalSend.apply(res, args);
                const { email, _id } = data?.user || {};
                if (!email || !_id) return originalSend.apply(res, args);
                const schema = ActivityModel({
                    activity: req.path.includes('login') ? "login" : "signup",
                    user: _id.toString(),
                    ipAddress: clientIp,
                    email: email,
                })
                schema.save();
            }
            return originalSend.apply(res, args);
        };
    }

    next();
};

module.exports = activityLogger;