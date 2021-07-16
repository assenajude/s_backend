import {Expo} from "expo-server-sdk"
import logger from "./logger.mjs";

const expo = new Expo()

const sendPushNotification = (message, userTokens, notifTitle, notifData) => {
    if(userTokens.length>0) {
        let messages = []
        for(let token of userTokens) {
            if(!Expo.isExpoPushToken(token)) {
                console.log(`Push token ${token} is not a good token`);
                logger.log(`Push token ${token} is not a good token`)
                continue;
            }
            messages.push({
                to: token,
                sound: 'default',
                title: notifTitle,
                body: message,
                data: notifData
            })

            let chunks = expo.chunkPushNotifications(messages);
            let tickets = [];
            (async () => {
                for (let chunk of chunks) {
                    try {
                        let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
                        tickets.push(...ticketChunk)
                    } catch (e) {
                        logger.log(e)
                    }
                }

            })();
            // checkNotificationStatus(tickets)

            let receiptIds = [];
            for (let ticket of tickets) {
                // NOTE: Not all tickets have IDs; for example, tickets for notifications
                // that could not be enqueued will have error information and no receipt ID.
                if (ticket.id) {
                    receiptIds.push(ticket.id);
                }
            }

            let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
            (async () => {
                // Like sending notifications, there are different strategies you could use
                // to retrieve batches of receipts from the Expo service.
                for (let chunk of receiptIdChunks) {
                    try {
                        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                        logger.log(receipts);

                        // The receipts specify whether Apple or Google successfully received the
                        // notification and information about an error, if one occurred.
                        for (let receiptId in receipts) {
                            let { status, message, details } = receipts[receiptId];
                            if (status === 'ok') {
                                continue;
                            } else if (status === 'error') {
                                logger.log(
                                    `There was an error sending a notification: ${message}`
                                );
                                if (details && details.error) {
                                    // The error codes are listed in the Expo documentation:
                                    // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                                    // You must handle the errors appropriately.
                                    logger.log(`The error code is ${details.error}`);
                                }
                            }
                        }
                    } catch (error) {
                        logger.log(error);
                    }
                }
            })();
        }
    }

}

const getUsersTokens = async (association) => {
    try {
        const assoUsers = await association.getUsers()
        const members = assoUsers.filter(memb => memb.member.relation.toLowerCase() !== 'ondemand' && memb.member.relation.toLowerCase() !== 'rejected')
        const tokens = members.map(user => user.pushNotificationToken)
        const validTokens = tokens.filter(token => token !== undefined && token !== null)
        return validTokens
    } catch (e) {
        logger.log(e)
    }
}
export {
    sendPushNotification,
    getUsersTokens
}


