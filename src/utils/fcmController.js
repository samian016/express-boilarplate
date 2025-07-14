function fcmController(getMessaging) {
    return function (tokens, event, data) {
        try {
            const messages = tokens.map((token) => ({
                notification: {
                    title: data?.type || "Notification",
                    body: data?.message || "Notification",
                },
                android: {
                    notification: {
                        sound: "default",
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            alert: {
                                title: data?.type || "Notification",
                                body: data?.message || "Notification",
                            },
                            sound: "default",
                        },
                    },
                },
                webpush: {
                    data: {
                        title: data?.type || "Notification",
                        body: data?.message || "Notification",
                        icon: data?.icon || "/path/to/default/icon.png", // Optional icon path
                    },
                },
                token: token,
            }));

            messages.forEach((message) => {
                getMessaging()
                    .send(message)
                    .then((response) => {
                        console.log('Successfully sent message:', response);
                    })
                    .catch((error) => {
                        console.error('Error sending message:', error.message);
                    });
            });
        } catch (err) {
            console.log(err);
        }
    }
}

exports.fcmController = fcmController;