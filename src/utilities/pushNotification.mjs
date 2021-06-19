import {Expo} from "expo-server-sdk"
import logger from "./logger.mjs";

const expo = new Expo()

const checkNotificationStatus = (tickets) => {
    let receiptIds = []
    for(let ticket of tickets) {
        if(ticket.id) {
            receiptIds.push(ticket.id)
        }
        let receiptIdsChunck = expo.chunkPushNotificationReceiptIds(receiptIds);
        (async () => {
            for (let chunk of receiptIdsChunck) {
                try {
                    let receipts = expo.getPushNotificationReceiptsAsync(chunk)
                    console.log(receipts)
                    for(let receiptId in receipts) {
                        let {status, message, details} = receipts[receiptId]
                        if(status === 'ok') {
                            continue;
                        } else if (status === 'error') {
                            console.log(`error sending notification ${message}`)
                            logger.log(`error sending notification ${message}`)
                            if(details && details.error) {
                                console.log(`error is ${details.error}`)
                                logger.log(`error is ${details.error}`)
                            }
                        }

                    }
                } catch (e) {
                    console.log(e)
                    logger.log(e)
                }
            }
        })()
    }
}

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
        }
    }

}

const getUsersTokens = async (association) => {
    try {
        const assoUsers = await association.getUsers()
        const members = assoUsers.filter(memb => memb.member.relation.toLowerCase() !== 'ondemand')
        const tokens = members.map(user => user.pushNotificationToken)
        return tokens
    } catch (e) {
        logger.log(e)
    }
}
export {
    sendPushNotification,
    getUsersTokens
}


