module.exports = (obj,label) => {
    const json = {
        blocks: [ obj.message.blocks[0] , obj.message.blocks[1],
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `:information_source: ${label} priority added to issue by <@${obj.user.id}>`,
            }
        }
        ],
    };
    return json;
};